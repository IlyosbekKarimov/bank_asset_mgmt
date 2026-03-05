import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const asset = await prisma.asset.findFirst({
        where: { id, organizationId: session.user.organizationId, deletedAt: null },
        include: {
            branch: true,
            department: true,
            createdBy: { select: { firstName: true, lastName: true, email: true } },
            assignments: {
                include: {
                    assignedToUser: { select: { firstName: true, lastName: true, employeeId: true } },
                    assignedByUser: { select: { firstName: true, lastName: true } },
                },
                orderBy: { assignedAt: "desc" },
                take: 10,
            },
            maintenance: {
                orderBy: { createdAt: "desc" },
                take: 10,
            },
            auditLogs: {
                include: { user: { select: { firstName: true, lastName: true } } },
                orderBy: { createdAt: "desc" },
                take: 20,
            },
            documents: {
                include: { uploadedBy: { select: { firstName: true, lastName: true } } },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    return NextResponse.json(asset);
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.role;
    if (!["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.asset.findFirst({
        where: { id, organizationId: session.user.organizationId, deletedAt: null },
    });

    if (!existing) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    try {
        const asset = await prisma.asset.update({
            where: { id },
            data: body,
        });

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "UPDATE",
                entityType: "Asset",
                entityId: id,
                oldValues: JSON.parse(JSON.stringify(existing)),
                newValues: JSON.parse(JSON.stringify(body)),
                changes: `Updated asset: ${asset.name} (${asset.assetTag})`,
                assetId: id,
            },
        });

        return NextResponse.json(asset);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to update asset";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.role;
    if (!["SUPER_ADMIN", "ADMIN"].includes(role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.asset.findFirst({
        where: { id, organizationId: session.user.organizationId, deletedAt: null },
    });

    if (!existing) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    // Soft delete
    await prisma.asset.update({
        where: { id },
        data: { deletedAt: new Date() },
    });

    await prisma.auditLog.create({
        data: {
            userId: session.user.id,
            action: "DELETE",
            entityType: "Asset",
            entityId: id,
            changes: `Soft-deleted asset: ${existing.name} (${existing.assetTag})`,
            assetId: id,
        },
    });

    return NextResponse.json({ message: "Asset deleted" });
}
