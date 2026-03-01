import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, parentCommentId, content } = await req.json();

    if (!parentCommentId || !userId || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const isUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        parentCommentId,
        content,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
