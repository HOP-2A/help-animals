import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "experience id is required" },
        { status: 400 },
      );
    }

    const experiences = await prisma.experienceExchange.findMany({
      where: {
        id,
      },
    });

    return NextResponse.json(experiences, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
