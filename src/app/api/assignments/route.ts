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

    const assignments = await prisma.assetAssignment.findMany({
        where,
        include: {
            asset: { select: { name: true, assetTag: true, category: true } },
            assignedToUser: { select: { firstName: true, lastName: true, employeeId: true } },
            assignedByUser: { select: { firstName: true, lastName: true } },
        },
        orderBy: { assignedAt: "desc" },
    });

    return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { assetId, assignedToUserId, notes } = await req.json();

    try {
        const assignment = await prisma.assetAssignment.create({
            data: {
                assetId,
                assignedToUserId,
                assignedBy: session.user.id,
                notes,
            },
        });

        await prisma.asset.update({
            where: { id: assetId },
            data: { status: "ASSIGNED" },
        });

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "ASSIGN",
                entityType: "AssetAssignment",
                entityId: assignment.id,
                changes: `Assigned asset to user`,
                assetId,
            },
        });

        return NextResponse.json(assignment, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to create assignment";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
