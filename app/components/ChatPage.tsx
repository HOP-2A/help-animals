"use client";

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type Sender = {
  id: string;
  name: string | null;
  image: string | null;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string | Date;
  sender: Sender;
};

type ConversationData = {
  id: string;
  users: Sender[];
  messages: Message[];
};

type Props = {
  conversation: ConversationData;
  currentUserId: string;
};

let _socket: Socket | null = null;
function getSocket(): Socket {
  if (!_socket) _socket = io("http://localhost:3001", { autoConnect: true });
  return _socket;
}

function Avatar({
  user,
  size,
}: {
  user: Sender | undefined;
  size: "sm" | "md" | "lg";
}) {
  const dims = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  return (
    <div
      className={`${dims[size]} rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black overflow-hidden shrink-0 shadow-sm`}
    >
      {user?.image ? (
        <img
          src={user.image}
          alt={user.name ?? ""}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

export default function ChatPage({ conversation, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const otherUser = conversation.users.find((u) => u.id !== currentUserId);

  const scrollToBottom = useCallback(() => {
    document
      .getElementById("chat-bottom")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const onConnect = () => {
      setConnected(true);
      socket.emit("join_conversation", conversation.id);
    };

    const onDisconnect = () => setConnected(false);
    const onMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_message", onMessage);
    if (socket.connected) onConnect();
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_message", onMessage);
    };
  }, [conversation.id]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("register_user", currentUserId);
  }, [currentUserId]);
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !connected) return;
    getSocket().emit("send_message", {
      content: input.trim(),
      senderId: currentUserId,
      conversationId: conversation.id,
    });
    setInput("");
  }, [input, connected, currentUserId, conversation.id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="flex flex-col h-screen bg-[#fdf8f2]"
      style={{ fontFamily: "Nunito, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes msgIn { from { opacity: 0; transform: translateY(8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .msg-animate { animation: msgIn 0.2s ease forwards; }
      `}</style>

      <div className="bg-white/90 backdrop-blur-md border-b border-orange-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <button className="lg:hidden w-8 h-8 flex items-center justify-center text-orange-400 hover:bg-orange-50 rounded-xl transition-colors">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative">
          <Avatar user={otherUser} size="md" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-black text-[#431407] text-sm truncate leading-tight">
            {otherUser?.name ?? "Хэрэглэгч"}
          </div>
        </div>

        <button className="w-8 h-8 flex items-center justify-center text-orange-300 hover:bg-orange-50 rounded-xl transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center select-none">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center text-4xl shadow-inner">
                {otherUser?.image ? (
                  <img
                    src={otherUser.image}
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  "🐾"
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center text-lg shadow-sm">
                💬
              </div>
            </div>
            <div>
              <p className="font-black text-[#431407] text-base">
                {otherUser?.name ?? "Хэрэглэгч"}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Мессеж илгээж яриа эхлүүл
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUserId;
          const prevMsg = messages[idx - 1];
          const isSameUser = prevMsg?.senderId === msg.senderId;
          const showAvatar = !isMe && !isSameUser;
          const showName = !isMe && !isSameUser;

          return (
            <div
              key={msg.id}
              className={`msg-animate flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} ${isSameUser ? "mt-0.5" : "mt-4"}`}
            >
              <div className="w-8 shrink-0">
                {showAvatar && <Avatar user={msg.sender} size="sm" />}
              </div>

              <div
                className={`max-w-[70%] sm:max-w-[60%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}
              >
                {showName && (
                  <span className="text-[11px] font-black text-orange-400 px-2">
                    {msg.sender.name}
                  </span>
                )}

                <div className="flex items-end gap-1.5">
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-linear-to-br from-[#f59e0b] to-[#ea580c] text-white rounded-4xl rounded-br-[6px]"
                        : "bg-white text-gray-800 border border-orange-100/80 rounded-4xl rounded-bl-[6px]"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>

                {(idx === messages.length - 1 ||
                  messages[idx + 1]?.senderId !== msg.senderId) && (
                  <span
                    className={`text-[10px] text-gray-400 px-2 ${isMe ? "text-right" : "text-left"}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <div id="chat-bottom" />
      </div>

      <div className="bg-white border-t border-orange-100 px-4 py-3 shrink-0">
        <div className="flex items-end gap-2.5 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Мессеж бичих..."
              rows={1}
              style={{ maxHeight: "120px" }}
              className="w-full resize-none bg-[#fdf8f2] border-2 border-orange-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors leading-relaxed"
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!input.trim() || !connected}
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-all shrink-0 mb-0.5 disabled:opacity-40 disabled:scale-100 hover:scale-110 active:scale-95"
            style={{
              background:
                input.trim() && connected
                  ? "linear-gradient(135deg, #f59e0b, #ea580c)"
                  : "#f3e8d0",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={input.trim() && connected ? "white" : "#c4a07a"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
