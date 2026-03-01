import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { clerkId: string } },
) {
  const { clerkId } = params;

  if (!clerkId) {
    return new Response("Missing clerkId", { status: 400 });
  }

  try {
    const userData = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
