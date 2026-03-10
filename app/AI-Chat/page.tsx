"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Sparkles, PawPrint } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/useAuth";

type Message = {
  role: "USER" | "AI";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id;
  const { user } = useAuth(clerkId ?? "");

  const myInitial = clerkUser?.firstName?.[0]?.toUpperCase() ?? "?";

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "USER", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ask-AI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage, userId: "121212" }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "AI", content: data.reply }]);
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "AI", content: "Хаав! Алдаа гарлаа. Дахин оролдоно уу! 🐾" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (chip: string) => {
    setInput(chip.replace(/^[\p{Emoji}\s]+/u, "").trim());
  };

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-10 left-10 transform rotate-12">
          <PawPrint className="w-24 h-24" />
        </div>
        <div className="absolute top-40 right-20 transform -rotate-45">
          <PawPrint className="w-32 h-32" />
        </div>
        <div className="absolute bottom-32 left-1/4 transform rotate-90">
          <PawPrint className="w-28 h-28" />
        </div>
        <div className="absolute bottom-20 right-1/3 transform -rotate-12">
          <PawPrint className="w-20 h-20" />
        </div>
        <div className="absolute top-1/2 left-10 transform rotate-45">
          <PawPrint className="w-16 h-16" />
        </div>
        <div className="absolute top-1/3 right-10 transform -rotate-90">
          <PawPrint className="w-24 h-24" />
        </div>
      </div>
      <header className="bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-4 shadow-lg relative z-10">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-white/90 hover:bg-white rounded-2xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <ArrowLeft className="w-6 h-6 text-green-600" />
          </button>
          <div className="bg-white p-3 rounded-2xl shadow-md animate-bounce-slow">
            <PawPrint className="w-10 h-10 text-green-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-white drop-shadow-md flex items-center gap-2">
              🐾 PawsHelper AI
              <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse" />
            </h1>
            <p className="text-white/90 text-sm font-semibold">
              Таны тэжээвэр амьтны найз туслагч
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-6 relative z-10 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-transparent">
        <div className="max-w-5xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 px-6 animate-fade-in">
              <div className="inline-block bg-linear-to-br from-green-100 to-emerald-100 p-8 rounded-full mb-6 shadow-lg animate-bounce-slow">
                <div className="text-7xl">🐶</div>
              </div>
              <h2 className="text-3xl font-extrabold text-green-700 mb-3">
                Сайн байна уу!
              </h2>
              <p className="text-gray-600 text-base font-semibold mb-8 max-w-md mx-auto leading-relaxed">
                Гэрийн тэжээвэр амьтдын талаар хүссэн бүхнээ асуугаарай!
              </p>
              <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                {[
                  "🍖 Миний тэжээвэр амьтан юу идэж болох вэ?",
                  "😾 Миний муур яагаад нуугдаад байна вэ?",
                  "🐾 Вакцинжуулалтын хуваарь",
                  "💊 Нийтлэг эмүүд",
                  "🐶🐱 Тэжээвэр амьтны мэдээлэл",
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className="bg-white border-2 border-green-200 hover:border-green-400 rounded-2xl px-4 py-2.5 text-sm font-bold text-green-700 hover:bg-green-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 items-end animate-fade-in ${
                msg.role === "USER" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {msg.role === "USER" ? (
                <Avatar className="w-10 h-10 shrink-0 shadow-lg ring-2 ring-green-200">
                  <AvatarImage src={user?.profileImg} />
                  <AvatarFallback className="bg-linear-to-br from-green-500 to-emerald-600 text-white font-bold text-sm">
                    {myInitial}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 shadow-lg ring-2 bg-linear-to-br from-teal-500 to-cyan-600 ring-teal-200">
                  🐾
                </div>
              )}

              <div
                className={`px-5 py-3 rounded-3xl shadow-lg ${
                  msg.role === "USER"
                    ? "bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-br-md max-w-[70%]"
                    : "bg-white text-gray-800 border-2 border-green-100 rounded-bl-md max-w-[85%]"
                }`}
              >
                {msg.role === "AI" ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0 leading-relaxed font-semibold text-gray-700">
                            {children}
                          </p>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-xl font-extrabold text-green-700 mb-2 mt-3 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-extrabold text-green-700 mb-2 mt-3 first:mt-0">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-bold text-green-700 mb-2 mt-2 first:mt-0">
                            {children}
                          </h3>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-2 space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-2 space-y-1">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-gray-700 font-semibold">
                            {children}
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="text-green-800 font-extrabold">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="text-gray-600 font-semibold">
                            {children}
                          </em>
                        ),
                        code: ({ children }) => (
                          <code className="bg-green-50 text-green-800 rounded px-2 py-0.5 text-xs font-mono font-bold">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-gray-800 text-green-300 rounded-xl p-3 overflow-x-auto my-2 text-xs font-mono">
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-green-500 pl-4 italic text-gray-600 my-2 font-semibold">
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <table className="w-full border-collapse text-sm my-2">
                            {children}
                          </table>
                        ),
                        th: ({ children }) => (
                          <th className="bg-green-100 text-green-800 font-extrabold p-2 text-left">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border-b border-green-100 p-2 font-semibold">
                            {children}
                          </td>
                        ),
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            className="text-green-700 underline font-bold hover:text-green-800"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        hr: () => (
                          <hr className="border-green-200 my-3 border-t-2" />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="font-bold text-sm leading-relaxed">
                    {msg.content}
                  </p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-end animate-fade-in">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 shadow-lg bg-linear-to-br from-teal-500 to-cyan-600 ring-2 ring-teal-200">
                🐾
              </div>
              <div className="bg-white border-2 border-green-100 rounded-3xl rounded-bl-md px-5 py-4 flex gap-1.5 shadow-lg">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-md border-t-2 border-green-200 px-4 py-4 shadow-lg relative z-10">
        <form
          onSubmit={handleSubmit}
          className="max-w-5xl mx-auto flex gap-3 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Тэжээвэр амьтныхаа талаар асуугаарай... 🐾"
            className="flex-1 px-6 py-4 rounded-full border-2 border-green-200 bg-white font-semibold text-gray-700 text-sm placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all shadow-md"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-14 h-14 rounded-full bg-linear-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 border-none flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl hover:scale-110 disabled:hover:scale-100 disabled:cursor-not-allowed disabled:shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 font-bold mt-3 flex items-center justify-center gap-2">
          <PawPrint className="w-3 h-3" />
          AI-ийн тусламжтай · Эрүүл мэндийн асуудлаар заавал мэргэжлийн эмчээс
          зөвлөгөө авна уу
          <PawPrint className="w-3 h-3" />
        </p>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease forwards;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
