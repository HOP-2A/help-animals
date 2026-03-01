import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const allExperience = await prisma.experienceExchange.findMany({
      include: {
        user: true,
        reactions: true,
        comments: true,
      },
    });

    if (!allExperience || allExperience.length === 0) {
      return NextResponse.json(
        { error: "ExperienceExchanges not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(allExperience, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
