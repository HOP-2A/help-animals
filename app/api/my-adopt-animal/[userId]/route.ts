import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  context: { params: { userId: string } },
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
    return NextResponse.json({ error: err }, { status: 500 });
  }
};

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId, adoptAnimalId } = body;

    if (!userId || !adoptAnimalId) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const adoptAnimal = await prisma.adoptAnimal.findUnique({
      where: { id: adoptAnimalId },
    });

    if (userId === adoptAnimal?.userId) {
      await prisma.adoptAnimal.delete({
        where: { id: adoptAnimalId },
      });

      return NextResponse.json(
        { message: "successfully deleted" },
        { status: 200 },
      );
    }
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
