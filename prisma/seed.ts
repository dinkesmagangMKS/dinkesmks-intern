import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Division
  const psdk = await prisma.division.upsert({
    where: { name: "PSDK" },
    update: {},
    create: {
      name: "PSDK",
    },
  });

  const yankes = await prisma.division.upsert({
    where: { name: "Pelayanan Kesehatan" },
    update: {},
    create: {
      name: "Pelayanan Kesehatan",
    },
  });

  const farmasi = await prisma.division.upsert({
    where: { name: "Farmasi" },
    update: {},
    create: {
      name: "Farmasi",
    },
  });

  const p2k = await prisma.division.upsert({
    where: { name: "P2K" },
    update: {},
    create: {
      name: "P2K",
    },
  });

  // Password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Super Admin
  await prisma.user.upsert({
    where: { email: "superadmin@ims.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@ims.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      is_first_login: false,
    },
  });

  console.log("Seed selesai");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });