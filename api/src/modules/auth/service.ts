import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../utils/http.js";
import { serialize } from "../../utils/serialize.js";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user || user.status !== "Active") {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: { increment: 1 } },
    });
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lastLoginAt: new Date() },
  });

  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role.name }, env.JWT_SECRET, {
    expiresIn: "8h",
  });

  return {
    token,
    user: serialize({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      status: user.status,
    }),
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!user) throw new AppError(401, "Authentication required", "AUTH_REQUIRED");
  return serialize({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.name,
    status: user.status,
  });
}
