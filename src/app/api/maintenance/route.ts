import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orgId = session.user.organizationId;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {
        asset: { organizationId: orgId },
    };
    if (status) where.status = status;

    const records = await prisma.maintenanceRecord.findMany({
        where,
        include: {
            asset: { select: { name: true, assetTag: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { updateAssetStatus, ...createData } = body;

    try {
        const record = await prisma.maintenanceRecord.create({
            data: {
                ...createData,
                performedBy: session.user.firstName + " " + session.user.lastName,
            },
        });

        if (updateAssetStatus) {
            await prisma.asset.update({
                where: { id: body.assetId },
                data: { status: "IN_REPAIR", condition: "FOR_REPAIR" },
            });
        }

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "MAINTENANCE_ADD",
                entityType: "MaintenanceRecord",
                entityId: record.id,
                changes: `Added maintenance: ${body.maintenanceType} for asset`,
                assetId: body.assetId,
            },
        });

        return NextResponse.json(record, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to create record";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
