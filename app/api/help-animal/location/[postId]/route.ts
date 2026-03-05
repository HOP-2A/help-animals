import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ postId: string }> },
) => {
  try {
    const { postId } = await context.params;

    if (!postId) {
      return NextResponse.json({ error: "postId missing" }, { status: 400 });
    }

    const findPost = await prisma.helpAnimal.findUnique({
      where: { id: postId },
      include: {
        user: true,
      },
    });

    if (!findPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(findPost, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
