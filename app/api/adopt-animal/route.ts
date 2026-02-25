import prisma from "@/lib/prisma";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      description,
      name,
      breed,
      age,
      sterilized,
      CatFriendly,
      DogFriendly,
      KidFriendly,
      AggressionLevel,
      AggressionNote,
      personality,
      healthInfo,
      images,
      status,
      temporaryEnd,
      animalType,
      gender,
    } = body;

    if (
      !description ||
      !images ||
      !userId ||
      !status ||
      !name ||
      !age ||
      !breed ||
      !gender
    ) {
      return NextResponse.json({ error: "Missing fields" });
    }

    const isUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!isUser) {
      return NextResponse.json({ error: "user not found" });
    }

    const createdAdoptAnimal = await prisma.adoptAnimal.create({
      data: {
        userId,
        description,
        images,
        status,
        name,
        age,
        breed,
        sterilized,
        CatFriendly,
        DogFriendly,
        KidFriendly,
        AggressionLevel,
        AggressionNote,
        personality,
        healthInfo,
        temporaryEnd,
        animalType,
        gender,
      },
    });
    return NextResponse.json(createdAdoptAnimal, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function GET() {
  try {
    const adoptAnimals = await prisma.adoptAnimal.findMany();
    return NextResponse.json(adoptAnimals, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
