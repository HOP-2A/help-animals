import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export const GET = async (
  req: Request,
  context: { params: { userId: string } },
) => {
  try {
    const { userId } = await context.params;
    const adoptionForm = await prisma.adoptionForm.findMany({
      where: { userId: userId },
      include: {
        pet: true,
      },
    });

    if (!adoptionForm) {
      return NextResponse.json(
        { error: "Adoption form oldsongui" },
        { status: 400 },
      );
    }

    return NextResponse.json(adoptionForm, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
};

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { anketId, userId } = body;
    if (!anketId || !userId) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const form = await prisma.adoptionForm.findUnique({
      where: {
        id: anketId,
      },
    });

    if (userId !== form?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const deletedAnket = await prisma.adoptionForm.delete({
      where: {
        id: anketId,
        userId,
      },
    });
    return NextResponse.json(deletedAnket, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
    ``;
  }
}
