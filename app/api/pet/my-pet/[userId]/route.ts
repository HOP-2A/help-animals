import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  context: { params: Promise<{ userId: string }> },
) => {
  try {
    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }
    const pet = await prisma.pet.findMany({
      where: {
        ownerId: userId,
      },
    });
    return NextResponse.json(pet, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
};

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { petId, userId } = body;
    if (!petId || !userId) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const pet = await prisma.pet.findUnique({
      where: {
        id: petId,
      },
    });

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    const petOwner = await prisma.pet.findFirst({
      where: {
        ownerId: userId,
      },
    });

    if (!petOwner) {
      return NextResponse.json(
        { error: "youre not pet owner" },
        { status: 404 },
      );
    }

    await prisma.pet.delete({
      where: {
        id: petId,
      },
    });

    return NextResponse.json(
      { message: "Pet deleted successfully" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { petId } = body;

    if (!petId) {
      return NextResponse.json({ error: "PetId missing" }, { status: 400 });
    }

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    return NextResponse.json(pet, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
