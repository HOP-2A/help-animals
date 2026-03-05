import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
) => {
  try {
    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "userId missing" }, { status: 400 });
    }

    const adoptAnimal = await prisma.adoptAnimal.findMany({
      where: { userId },
    });

    return NextResponse.json(adoptAnimal, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, adoptAnimalId } = body;

    if (!userId || !adoptAnimalId) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const adoptAnimal = await prisma.adoptAnimal.findUnique({
      where: { id: adoptAnimalId },
    });

    if (!adoptAnimal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    if (userId !== adoptAnimal.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.adoptAnimal.delete({
      where: { id: adoptAnimalId },
    });

    return NextResponse.json(
      { message: "Successfully deleted" },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
