import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export const GET = async (
  req: Request,
  context: { params: Promise<{ userId: string }> },
) => {
  try {
    const { userId } = await context.params;

    const rescueAnimals = await prisma.helpAnimal.findMany({
      where: {
        userId,
      },
    });
    return NextResponse.json(rescueAnimals, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
};

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { postId, userId, status } = body;
    if (!postId || !userId || !status) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const helpAnimal = await prisma.helpAnimal.findUnique({
      where: {
        id: postId,
      },
    });

    if (userId !== helpAnimal?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedAnimal = await prisma.helpAnimal.update({
      where: {
        id: postId,
        userId,
      },
      data: {
        status,
      },
    });
    return NextResponse.json(updatedAnimal, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { postId, userId } = body;
    if (!postId || !userId) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const helpAnimal = await prisma.helpAnimal.findUnique({
      where: {
        id: postId,
      },
    });

    if (userId !== helpAnimal?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const deletedAnimal = await prisma.helpAnimal.delete({
      where: {
        id: postId,
        userId,
      },
    });
    return NextResponse.json(deletedAnimal, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
    ``;
  }
}
