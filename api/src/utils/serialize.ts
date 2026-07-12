import { Prisma } from "@prisma/client";

const toNumber = (value: unknown) => {
  if (value instanceof Prisma.Decimal) return value.toNumber();
  return value;
};

const toDate = (value: unknown) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
};

export function serialize<T>(input: T): T {
  if (Array.isArray(input)) return input.map((item) => serialize(item)) as T;
  if (!input || typeof input !== "object") return input;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === "passwordHash") continue;
    if (value instanceof Prisma.Decimal) out[key] = toNumber(value);
    else if (value instanceof Date) out[key] = toDate(value);
    else if (Array.isArray(value)) out[key] = value.map((item) => serialize(item));
    else if (value && typeof value === "object") out[key] = serialize(value);
    else out[key] = value;
  }
  return out as T;
}
