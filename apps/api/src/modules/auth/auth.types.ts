import type { Role } from '../../generated/prisma/client.js';

export type AuthUser = {
  sub: string;
  role: Role;
};
