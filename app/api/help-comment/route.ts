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

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { commentId, userId } = body;

    if (!commentId || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.userId !== userId) {
      return NextResponse.json({ error: "Cannot delete" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Comment deleted" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { commentId, userId, content } = body;

    if (!commentId || !userId || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.userId !== userId) {
      return NextResponse.json({ error: "Cannot edit" }, { status: 403 });
    }

    const editComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
      },
    });

    return NextResponse.json(editComment, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
