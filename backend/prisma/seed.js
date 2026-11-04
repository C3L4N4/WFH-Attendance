require('dotenv/config');

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const employeePassword = process.env.SEED_EMPLOYEE_PASSWORD;
  const hrdPassword = process.env.SEED_HRD_PASSWORD;

  if (!employeePassword || !hrdPassword) {
    throw new Error('Seed passwords are missing from .env');
  }

  // Create or update the employee record
  const employee = await prisma.employee.upsert({
    where: { employeeNumber: 'EMP001' },
    update: {},
    create: {
      employeeNumber: 'EMP001',
      fullName: 'Test Employee',
      department: 'Information Technology',
      position: 'Developer',
    },
  });

  // Hash the employee password
  const employeeHash = await bcrypt.hash(employeePassword, 12);

  // Create or update the employee login
  await prisma.user.upsert({
    where: { email: process.env.SEED_EMPLOYEE_EMAIL },
    update: {
      password: employeeHash,
      employeeId: employee.id,
      role: 'EMPLOYEE',
    },
    create: {
      email: process.env.SEED_EMPLOYEE_EMAIL,
      password: employeeHash,
      role: 'EMPLOYEE',
      employeeId: employee.id,
    },
  });

  // Hash the HRD password
  const hrdHash = await bcrypt.hash(hrdPassword, 12);

  // Create or update the HRD login
  await prisma.user.upsert({
    where: { email: process.env.SEED_HRD_EMAIL },
    update: {
      password: hrdHash,
      role: 'HRD',
      employeeId: null,
    },
    create: {
      email: process.env.SEED_HRD_EMAIL,
      password: hrdHash,
      role: 'HRD',
    },
  });

  console.log('Development accounts created successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });