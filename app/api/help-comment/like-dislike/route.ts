import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, commentId, type } = body;

    const existing = await prisma.reaction.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (!existing) {
      const like = await prisma.reaction.create({
        data: {
          userId,
          commentId,
          type,
        },
      });
    } else if (existing.type === type) {
      const deleteLike = await prisma.reaction.delete({
        where: { id: existing.id },
      });
    } else {
      const switchLike = await prisma.reaction.update({
        where: { id: existing.id },
        data: { type },
      });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function GET() {
  try {
    const likes = await prisma.reaction.findMany({});
    return NextResponse.json(likes, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
