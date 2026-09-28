export function toman(value: { toNumber(): number } | number | string | null) {
  if (value == null) return null;
  return typeof value === 'object' ? value.toNumber() : Number(value);
}
