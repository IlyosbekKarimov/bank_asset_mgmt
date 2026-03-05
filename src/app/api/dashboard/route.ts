import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = session.user.organizationId;

    const [
        totalAssets,
        assignedAssets,
        inRepairAssets,
        assets,
        recentAuditLogs,
        departmentCounts,
        branchCount,
        userCount,
    ] = await Promise.all([
        prisma.asset.count({ where: { organizationId: orgId, deletedAt: null } }),
        prisma.asset.count({ where: { organizationId: orgId, status: "ASSIGNED", deletedAt: null } }),
        prisma.asset.count({ where: { organizationId: orgId, status: "IN_REPAIR", deletedAt: null } }),
        prisma.asset.findMany({
            where: { organizationId: orgId, deletedAt: null },
            select: {
                id: true,
                category: true,
                status: true,
                condition: true,
                purchasePrice: true,
                currentValue: true,
                warrantyUntil: true,
            },
        }),
        prisma.auditLog.findMany({
            where: { user: { organizationId: orgId } },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
                user: { select: { firstName: true, lastName: true, role: true } },
            },
        }),
        prisma.department.count({ where: { organizationId: orgId } }),
        prisma.branch.count({ where: { organizationId: orgId } }),
        prisma.user.count({ where: { organizationId: orgId } }),
    ]);

    // Calculate total value
    const totalValue = assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
    const totalPurchaseValue = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);

    // Assets by category
    const categoryMap: Record<string, number> = {};
    assets.forEach((a) => {
        categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
    });
    const assetsByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Assets by status
    const statusMap: Record<string, number> = {};
    assets.forEach((a) => {
        statusMap[a.status] = (statusMap[a.status] || 0) + 1;
    });
    const assetsByStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // Assets by condition
    const conditionMap: Record<string, number> = {};
    assets.forEach((a) => {
        conditionMap[a.condition] = (conditionMap[a.condition] || 0) + 1;
    });
    const assetsByCondition = Object.entries(conditionMap).map(([name, value]) => ({ name, value }));

    // Warranty alerts — expiring within 90 days
    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const warrantyExpiring = assets.filter(
        (a) => a.warrantyUntil && a.warrantyUntil > now && a.warrantyUntil < ninetyDaysFromNow
    ).length;

    return NextResponse.json({
        kpi: {
            totalAssets,
            assignedAssets,
            inRepairAssets,
            totalValue,
            totalPurchaseValue,
            departmentCount: departmentCounts,
            branchCount,
            userCount,
            warrantyExpiring,
        },
        charts: {
            assetsByCategory,
            assetsByStatus,
            assetsByCondition,
        },
        recentActivity: recentAuditLogs.map((log) => ({
            id: log.id,
            action: log.action,
            entityType: log.entityType,
            changes: log.changes,
            createdAt: log.createdAt,
            user: `${log.user.firstName} ${log.user.lastName}`,
            userRole: log.user.role,
        })),
    });
}
