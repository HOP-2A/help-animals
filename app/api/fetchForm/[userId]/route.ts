import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
) => {
  try {
    const { userId } = await context.params;

    const adoptionForm = await prisma.adoptionForm.findMany({
      where: { userId },
      include: {
        pet: true,
      },
    });

    return NextResponse.json(adoptionForm, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { anketId, userId } = body;

    if (!anketId || !userId) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }

    const form = await prisma.adoptionForm.findUnique({
      where: { id: anketId },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (userId !== form.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const deletedAnket = await prisma.adoptionForm.delete({
      where: {
        id: anketId,
      },
    });

    return NextResponse.json(deletedAnket, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
