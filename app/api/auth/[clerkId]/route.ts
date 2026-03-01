import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: Promise<{ params: { clerkId: string } }>,
) => {
  const { params } = await context;
  const { clerkId } = await params;

  try {
    const { clerkId } = await context.params;

    if (!clerkId) {
      return new Response("Missing clerkId", { status: 400 });
    }

    const userData = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(userData);
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
