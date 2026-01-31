import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
export async function PUT(req: Request) {
    try{
        const body = await req.json();
    const { id,  description, images} = body;
      if (!id) {
      return NextResponse.json({ error: "ExperienceExchange id required" }, { status: 400 });
    }
      const Experience = await prisma.experienceExchange.findUnique({
      where: { id },
    });
     if (!Experience) {
      return NextResponse.json({ error: "ExperienceExchange not found" }, { status: 404 });
    }
      const data: Prisma.ExperienceExchangeUpdateInput = {};

    if (description !== undefined) data.description = description;
    if (images !== undefined) data.images = images;

    const updatedExperienceExchange = await prisma.experienceExchange.update({
      where: { id },
      data,
    });
     return NextResponse.json(updatedExperienceExchange, { status: 200 });
    }
    catch(err){
      return NextResponse.json({ error: err }, { status: 500 });
    }
}