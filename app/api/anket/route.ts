import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      age,
      firstName,
      lastName,
      phoneNumber,
      secondaryPhone,
      location,
      district,
      address,
      email,
      hasPet,
      petId,
      userId,
      petInfo,
    } = body;

    if (
  age == null ||
  !firstName ||
  !lastName ||
  !phoneNumber ||
  !location ||
  !district ||
  !email ||
  hasPet === undefined ||
  !userId ||
  (hasPet === true && !petId)
) {
  return NextResponse.json({ error: "Missing fields" }, { status: 400 });
}


    const isUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!isUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const adoptionForm = await prisma.adoptionForm.create({
      data: {
        age,
        firstName,
        lastName,
        phoneNumber,
        secondaryPhone,
        location,
        district,
        address,
        email,
        hasPet,
        petInfo,
        petId,
        userId,
      },
    });

    return NextResponse.json(adoptionForm, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
