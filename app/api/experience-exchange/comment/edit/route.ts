import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, content } = body;
    if (!id) {
      return NextResponse.json(
        { error: "comment id required" },
        { status: 400 },
      );
    }
    const comment = await prisma.comment.findUnique({
      where: { id },
    });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    const data: Prisma.CommentUpdateInput = {};

    if (content !== undefined) data.content = content;

    const updatedComment = await prisma.comment.update({
      where: { id },
      data,
    });
    return NextResponse.json(updatedComment, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
