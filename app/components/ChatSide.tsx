"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/useAuth";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  profileImg: string;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: User;
  conversationId: string;
};

type Conversation = {
  id: string;
  createdAt: string;
  users: User[];
  messages: Message[];
};

function Avatar({ user }: { user: User }) {
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  return (
    <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm">
      {user.profileImg ? (
        <img
          src={user.profileImg}
          alt={user.firstName}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 1) return "Одоо";
  if (diffMin < 60) return `${diffMin}м`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}ц`;
  if (diffMin < 10080) return `${Math.floor(diffMin / 1440)}өд`;
  return date.toLocaleDateString("mn-MN", { month: "short", day: "numeric" });
}

export default function ConversationList() {
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id ?? null;
  const { user } = useAuth(clerkId);
  const userId = user?.id;
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/conversation/${userId}`);
        if (!res.ok) return;
        const data: Conversation[] = await res.json();
        setConversations(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  return (
    <div
      className="flex flex-col w-72 h-full bg-amber-50 border-r border-orange-100 rounded-2xl"
      style={{ fontFamily: "Nunito, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');`}</style>

      <div className="px-5 py-4 border-b border-orange-100 shrink-0">
        <h2 className="font-black text-[#431407] text-lg">💬 Чат</h2>
        {!loading && (
          <p className="text-xs text-orange-400 font-semibold mt-0.5">
            {conversations.length} чат
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col gap-1 p-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-3 rounded-2xl animate-pulse"
              >
                <div className="w-11 h-11 rounded-full bg-orange-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-orange-200 rounded-full w-2/3" />
                  <div className="h-2.5 bg-orange-100 rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-5 gap-2 opacity-60">
            <span className="text-4xl">🐾</span>
            <p className="font-black text-gray-500 text-sm">
              Чат байхгүй байна
            </p>
          </div>
        )}

        {!loading && conversations.length > 0 && (
          <div className="p-2 flex flex-col gap-0.5">
            {conversations.map((conv) => {
              const other = conv.users.find((u) => u.id !== userId);
              const last = conv.messages[0];
              if (!other) return null;

              const lastText = last
                ? last.sender.id === userId
                  ? `Та: ${last.content}`
                  : last.content
                : "Мессеж байхгүй";

              return (
                <button
                  key={conv.id}
                  onClick={() => router.push(`/chat/${conv.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left hover:bg-orange-100/70 active:bg-orange-100 transition-all duration-150 group"
                >
                  <Avatar user={other} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-[#431407] text-sm truncate">
                        {other.firstName} {other.lastName}
                      </span>
                      {last && (
                        <span className="text-[10px] text-orange-400 font-bold shrink-0">
                          {formatTime(last.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5 leading-relaxed">
                      {lastText}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
