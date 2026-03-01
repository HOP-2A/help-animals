import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { parentCommentId } = body;

    if (!parentCommentId) {
      return NextResponse.json(
        { error: "parentCommendId id is required" },
        { status: 400 },
      );
    }

    const replies = await prisma.comment.findMany({
      where: {
        parentCommentId,
      },
      include: {
        user: true,
        reactions: true,
      },
    });

    return NextResponse.json(replies, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
