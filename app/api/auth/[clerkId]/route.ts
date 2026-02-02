import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  context: Promise<{ params: { clerkId: string } }>,
) => {
  const { params } = await context;
  const { clerkId } = params;

  try {
    const userData = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message }, { status: 500 });
  }
};
