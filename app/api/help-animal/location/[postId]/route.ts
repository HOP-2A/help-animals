import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const GET = async (
  req: Request,
  context: { params: { postId: string } },
) => {
  const { postId } = await context.params;

  if (!postId) {
    return NextResponse.json({ error: "postId missing" }, { status: 400 });
  }
  try {
    const findPost = await prisma.helpAnimal.findUnique({
      where: { id: postId },
      include: {
        user: true,
      },
    });

    if (!findPost) {
      return NextResponse.json({ error: "Post not found" });
    }

    return NextResponse.json(findPost, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
};
