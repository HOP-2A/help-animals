import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id, userId } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const isUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const experience = await prisma.experienceExchange.findUnique({
      where: { id},
    });

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    if (experience.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    const deletedExperience =
      await prisma.experienceExchange.delete({
        where: { id },
      });

    return NextResponse.json("deleted experience", { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete experience" },
      { status: 500 }
    );
  }
}
