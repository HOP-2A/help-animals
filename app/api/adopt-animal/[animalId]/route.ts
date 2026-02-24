import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  context: { params: { animalId: string } },
) => {
  try {
    const { animalId } = await context.params;

    if (!animalId) {
      return NextResponse.json({ error: "animalId missing" }, { status: 400 });
    }

    const animal = await prisma.adoptAnimal.findUnique({
      where: { id: animalId },
    });
    
    return NextResponse.json(animal, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
};
