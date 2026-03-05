import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: Role;
            employeeId: string;
            organizationId: string;
            departmentId: string | null;
            branchId: string | null;
            position: string | null;
        };
    }

    interface User {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: Role;
        employeeId: string;
        organizationId: string;
        departmentId: string | null;
        branchId: string | null;
        position: string | null;
    }
}

declare module "next-auth" {
    interface JWT {
        id: string;
        role: Role;
        firstName: string;
        lastName: string;
        employeeId: string;
        organizationId: string;
        departmentId: string | null;
        branchId: string | null;
        position: string | null;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) {
                    return null;
                }

                // Check if account is locked
                if (user.lockedUntil && user.lockedUntil > new Date()) {
                    throw new Error("Account is locked. Please try again later.");
                }

                // Check if account is active
                if (!user.isActive) {
                    throw new Error("Account is deactivated. Contact your administrator.");
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    // Increment login attempts
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            loginAttempts: { increment: 1 },
                            // Lock after 5 failed attempts for 15 minutes
                            ...(user.loginAttempts >= 4
                                ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }
                                : {}),
                        },
                    });

                    // Log failed login
                    await prisma.auditLog.create({
                        data: {
                            userId: user.id,
                            action: "FAILED_LOGIN",
                            entityType: "User",
                            entityId: user.id,
                            changes: `Failed login attempt (${user.loginAttempts + 1}/5)`,
                            ipAddress: "unknown",
                        },
                    });

                    return null;
                }

                // Reset login attempts on success and update last login
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        loginAttempts: 0,
                        lockedUntil: null,
                        lastLoginAt: new Date(),
                    },
                });

                // Log successful login
                await prisma.auditLog.create({
                    data: {
                        userId: user.id,
                        action: "LOGIN",
                        entityType: "User",
                        entityId: user.id,
                        changes: "User logged in successfully",
                    },
                });

                return {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    employeeId: user.employeeId,
                    organizationId: user.organizationId,
                    departmentId: user.departmentId,
                    branchId: user.branchId,
                    position: user.position,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                token.role = user.role;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.employeeId = user.employeeId;
                token.organizationId = user.organizationId;
                token.departmentId = user.departmentId;
                token.branchId = user.branchId;
                token.position = user.position;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.role = token.role as Role;
            session.user.firstName = token.firstName as string;
            session.user.lastName = token.lastName as string;
            session.user.employeeId = token.employeeId as string;
            session.user.organizationId = token.organizationId as string;
            session.user.departmentId = token.departmentId as string | null;
            session.user.branchId = token.branchId as string | null;
            session.user.position = token.position as string | null;
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60, // 8 hours (bank standard)
    },
    secret: process.env.AUTH_SECRET,
});
