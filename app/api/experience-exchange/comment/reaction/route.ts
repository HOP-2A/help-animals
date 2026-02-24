import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, commentId, type } = await req.json();

    if (!commentId || !userId || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const isUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const alreadyLiked = await prisma.reaction.findFirst({
      where: {
        userId,
        commentId,
        type,
      },
    });

    if (alreadyLiked) {
      await prisma.reaction.delete({
        where: { id: alreadyLiked.id },
      });

      return NextResponse.json(
        { message: "Reaction removed" },
        { status: 200 },
      );
    }

    const reaction = await prisma.reaction.create({
      data: {
        userId,
        commentId,
        type,
      },
    });

    return NextResponse.json(reaction, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
