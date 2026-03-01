import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export const GET = async (
  req: Request,
  context: { params: { anketId: string } },
) => {
  try {
    const { anketId } = await context.params;
    const adoptionForm = await prisma.adoptionForm.findUnique({
      where: { id: anketId },
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
