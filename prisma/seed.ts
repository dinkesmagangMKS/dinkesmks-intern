import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Buat divisi
  const divisi = await Promise.all([
    prisma.division.upsert({
      where: { name: "Pelayanan Kesehatan" },
      update: {},
      create: { name: "Pelayanan Kesehatan" },
    }),
    prisma.division.upsert({
      where: { name: "PSDK" },
      update: {},
      create: { name: "PSDK" },
    }),
    prisma.division.upsert({
      where: { name: "P2P" },
      update: {},
      create: { name: "P2P" },
    }),
    prisma.division.upsert({
      where: { name: "Apotek" },
      update: {},
      create: { name: "Apotek" },
    }),
  ]);

  // Buat Super Admin
  const hashedPassword = await bcrypt.hash("superadmin123", 10);
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
  console.log("Super Admin: superadmin@ims.com / superadmin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());