import { prisma } from "../../db/prisma.js";
import { serialize } from "../../utils/serialize.js";

export async function get() {
  const settings = await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, depotName: "TransitOps Central Depot", currency: "INR", distanceUnit: "km" },
  });
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
  return { settings: serialize(settings), roles: serialize(roles) };
}

export async function update(data: { depotName?: string; currency?: string; distanceUnit?: string }) {
  const settings = await prisma.setting.upsert({
    where: { id: 1 },
    create: { id: 1, depotName: data.depotName ?? "TransitOps Central Depot", currency: data.currency ?? "INR", distanceUnit: data.distanceUnit ?? "km" },
    update: data,
  });
  return serialize(settings);
}
