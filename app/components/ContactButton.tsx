"use client";
import { useAuth } from "@/providers/useAuth";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  postOwnerId: string;
};

export function ContactButton({ postOwnerId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id ?? null;
  const { user } = useAuth(clerkId);
  const userId = user?.id;

  const handleContact = async () => {
    if (!userId) {
      router.push("/sign-up");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postOwnerId, userId }),
      });

      const data = await res.json();
      router.push(`/chat/${data.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className="py-4 px-3 rounded-2xl font-extrabold text-blue-900 text-base transition-all cursor-pointer
        shadow-[0_5px_0_#92400e] hover:shadow-[0_7px_0_#92400e] hover:-translate-y-1 active:translate-y-1
        disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: "linear-gradient(135deg,#fbbf24,#f97316)" }}
    >
      {loading ? "⏳ Уншиж байна..." : "📞 Холбогдох"}
    </button>
  );
}
