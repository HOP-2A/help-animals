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
  createdAt: string;
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

function Avatar({ user, size }: { user: Sender | undefined; size: string }) {
  return (
    <div
      className={`${size} rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black overflow-hidden shrink-0`}
    >
      {user?.image ? (
        <img
          src={user.image}
          alt={user.name ?? ""}
          className="w-full h-full object-cover"
        />
      ) : (
        (user?.name?.[0]?.toUpperCase() ?? "?")
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
      className="flex flex-col h-screen bg-[#fffbf0]"
      style={{ fontFamily: "Nunito, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');`}</style>

      <div className="bg-white border-b border-orange-100 px-5 py-3 flex items-center gap-3 shrink-0 shadow-sm">
        <Avatar user={otherUser} size="w-10 h-10 text-sm" />
        <div className="flex-1 min-w-0">
          <div className="font-black text-gray-800 text-sm truncate">
            {otherUser?.name ?? "Хэрэглэгч"}
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-gray-300"}`}
            />
            <span className="text-xs text-gray-400">
              {connected ? "Онлайн" : "Холбогдож байна..."}
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl mb-3">
              💬
            </div>
            <p className="font-black text-gray-500 text-sm">Чат эхлэх үү?</p>
            <p className="text-gray-400 text-xs mt-1">Мессеж илгээгээрэй</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
            >
              {!isMe && <Avatar user={msg.sender} size="w-8 h-8 text-xs" />}
              <div
                className={`max-w-[65%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}
              >
                {!isMe && (
                  <span className="text-[11px] font-black text-orange-400 px-1">
                    {msg.sender.name}
                  </span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? "bg-linear-to-br from-[#f59e0b] to-[#ea580c] text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-orange-100 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-400 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString("mn-MN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div id="chat-bottom" />
      </div>

      <div className="bg-white border-t border-orange-100 px-4 py-3 shrink-0">
        <div className="flex items-end gap-2.5 max-w-3xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Мессеж бичих... (Enter — илгээх, Shift+Enter — мөр)"
            rows={1}
            style={{ maxHeight: "120px" }}
            className="flex-1 resize-none bg-[#fffbf0] border-2 border-orange-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors"
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !connected}
            className="w-11 h-11 rounded-2xl bg-linear-to-br from-[#f59e0b] to-[#ea580c] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all shrink-0"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
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
