import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orgId = session.user.organizationId;
    const branches = await prisma.branch.findMany({
        where: { organizationId: orgId },
        include: {
            _count: { select: { departments: true, users: true, assets: true } },
        },
        orderBy: { name: "asc" },
    });

    return NextResponse.json(branches);
}
