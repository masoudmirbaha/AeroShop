import {
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service.js';
import {
  DisabledPaymentProvider,
  MockPaymentProvider,
  PAYMENTS_DISABLED_MESSAGE,
  type PaymentProvider,
} from '../payments/payment-provider.js';
import { OrdersService } from './orders.service.js';

type Product = {
  id: string;
  title: string;
  price: number;
  isPublished: boolean;
  files: { id: string }[];
  bundleItems: { product: { files: { id: string }[] } }[];
};
type CartItem = { id: string; cartId: string; productId: string; quantity: number };
type CartItemMatch = { id: string; quantity: number };

const CART_ID = 'cart-1';
const USER_ID = 'user-1';

function product(id: string, price: number, overrides: Partial<Product> = {}): Product {
  return {
    id,
    title: `Product ${id}`,
    price,
    isPublished: true,
    files: [{ id: `${id}-file` }],
    bundleItems: [],
    ...overrides,
  };
}

/**
 * In-memory stand-in for Prisma. Writes made inside `$transaction` are staged and only
 * committed when the callback resolves, so a thrown error discards every partial write,
 * mirroring an interactive transaction rollback. Transactions run one at a time, like the
 * row lock a second DELETE waits on in PostgreSQL.
 */
function fakeDb(products: Product[], cart: { productId: string; quantity: number }[]) {
  const catalog = new Map(products.map((p) => [p.id, p]));
  const state = {
    cartItems: cart.map<CartItem>((item, index) => ({
      id: `item-${index + 1}`,
      cartId: CART_ID,
      ...item,
    })),
    orders: [] as { id: string; status: string; subtotal: number; discount: number; total: number }[],
    payments: [] as { orderId: string; provider: string; status: string; amount: number }[],
    orderItems: [] as {
      id: string;
      orderId: string;
      productName: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }[],
    grants: new Map<string, { userId: string; productFileId: string; orderItemId: string }>(),
  };
  let sequence = 0;
  let queue: Promise<unknown> = Promise.resolve();

  const prisma = {
    cart: {
      findUnique: vi.fn(() =>
        Promise.resolve({
          id: CART_ID,
          userId: USER_ID,
          items: state.cartItems.map((item) => ({ ...item, product: catalog.get(item.productId)! })),
        }),
      ),
    },
    $transaction: vi.fn(<T>(callback: (tx: unknown) => Promise<T>) => {
      const run = queue.then(() => runTransaction(callback));
      queue = run.catch(() => undefined);
      return run;
    }),
  };

  async function runTransaction<T>(callback: (tx: unknown) => Promise<T>) {
    const deleted = new Set<string>();
    const orders: typeof state.orders = [];
    const payments: typeof state.payments = [];
    const orderItems: typeof state.orderItems = [];
    const grants = new Map(state.grants);

    const tx = {
      cartItem: {
        deleteMany: ({ where }: { where: { cartId: string; OR: CartItemMatch[] } }) => {
          const matches = state.cartItems.filter(
            (item) =>
              item.cartId === where.cartId &&
              !deleted.has(item.id) &&
              where.OR.some((m) => m.id === item.id && m.quantity === item.quantity),
          );
          for (const item of matches) deleted.add(item.id);
          return Promise.resolve({ count: matches.length });
        },
      },
      order: {
        create: ({ data }: { data: Record<string, unknown> }) => {
          const order = {
            id: `order-${++sequence}`,
            status: data['status'] as string,
            subtotal: data['subtotal'] as number,
            discount: data['discount'] as number,
            total: data['total'] as number,
          };
          orders.push(order);
          const payment = (data['payment'] as { create?: Omit<(typeof payments)[number], 'orderId'> })
            ?.create;
          if (payment) payments.push({ orderId: order.id, ...payment });
          return Promise.resolve(order);
        },
        findUniqueOrThrow: ({ where }: { where: { id: string } }) => {
          const order = orders.find((o) => o.id === where.id)!;
          const payment = payments.find((p) => p.orderId === order.id);
          return Promise.resolve({
            ...order,
            createdAt: new Date(),
            items: orderItems.filter((item) => item.orderId === order.id),
            payment: payment ? { id: `payment-${order.id}`, ...payment } : null,
          });
        },
      },
      orderItem: {
        create: ({ data }: { data: Omit<(typeof orderItems)[number], 'id'> }) => {
          const item = { id: `order-item-${++sequence}`, ...data };
          orderItems.push(item);
          return Promise.resolve(item);
        },
      },
      downloadGrant: {
        upsert: ({
          where,
          create,
        }: {
          where: { userId_productFileId: { userId: string; productFileId: string } };
          create: { userId: string; productFileId: string; orderItemId: string };
        }) => {
          const key = `${where.userId_productFileId.userId}:${where.userId_productFileId.productFileId}`;
          grants.set(key, { ...create });
          return Promise.resolve(grants.get(key));
        },
      },
    };

    const result = await callback(tx);
    state.cartItems = state.cartItems.filter((item) => !deleted.has(item.id));
    state.orders.push(...orders);
    state.payments.push(...payments);
    state.orderItems.push(...orderItems);
    state.grants = grants;
    return result;
  }

  return { prisma, state };
}

function service(prisma: unknown, payments: PaymentProvider) {
  return new OrdersService(prisma as PrismaService, payments);
}

describe('OrdersService.checkout', () => {
  describe('with payments disabled', () => {
    it('rejects a forged SUCCESS with 503 and writes nothing', async () => {
      const { prisma, state } = fakeDb([product('paid', 1000)], [{ productId: 'paid', quantity: 1 }]);
      const orders = service(prisma, new DisabledPaymentProvider());

      const attempt = orders.checkout(USER_ID, 'SUCCESS');

      await expect(attempt).rejects.toBeInstanceOf(ServiceUnavailableException);
      await expect(attempt).rejects.toThrow(PAYMENTS_DISABLED_MESSAGE);
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(state.orders).toHaveLength(0);
      expect(state.payments).toHaveLength(0);
      expect(state.grants.size).toBe(0);
      expect(state.cartItems).toHaveLength(1);
    });

    it('rejects a forged FAILED the same way, regardless of the client result', async () => {
      const { prisma, state } = fakeDb([product('paid', 1000)], [{ productId: 'paid', quantity: 2 }]);
      const orders = service(prisma, new DisabledPaymentProvider());

      await expect(orders.checkout(USER_ID, 'FAILED')).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
      expect(state.orders).toHaveLength(0);
      expect(state.payments).toHaveLength(0);
      expect(state.grants.size).toBe(0);
      expect(state.cartItems).toEqual([
        { id: 'item-1', cartId: CART_ID, productId: 'paid', quantity: 2 },
      ]);
    });

    it('completes a free-only cart as PAID with grants and no payment row', async () => {
      const { prisma, state } = fakeDb(
        [product('free-a', 0), product('free-b', 0)],
        [
          { productId: 'free-a', quantity: 1 },
          { productId: 'free-b', quantity: 1 },
        ],
      );
      const orders = service(prisma, new DisabledPaymentProvider());

      const order = await orders.checkout(USER_ID, 'FAILED');

      expect(order.status).toBe('PAID');
      expect(order.total).toBe(0);
      expect(order.payment).toBeNull();
      expect(state.payments).toHaveLength(0);
      expect([...state.grants.keys()].sort()).toEqual([
        `${USER_ID}:free-a-file`,
        `${USER_ID}:free-b-file`,
      ]);
      expect(state.cartItems).toHaveLength(0);
    });

    it('rejects a mixed free and paid cart and writes nothing', async () => {
      const { prisma, state } = fakeDb(
        [product('free', 0), product('paid', 500)],
        [
          { productId: 'free', quantity: 1 },
          { productId: 'paid', quantity: 1 },
        ],
      );
      const orders = service(prisma, new DisabledPaymentProvider());

      await expect(orders.checkout(USER_ID, 'SUCCESS')).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
      expect(state.orders).toHaveLength(0);
      expect(state.payments).toHaveLength(0);
      expect(state.grants.size).toBe(0);
      expect(state.cartItems).toHaveLength(2);
    });
  });

  describe('with mock payments', () => {
    it('creates a PAID order, MOCK payment and grants on simulated success', async () => {
      const bundle = product('bundle', 2000, {
        bundleItems: [{ product: { files: [{ id: 'inner-file' }] } }],
      });
      const { prisma, state } = fakeDb([bundle], [{ productId: 'bundle', quantity: 1 }]);
      const orders = service(prisma, new MockPaymentProvider());

      const order = await orders.checkout(USER_ID, 'SUCCESS');

      expect(order.status).toBe('PAID');
      expect(order.payment).toMatchObject({ provider: 'MOCK', status: 'SUCCESS', amount: 2000 });
      expect([...state.grants.keys()].sort()).toEqual([
        `${USER_ID}:bundle-file`,
        `${USER_ID}:inner-file`,
      ]);
      expect(state.cartItems).toHaveLength(0);
    });

    it('records a FAILED order without grants and keeps the cart on simulated failure', async () => {
      const { prisma, state } = fakeDb([product('paid', 1000)], [{ productId: 'paid', quantity: 1 }]);
      const orders = service(prisma, new MockPaymentProvider());

      const order = await orders.checkout(USER_ID, 'FAILED');

      expect(order.status).toBe('FAILED');
      expect(order.payment).toMatchObject({ provider: 'MOCK', status: 'FAILED' });
      expect(state.grants.size).toBe(0);
      expect(state.cartItems).toHaveLength(1);
    });
  });

  describe('duplicate and concurrent checkout', () => {
    it('lets only one of two concurrent checkouts of the same cart succeed', async () => {
      const { prisma, state } = fakeDb([product('paid', 1000)], [{ productId: 'paid', quantity: 1 }]);
      const orders = service(prisma, new MockPaymentProvider());

      const results = await Promise.allSettled([
        orders.checkout(USER_ID, 'SUCCESS'),
        orders.checkout(USER_ID, 'SUCCESS'),
      ]);

      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      const rejected = results.filter((r) => r.status === 'rejected');
      expect(rejected).toHaveLength(1);
      expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(ConflictException);
      expect(state.orders).toHaveLength(1);
      expect(state.payments).toHaveLength(1);
      expect(state.orderItems).toHaveLength(1);
      expect(state.grants.size).toBe(1);
    });

    it('rolls back every write when the cart changed after it was priced', async () => {
      const { prisma, state } = fakeDb(
        [product('a', 1000), product('b', 500)],
        [
          { productId: 'a', quantity: 1 },
          { productId: 'b', quantity: 1 },
        ],
      );
      const orders = service(prisma, new MockPaymentProvider());
      // The cart is read and priced, then one item's quantity changes before the transaction.
      const readCart = prisma.cart.findUnique.getMockImplementation()!;
      prisma.cart.findUnique.mockImplementationOnce(async () => {
        const snapshot = await readCart();
        state.cartItems[1] = { ...state.cartItems[1]!, quantity: 3 };
        return snapshot;
      });

      await expect(orders.checkout(USER_ID, 'SUCCESS')).rejects.toBeInstanceOf(ConflictException);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(state.orders).toHaveLength(0);
      expect(state.payments).toHaveLength(0);
      expect(state.orderItems).toHaveLength(0);
      expect(state.grants.size).toBe(0);
      expect(state.cartItems.map((item) => item.id)).toEqual(['item-1', 'item-2']);
    });
  });

  it('still rejects unpublished products before payment', async () => {
    const { prisma, state } = fakeDb(
      [product('hidden', 1000, { isPublished: false })],
      [{ productId: 'hidden', quantity: 1 }],
    );
    const charge = vi.fn();
    const orders = service(prisma, { charge } as unknown as PaymentProvider);

    await expect(orders.checkout(USER_ID, 'SUCCESS')).rejects.toBeInstanceOf(BadRequestException);
    expect(charge).not.toHaveBeenCalled();
    expect(state.orders).toHaveLength(0);
  });

  it('rejects an empty cart with 400 and writes nothing', async () => {
    const { prisma, state } = fakeDb([], []);
    const charge = vi.fn();
    const orders = service(prisma, { charge } as unknown as PaymentProvider);

    await expect(orders.checkout(USER_ID, 'SUCCESS')).rejects.toBeInstanceOf(BadRequestException);
    expect(charge).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(state.orders).toHaveLength(0);
    expect(state.payments).toHaveLength(0);
    expect(state.grants.size).toBe(0);
  });

  it('does not create another order or grant on a second checkout after success', async () => {
    const { prisma, state } = fakeDb([product('free', 0)], [{ productId: 'free', quantity: 1 }]);
    const orders = service(prisma, new DisabledPaymentProvider());

    await orders.checkout(USER_ID, 'SUCCESS');
    await expect(orders.checkout(USER_ID, 'SUCCESS')).rejects.toBeInstanceOf(BadRequestException);

    expect(state.orders).toHaveLength(1);
    expect(state.orderItems).toHaveLength(1);
    expect(state.grants.size).toBe(1);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  describe('free-cart classification', () => {
    it('rejects a negative price instead of letting a paid item net to zero', async () => {
      const { prisma, state } = fakeDb(
        [product('paid', 1000), product('broken', -1000)],
        [
          { productId: 'paid', quantity: 1 },
          { productId: 'broken', quantity: 1 },
        ],
      );
      const charge = vi.fn();
      const orders = service(prisma, { charge } as unknown as PaymentProvider);

      await expect(orders.checkout(USER_ID, 'SUCCESS')).rejects.toBeInstanceOf(BadRequestException);
      expect(charge).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(state.orders).toHaveLength(0);
      expect(state.grants.size).toBe(0);
      expect(state.cartItems).toHaveLength(2);
    });

    it('rejects a zero-subtotal cart that holds a priced item', async () => {
      // A corrupt zero quantity would make the paid line total zero.
      const { prisma, state } = fakeDb(
        [product('free', 0), product('paid', 1000)],
        [
          { productId: 'free', quantity: 1 },
          { productId: 'paid', quantity: 0 },
        ],
      );
      const charge = vi.fn();
      const orders = service(prisma, { charge } as unknown as PaymentProvider);

      await expect(orders.checkout(USER_ID, 'SUCCESS')).rejects.toBeInstanceOf(BadRequestException);
      expect(charge).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(state.orders).toHaveLength(0);
      expect(state.grants.size).toBe(0);
    });
  });
});
