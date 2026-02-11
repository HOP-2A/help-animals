import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { helpPostId } = body;

    if (!helpPostId) {
      return NextResponse.json(
        { error: "helpPostId required" },
        { status: 400 },
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        helpPostId,
        parentCommentId: null,
      },
      include: {
        user: true,
        replies: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

