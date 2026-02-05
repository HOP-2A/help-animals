import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName, birthdate } = await req.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    const clerk = await clerkClient();

    const clerkUser = await clerk.users.createUser({
      emailAddress: [email],
      skipPasswordChecks: true,
      skipPasswordRequirement: true,
      firstName,
      lastName,
    });

    const user = await prisma.user.create({
      data: { email, firstName, lastName, clerkId: clerkUser.id, birthdate },
    });

    return NextResponse.json(
      { message: "successfully registered" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
