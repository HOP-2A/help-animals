import { Webhook } from "svix";
import { headers } from "next/headers";
import { UserJSON, UserWebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const WH_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WH_SECRET) throw new Error("Missing CLERK_WEBHOOK_SECRET");

  const payload = await req.text();
  const headerList = await headers();

  const svixHeaders = {
    "svix-id": headerList.get("svix-id")!,
    "svix-timestamp": headerList.get("svix-timestamp")!,
    "svix-signature": headerList.get("svix-signature")!,
  };

  const wh = new Webhook(WH_SECRET);
  let evt: UserWebhookEvent;

  try {
    evt = wh.verify(payload, svixHeaders) as UserWebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;
  const user = evt.data as UserJSON;

  const email = user.email_addresses?.[0]?.email_address ?? null;
  const lastName = user.last_name || "";
  const firstName = user.first_name || "";
  if (eventType === "user.created") {
    await prisma.user.create({
      data: {
        clerkId: user.id,
        email,
        firstName,
        lastName,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
