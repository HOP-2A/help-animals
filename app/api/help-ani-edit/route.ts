import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, location, description, images, status, condition } = body;

    if (!id) {
      return NextResponse.json({ error: "HelpAnimal id required" }, { status: 400 });
    }

    const isHelpAnimal = await prisma.helpAnimal.findUnique({
      where: { id },
    });

    if (!isHelpAnimal) {
      return NextResponse.json({ error: "HelpAnimal not found" }, { status: 404 });
    }

    const data: Prisma.HelpAnimalUpdateInput = {};

    if (location !== undefined) data.location = location;
    if (description !== undefined) data.description = description;
    if (images !== undefined) data.images = images;
    if (status !== undefined) data.status = status;
    if (condition !== undefined) data.condition = condition;

    const updatedHelpAnimal = await prisma.helpAnimal.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedHelpAnimal, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
