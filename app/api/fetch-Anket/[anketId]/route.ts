import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ anketId: string }> },
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
        { error: "Adoption form олдсонгүй" },
        { status: 404 },
      );
    }

    return NextResponse.json(adoptionForm, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
