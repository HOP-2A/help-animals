import { ExperienceExchange } from "./../../../../../node_modules/.prisma/client/index.d";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { experienceId } = body;

    if (!experienceId) {
      return NextResponse.json(
        { error: "experience id is required" },
        { status: 400 },
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        experienceId,
      },
      include: {
        user: true,
        reactions: true,
      },
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
