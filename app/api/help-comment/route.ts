import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, helpPostId, content, parentCommentId } = body;

    if (!userId || !helpPostId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        helpPostId,
        userId,
        content,
        parentCommentId,
      },
    });

    return NextResponse.json(comment, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

