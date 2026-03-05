import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log("🌱 Seeding database...\n");

    // ── Organization ──────────────────────────────────────────
    const org = await prisma.organization.upsert({
        where: { name: "Capital Trust Bank" },
        update: {},
        create: {
            name: "Capital Trust Bank",
            taxId: "12-3456789",
            address: "100 Financial District, Suite 2000, New York, NY 10005",
            phone: "+1 (212) 555-0100",
            email: "admin@capitaltrust.bank",
        },
    });
    console.log("✅ Organization created:", org.name);

    // ── Branches ──────────────────────────────────────────────
    const mainBranch = await prisma.branch.upsert({
        where: { code: "HQ-001" },
        update: {},
        create: {
            name: "Headquarters",
            code: "HQ-001",
            address: "100 Financial District, Suite 2000, New York, NY 10005",
            phone: "+1 (212) 555-0101",
            organizationId: org.id,
        },
    });

    const downtownBranch = await prisma.branch.upsert({
        where: { code: "DT-002" },
        update: {},
        create: {
            name: "Downtown Branch",
            code: "DT-002",
            address: "250 Broadway, New York, NY 10007",
            phone: "+1 (212) 555-0102",
            organizationId: org.id,
        },
    });
    console.log("✅ Branches created:", mainBranch.name, ",", downtownBranch.name);

    // ── Departments ───────────────────────────────────────────
    const itDept = await prisma.department.upsert({
        where: { organizationId_name: { organizationId: org.id, name: "Information Technology" } },
        update: {},
        create: {
            name: "Information Technology",
            code: "IT",
            budget: 500000,
            organizationId: org.id,
            branchId: mainBranch.id,
        },
    });

    const financeDept = await prisma.department.upsert({
        where: { organizationId_name: { organizationId: org.id, name: "Finance & Accounting" } },
        update: {},
        create: {
            name: "Finance & Accounting",
            code: "FIN",
            budget: 300000,
            organizationId: org.id,
            branchId: mainBranch.id,
        },
    });

    const hrDept = await prisma.department.upsert({
        where: { organizationId_name: { organizationId: org.id, name: "Human Resources" } },
        update: {},
        create: {
            name: "Human Resources",
            code: "HR",
            budget: 150000,
            organizationId: org.id,
            branchId: mainBranch.id,
        },
    });

    const secDept = await prisma.department.upsert({
        where: { organizationId_name: { organizationId: org.id, name: "Security & Compliance" } },
        update: {},
        create: {
            name: "Security & Compliance",
            code: "SEC",
            budget: 250000,
            organizationId: org.id,
            branchId: mainBranch.id,
        },
    });
    console.log("✅ Departments created:", itDept.name, ",", financeDept.name, ",", hrDept.name, ",", secDept.name);

    // ── Users ─────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash("Admin@2026!", 12);

    const adminUser = await prisma.user.upsert({
        where: { email: "admin@capitaltrust.bank" },
        update: {},
        create: {
            email: "admin@capitaltrust.bank",
            employeeId: "EMP-000001",
            firstName: "System",
            lastName: "Administrator",
            phone: "+1 (212) 555-0200",
            position: "IT Director",
            role: "SUPER_ADMIN",
            password: hashedPassword,
            organizationId: org.id,
            departmentId: itDept.id,
            branchId: mainBranch.id,
        },
    });

    const managerPassword = await bcrypt.hash("Manager@2026!", 12);
    const managerUser = await prisma.user.upsert({
        where: { email: "j.smith@capitaltrust.bank" },
        update: {},
        create: {
            email: "j.smith@capitaltrust.bank",
            employeeId: "EMP-000002",
            firstName: "James",
            lastName: "Smith",
            phone: "+1 (212) 555-0201",
            position: "IT Manager",
            role: "MANAGER",
            password: managerPassword,
            organizationId: org.id,
            departmentId: itDept.id,
            branchId: mainBranch.id,
            managerId: adminUser.id,
        },
    });

    const employeePassword = await bcrypt.hash("Employee@2026!", 12);
    await prisma.user.upsert({
        where: { email: "s.johnson@capitaltrust.bank" },
        update: {},
        create: {
            email: "s.johnson@capitaltrust.bank",
            employeeId: "EMP-000003",
            firstName: "Sarah",
            lastName: "Johnson",
            phone: "+1 (212) 555-0202",
            position: "Financial Analyst",
            role: "EMPLOYEE",
            password: employeePassword,
            organizationId: org.id,
            departmentId: financeDept.id,
            branchId: mainBranch.id,
            managerId: managerUser.id,
        },
    });

    await prisma.user.upsert({
        where: { email: "m.williams@capitaltrust.bank" },
        update: {},
        create: {
            email: "m.williams@capitaltrust.bank",
            employeeId: "EMP-000004",
            firstName: "Michael",
            lastName: "Williams",
            phone: "+1 (212) 555-0203",
            position: "Security Auditor",
            role: "AUDITOR",
            password: employeePassword,
            organizationId: org.id,
            departmentId: secDept.id,
            branchId: mainBranch.id,
        },
    });
    console.log("✅ Users created (admin, manager, employee, auditor)");

    // ── Assets ────────────────────────────────────────────────
    const assets: Prisma.AssetCreateInput[] = [
        { name: "Dell Latitude 7440", assetTag: "AST-IT-00001", serialNumber: "DL7440-2026-001", category: "IT", subCategory: "Laptop", brand: "Dell", model: "Latitude 7440", purchaseDate: new Date("2025-06-15"), purchasePrice: 1850.00, currentValue: 1480.00, warrantyUntil: new Date("2028-06-15"), vendor: "Dell Technologies", invoiceNumber: "INV-2025-0847", status: "ASSIGNED", condition: "GOOD", location: "Floor 12, IT Department", floor: "12", room: "12-A", branch: { connect: { id: mainBranch.id } }, department: { connect: { id: itDept.id } }, organization: { connect: { id: org.id } }, createdBy: { connect: { id: adminUser.id } } },
        { name: "HP LaserJet Pro MFP M428", assetTag: "AST-PR-00002", serialNumber: "HP-M428-2025-001", category: "PRINTER", subCategory: "Multifunction Printer", brand: "HP", model: "LaserJet Pro MFP M428fdn", purchaseDate: new Date("2025-03-20"), purchasePrice: 450.00, currentValue: 380.00, warrantyUntil: new Date("2027-03-20"), vendor: "HP Inc.", invoiceNumber: "INV-2025-0512", status: "ASSIGNED", condition: "GOOD", location: "Floor 12, Print Room", floor: "12", room: "12-PR", branch: { connect: { id: mainBranch.id } }, department: { connect: { id: itDept.id } }, organization: { connect: { id: org.id } }, createdBy: { connect: { id: adminUser.id } } },
        { name: "Cisco Catalyst 9300", assetTag: "AST-NW-00003", serialNumber: "CSC-9300-2024-001", category: "NETWORK", subCategory: "Managed Switch", brand: "Cisco", model: "Catalyst 9300-48P", purchaseDate: new Date("2024-11-10"), purchasePrice: 8500.00, currentValue: 7200.00, warrantyUntil: new Date("2029-11-10"), vendor: "Cisco Systems", invoiceNumber: "INV-2024-1102", status: "REGISTERED", condition: "NEW", location: "Server Room, Rack A3", floor: "B1", room: "SR-01", branch: { connect: { id: mainBranch.id } }, department: { connect: { id: itDept.id } }, organization: { connect: { id: org.id } }, createdBy: { connect: { id: adminUser.id } } },
        { name: "Dell PowerEdge R750", assetTag: "AST-SV-00004", serialNumber: "DPE-R750-2025-001", category: "SERVER", subCategory: "Rack Server", brand: "Dell", model: "PowerEdge R750xs", purchaseDate: new Date("2025-01-05"), purchasePrice: 12500.00, currentValue: 11000.00, warrantyUntil: new Date("2030-01-05"), vendor: "Dell Technologies", invoiceNumber: "INV-2025-0023", status: "REGISTERED", condition: "NEW", location: "Server Room, Rack B1", floor: "B1", room: "SR-01", branch: { connect: { id: mainBranch.id } }, department: { connect: { id: itDept.id } }, organization: { connect: { id: org.id } }, createdBy: { connect: { id: adminUser.id } } },
        { name: "Herman Miller Aeron Chair", assetTag: "AST-FN-00005", serialNumber: "HM-AERON-2025-001", category: "FURNITURE", subCategory: "Executive Chair", brand: "Herman Miller", model: "Aeron Remastered", purchaseDate: new Date("2025-02-01"), purchasePrice: 1395.00, currentValue: 1200.00, warrantyUntil: new Date("2037-02-01"), vendor: "Herman Miller", invoiceNumber: "INV-2025-0101", status: "ASSIGNED", condition: "NEW", location: "Floor 15, Executive Suite", floor: "15", room: "15-EX", branch: { connect: { id: mainBranch.id } }, department: { connect: { id: financeDept.id } }, organization: { connect: { id: org.id } }, createdBy: { connect: { id: adminUser.id } } },
        { name: "Hikvision DS-2CD2386G2", assetTag: "AST-SC-00006", serialNumber: "HK-2386-2024-001", category: "SECURITY", subCategory: "IP Camera", brand: "Hikvision", model: "DS-2CD2386G2-ISU/SL", purchaseDate: new Date("2024-08-15"), purchasePrice: 320.00, currentValue: 250.00, warrantyUntil: new Date("2027-08-15"), vendor: "Hikvision Digital Technology", invoiceNumber: "INV-2024-0654", status: "REGISTERED", condition: "GOOD", location: "Lobby, Entrance A", floor: "1", room: "LOBBY", branch: { connect: { id: mainBranch.id } }, department: { connect: { id: secDept.id } }, organization: { connect: { id: org.id } }, createdBy: { connect: { id: adminUser.id } } },
        { name: "NCR SelfServ 80 ATM", assetTag: "AST-TM-00007", serialNumber: "NCR-SS80-2023-001", category: "TERMINAL", subCategory: "ATM Terminal", brand: "NCR", model: "SelfServ 80", purchaseDate: new Date("2023-05-20"), purchasePrice: 35000.00, currentValue: 28000.00, warrantyUntil: new Date("2028-05-20"), vendor: "NCR Corporation", invoiceNumber: "INV-2023-0312", status: "ASSIGNED", condition: "GOOD", location: "Ground Floor, ATM Lobby", floor: "G", room: "ATM-01", branch: { connect: { id: downtownBranch.id } }, department: { connect: { id: financeDept.id } }, organization: { connect: { id: org.id } }, createdBy: { connect: { id: adminUser.id } } },
        { name: "Dell UltraSharp U2723QE", assetTag: "AST-IT-00008", serialNumber: "DU-2723-2025-001", category: "IT", subCategory: "Monitor", brand: "Dell", model: "UltraSharp U2723QE 27\"", purchaseDate: new Date("2025-04-01"), purchasePrice: 620.00, currentValue: 520.00, warrantyUntil: new Date("2028-04-01"), vendor: "Dell Technologies", invoiceNumber: "INV-2025-0290", status: "ASSIGNED", condition: "GOOD", location: "Floor 12, Desk 12-A-05", floor: "12", room: "12-A", branch: { connect: { id: mainBranch.id } }, department: { connect: { id: itDept.id } }, organization: { connect: { id: org.id } }, createdBy: { connect: { id: adminUser.id } } },
        { name: "Steelcase Think Desk", assetTag: "AST-OF-00009", serialNumber: "SC-THINK-2025-001", category: "OFFICE", subCategory: "Standing Desk", brand: "Steelcase", model: "Think Adjustable Desk", purchaseDate: new Date("2025-01-15"), purchasePrice: 980.00, currentValue: 850.00, warrantyUntil: new Date("2030-01-15"), vendor: "Steelcase Inc.", invoiceNumber: "INV-2025-0055", status: "IN_REPAIR", condition: "FOR_REPAIR", location: "Floor 10, HR Office", floor: "10", room: "10-HR", branch: { connect: { id: mainBranch.id } }, department: { connect: { id: hrDept.id } }, organization: { connect: { id: org.id } }, createdBy: { connect: { id: adminUser.id } } },
        { name: "Toyota Corolla Fleet Vehicle", assetTag: "AST-VH-00010", serialNumber: "TOY-COR-2024-001", category: "VEHICLE", subCategory: "Sedan", brand: "Toyota", model: "Corolla 2024 LE", purchaseDate: new Date("2024-03-10"), purchasePrice: 24500.00, currentValue: 21000.00, warrantyUntil: new Date("2027-03-10"), vendor: "Toyota Financial Services", invoiceNumber: "INV-2024-0188", status: "ASSIGNED", condition: "GOOD", location: "Parking Garage, Level B2, Spot 15", floor: "B2", room: "GARAGE", branch: { connect: { id: mainBranch.id } }, department: { connect: { id: hrDept.id } }, organization: { connect: { id: org.id } }, createdBy: { connect: { id: adminUser.id } } },
    ];

    for (const assetData of assets) {
        const tag = assetData.assetTag;
        const existing = await prisma.asset.findUnique({ where: { assetTag: tag } });
        if (!existing) {
            await prisma.asset.create({ data: assetData });
        }
    }
    console.log(`✅ ${assets.length} assets created across all categories`);

    // ── Audit Logs ────────────────────────────────────────────
    const auditEntries = [
        { action: "CREATE" as const, entityType: "Organization", entityId: org.id, changes: "Created organization Capital Trust Bank" },
        { action: "CREATE" as const, entityType: "User", entityId: adminUser.id, changes: "Created admin user System Administrator" },
        { action: "CREATE" as const, entityType: "Asset", entityId: "bulk", changes: "Bulk imported 10 initial assets" },
        { action: "LOGIN" as const, entityType: "User", entityId: adminUser.id, changes: "Admin logged in from seed script" },
    ];

    for (const entry of auditEntries) {
        await prisma.auditLog.create({
            data: {
                userId: adminUser.id,
                ...entry,
                ipAddress: "127.0.0.1",
                userAgent: "Seed Script",
            },
        });
    }
    console.log("✅ Audit log entries created");

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("──────────────────────────────────────");
    console.log("Admin:    admin@capitaltrust.bank / Admin@2026!");
    console.log("Manager:  j.smith@capitaltrust.bank / Manager@2026!");
    console.log("Employee: s.johnson@capitaltrust.bank / Employee@2026!");
    console.log("Auditor:  m.williams@capitaltrust.bank / Employee@2026!");
    console.log("──────────────────────────────────────");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Seed failed:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
