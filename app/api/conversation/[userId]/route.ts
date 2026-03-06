import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) => {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Id missing" }, { status: 400 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },  
      },
      include: {
        users: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { sender: true },
          },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(conversations, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
};
