import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, images, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "user not" }, { status: 400 });
    }

    const isUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!isUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ExperienceExchange = await prisma.experienceExchange.create({
      data: {
        description,
        images,
        userId,
      },
    });

    return NextResponse.json(ExperienceExchange, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
