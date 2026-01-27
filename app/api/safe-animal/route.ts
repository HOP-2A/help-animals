import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const rescuedPosts = await prisma.helpAnimal.findMany({
      where: {
        status: "RESCUED",
      },
    });

    return NextResponse.json(rescuedPosts, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch rescued posts" },
      { status: 500 }
    );
  }
}
