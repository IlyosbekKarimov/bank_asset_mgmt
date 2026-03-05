import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const condition = searchParams.get("condition") || "";
    const branchId = searchParams.get("branchId") || "";
    const departmentId = searchParams.get("departmentId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const orgId = session.user.organizationId;

    const where: Record<string, unknown> = {
        organizationId: orgId,
        deletedAt: null,
    };

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { assetTag: { contains: search, mode: "insensitive" } },
            { serialNumber: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
            { model: { contains: search, mode: "insensitive" } },
        ];
    }

    if (category) where.category = category;
    if (status) where.status = status;
    if (condition) where.condition = condition;
    if (branchId) where.branchId = branchId;
    if (departmentId) where.departmentId = departmentId;

    const [assets, total] = await Promise.all([
        prisma.asset.findMany({
            where,
            include: {
                branch: { select: { name: true, code: true } },
                department: { select: { name: true } },
                createdBy: { select: { firstName: true, lastName: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.asset.count({ where }),
    ]);

    return NextResponse.json({
        assets,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.role;
    if (!["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    try {
        const asset = await prisma.asset.create({
            data: {
                ...body,
                organizationId: session.user.organizationId,
                createdById: session.user.id,
            },
        });

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "CREATE",
                entityType: "Asset",
                entityId: asset.id,
                newValues: body,
                changes: `Created asset: ${asset.name} (${asset.assetTag})`,
            },
        });

        return NextResponse.json(asset, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to create asset";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
