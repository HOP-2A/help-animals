import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, experienceId, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "user not" }, { status: 400 });
    }

    const isUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!isUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const CommentExperience = await prisma.comment.create({
      data: {
        experienceId,
        content,
        userId,
      },
    });

    return NextResponse.json(CommentExperience, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
