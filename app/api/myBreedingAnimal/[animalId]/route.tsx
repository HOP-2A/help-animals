import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  context: { params: { animalId: string } },
) => {
  try {
    const { animalId } = await context.params;

    if (!animalId) {
      return NextResponse.json({ error: "Id missing" }, { status: 400 });
    }

    const adoptAnimal = await prisma.adoptAnimal.findUnique({
      where: { id: animalId },
      include: {
        adoptionForms: true,
      },
    });

    return NextResponse.json(adoptAnimal, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
};

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, animalId, status, formId } = body;

    if (!userId || !animalId || !status || !formId) {
      return NextResponse.json({ error: "Missing fields" });
    }

    const adoptAnimal = await prisma.adoptAnimal.findUnique({
      where: { id: animalId },
    });

    if (userId !== adoptAnimal?.userId) {
      return NextResponse.json({ error: "user id not match" }, { status: 400 });
    }

    const updateAnimal = await prisma.adoptionForm.update({
      where: { id: formId },
      data: {
        status,
      },
    });

    return NextResponse.json(updateAnimal, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}


