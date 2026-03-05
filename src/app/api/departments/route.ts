import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orgId = session.user.organizationId;
    const departments = await prisma.department.findMany({
        where: { organizationId: orgId },
        include: {
            branch: { select: { name: true } },
            _count: { select: { users: true, assets: true } },
        },
        orderBy: { name: "asc" },
    });

    return NextResponse.json(departments);
}
