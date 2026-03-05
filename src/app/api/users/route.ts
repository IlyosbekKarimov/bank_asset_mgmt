import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orgId = session.user.organizationId;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = { organizationId: orgId };
    if (search) {
        where.OR = [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { employeeId: { contains: search, mode: "insensitive" } },
        ];
    }

    const users = await prisma.user.findMany({
        where,
        select: {
            id: true, email: true, employeeId: true, firstName: true, lastName: true,
            phone: true, position: true, role: true, isActive: true, lastLoginAt: true, createdAt: true,
            department: { select: { name: true } },
            branch: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const hashedPassword = await bcrypt.hash(body.password || "Welcome@2026!", 12);

    try {
        const user = await prisma.user.create({
            data: {
                ...body,
                password: hashedPassword,
                organizationId: session.user.organizationId,
            },
        });
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "CREATE",
                entityType: "User",
                entityId: user.id,
                changes: `Created user: ${user.firstName} ${user.lastName} (${user.role})`,
            },
        });
        return NextResponse.json(user, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to create user";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
