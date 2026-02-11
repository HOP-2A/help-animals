import prisma from "@/lib/prisma";

import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: { postId: string } },
) {
  try {
    const body = await req.json();
    const { userId, type } = body;
    const { postId } = await context.params;

    const findPost = await prisma.helpAnimal.findUnique({
      where: { id: postId },
    });

    if (!findPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 500 });
    }

    const existingReaction = await prisma.reaction.findFirst({
      where: { userId, helpPostId: postId },
    });

    if (existingReaction) {
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });
      return NextResponse.json({ message: "remove like" });
    } else {
      const createReaction = await prisma.reaction.create({
        data: {
          userId,
          helpPostId: postId,
          type,
        },
      });

      return NextResponse.json({ message: "liked" }, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
