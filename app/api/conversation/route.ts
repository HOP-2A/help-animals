import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, postOwnerId } = body;

    if (!userId || !postOwnerId) {
      return NextResponse.json(
        { error: "Missing userId or postOwnerId" },
        { status: 400 },
      );
    }
    const me = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!me)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { users: { some: { id: userId } } },
          { users: { some: { id: postOwnerId } } },
        ],
      },
    });

    if (existingConversation) {
      return NextResponse.json({ id: existingConversation.id });
    }

    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [{ id: userId }, { id: postOwnerId }],
        },
      },
    });
    return NextResponse.json({ id: newConversation.id });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

