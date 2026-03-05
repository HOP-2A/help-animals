import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ animalId: string }> },
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

    if (!adoptAnimal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    return NextResponse.json(adoptAnimal, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, animalId, status, formId } = body;

    if (!userId || !animalId || !status || !formId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const adoptAnimal = await prisma.adoptAnimal.findUnique({
      where: { id: animalId },
    });

    if (!adoptAnimal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    if (userId !== adoptAnimal.userId) {
      return NextResponse.json({ error: "User id not match" }, { status: 403 });
    }

    const updateAnimal = await prisma.adoptionForm.update({
      where: { id: formId },
      data: {
        status,
      },
    });

    return NextResponse.json(updateAnimal, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
