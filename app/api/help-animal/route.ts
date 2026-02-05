import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { location, description, images, status, userId, condition } = body;

    if (
      !location ||
      !images ||
      !userId ||
      !description ||
      !condition ||
      !status
    ) {
      return NextResponse.json({ error: "Missing field" });
    }

    const isUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!isUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const createdHelpAnimal = await prisma.helpAnimal.create({
      data: {
        location,
        description,
        images,
        status,
        condition,
        userId,
      },
    });
    return NextResponse.json(createdHelpAnimal, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId, postId } = body;

    if (!userId || !postId) {
      return NextResponse.json({ error: "Missing field" });
    }

    const isUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!isUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPost = await prisma.helpAnimal.findUnique({
      where: {
        id: postId,
      },
    });

    if (!isPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const deletedHelpAnimal = await prisma.helpAnimal.delete({
      where: {
        id: postId,
      },
    });

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const helpAnimals = await prisma.helpAnimal.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(helpAnimals, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
