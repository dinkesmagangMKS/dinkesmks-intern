import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Division
  const psdk = await prisma.division.findUnique({
    where: { name: "PSDK" },
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

  // Intern
  await prisma.user.upsert({
    where: { email: "intern2@ims.com" },
    update: {},
    create: {
      name: "Intern PSDK",
      email: "intern2@ims.com",
      password: hashedPassword,
      role: "INTERN",
      division_id: psdk?.id,
    },
  });

  console.log("Seed selesai");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });