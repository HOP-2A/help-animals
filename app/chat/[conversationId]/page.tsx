import prisma from "@/lib/prisma";
import ChatPage from "../../components/ChatPage";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return;
  }
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/sign-up");
  const userId = user.id;
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      users: true,
      messages: {
        include: { sender: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) redirect("/");

  const formattedConversation = {
    id: conversation.id,
    users: conversation.users.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      image: u.profileImg,
    })),
    messages: conversation.messages.map((m) => ({
      id: m.id,
      content: m.content,
      senderId: m.senderId,
      conversationId: m.conversationId,
      createdAt: m.createdAt.toISOString(),
      sender: {
        id: m.sender.id,
        name: `${m.sender.firstName} ${m.sender.lastName}`,
        image: m.sender.profileImg,
      },
    })),
  };

  return (
    <ChatPage conversation={formattedConversation} currentUserId={userId} />
  );
}
