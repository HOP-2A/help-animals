import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
 try {
  const AllExperience = await prisma.experienceExchange.findMany({
    });
    if (!AllExperience) {
      return NextResponse.json({ error: "ExperienceExchanges not found" }, { status: 404 });
    }
    return NextResponse.json(AllExperience, { status: 200 });
 }
 catch(err) {
return NextResponse.json({ error: err }, { status: 500 });
 }
}