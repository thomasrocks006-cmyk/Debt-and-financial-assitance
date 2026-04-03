import { PrismaClient, UserRole, CaseStatus, DebtType, DebtStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@recoveryos.com.au" },
    update: {},
    create: {
      email: "admin@recoveryos.com.au",
      name: "System Admin",
      role: UserRole.ADMIN,
    },
  });

  // Create case manager
  const caseManager = await prisma.user.upsert({
    where: { email: "case.manager@recoveryos.com.au" },
    update: {},
    create: {
      email: "case.manager@recoveryos.com.au",
      name: "Jane Smith",
      role: UserRole.CASE_MANAGER,
    },
  });

  // Create demo client user
  const clientUser = await prisma.user.upsert({
    where: { email: "demo.client@example.com" },
    update: {},
    create: {
      email: "demo.client@example.com",
      name: "Alex Demo",
      role: UserRole.CLIENT,
    },
  });

  // Create client profile
  const clientProfile = await prisma.clientProfile.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      phone: "0400 000 000",
      address: "123 Demo Street, Melbourne VIC 3000",
      preferredContact: "email",
      safeToContact: true,
      vulnerabilityFlags: [],
    },
  });

  // Create income source
  await prisma.incomeSource.create({
    data: {
      clientId: clientProfile.id,
      source: "Employment",
      amount: 3200,
      frequency: "monthly",
      isStable: true,
    },
  });

  // Create expense items
  await prisma.expenseItem.createMany({
    data: [
      {
        clientId: clientProfile.id,
        category: "rent",
        amount: 1600,
        frequency: "monthly",
        isEssential: true,
      },
      {
        clientId: clientProfile.id,
        category: "food",
        amount: 600,
        frequency: "monthly",
        isEssential: true,
      },
      {
        clientId: clientProfile.id,
        category: "utilities",
        amount: 200,
        frequency: "monthly",
        isEssential: true,
      },
      {
        clientId: clientProfile.id,
        category: "transport",
        amount: 150,
        frequency: "monthly",
        isEssential: true,
      },
    ],
  });

  // Create debt accounts
  const creditCard = await prisma.debtAccount.create({
    data: {
      clientId: clientProfile.id,
      creditorName: "ANZ Bank",
      debtType: DebtType.CREDIT_CARD,
      originalBalance: 8000,
      currentBalance: 7500,
      minimumPayment: 150,
      interestRate: 19.99,
      arrearsAmount: 300,
      status: DebtStatus.ACTIVE,
    },
  });

  const personalLoan = await prisma.debtAccount.create({
    data: {
      clientId: clientProfile.id,
      creditorName: "Latitude Finance",
      debtType: DebtType.PERSONAL_LOAN,
      originalBalance: 12000,
      currentBalance: 9800,
      minimumPayment: 280,
      interestRate: 14.99,
      arrearsAmount: 0,
      status: DebtStatus.ACTIVE,
    },
  });

  // Create a case
  const demoCase = await prisma.case.create({
    data: {
      clientId: clientProfile.id,
      caseManagerId: caseManager.id,
      status: CaseStatus.ASSESSMENT,
      recoveryStage: "stabilise",
    },
  });

  // Assign debts to case
  await prisma.debtAccount.updateMany({
    where: { clientId: clientProfile.id },
    data: { caseId: demoCase.id },
  });

  // Create triage assessment
  await prisma.triageAssessment.create({
    data: {
      caseId: demoCase.id,
      crisisLevel: "MEDIUM",
      serviceStreams: ["DEBT_MANAGEMENT"],
      urgencyDays: 30,
      humanRequired: false,
      selfServeEligible: true,
      debtStress: 7,
      rentalStress: 5,
      utilityStress: 3,
      incomeShock: false,
      safetyRisk: false,
      gamblingRisk: false,
      foodInsecurity: false,
    },
  });

  console.log("Seed complete:", {
    admin: admin.email,
    caseManager: caseManager.email,
    client: clientUser.email,
    case: demoCase.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
