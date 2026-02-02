import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName } = await req.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: "buren boglooroi" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "ene email ali hezeenii burtgeltei bn" },
        { status: 400 },
      );
    }

    const clerk = await clerkClient();
    await clerk.users.createUser({
      emailAddress: [email],
      skipPasswordChecks: true,
      skipPasswordRequirement: true,
      firstName,
      lastName,
    });

    return NextResponse.json({ message: "signup success" }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: "aldaa garlaa", error: error?.message },
      { status: 500 },
    );
  }
}
