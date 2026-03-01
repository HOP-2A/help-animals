import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, breed, age, healthInfo, images, ownerId, gender } = body;

    if (!name || !breed || !age || !healthInfo || !images || !ownerId) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }

    const isUser = await prisma.user.findUnique({
      where: {
        id: ownerId,
      },
    });

    if (!isUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const createdPet = await prisma.pet.create({
      data: {
        name,
        breed,
        age,
        gender,
        healthInfo,
        petImg: images,
        ownerId,
      },
    });
    return NextResponse.json(createdPet, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}


