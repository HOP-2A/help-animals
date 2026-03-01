"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "USER" | "AI";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --forest:        #1b4d36;
          --forest-mid:    #256647;
          --forest-light:  #37896a;
          --mint:          #d2f0e3;
          --mint-dark:     #a8d9bf;
          --cream:         #f4fbf7;
          --warm-white:    #edf8f3;
          --gold:          #e8a63a;
          --gold-light:    #f5c76e;
          --text-dark:     #122b1f;
          --text-mid:      #375e4a;
          --text-light:    #6ea082;
          --shadow:        rgba(27,77,54,0.13);
        }

        body { font-family: 'Nunito', sans-serif; background: var(--cream); }

        .chat-wrap {
          display: flex; flex-direction: column; height: 100vh;
          background: var(--cream); position: relative; overflow: hidden;
        }
        .chat-wrap::before {
          content: ''; position: fixed; inset: 0;
          background-image: radial-gradient(circle, rgba(27,77,54,0.04) 1px, transparent 1px);
          background-size: 28px 28px; pointer-events: none; z-index: 0;
        }

        /* HEADER */
        .header {
          background: var(--forest); padding: 13px 22px;
          display: flex; align-items: center; gap: 13px;
          box-shadow: 0 3px 18px rgba(27,77,54,0.4);
          position: relative; z-index: 10;
        }
        .header-mascot {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, var(--gold-light), var(--gold));
          border-radius: 14px; display: flex; align-items: center;
          justify-content: center; font-size: 26px; flex-shrink: 0;
          box-shadow: 0 3px 12px rgba(232,166,58,0.5);
          animation: floatPaw 3.5s ease-in-out infinite;
        }
        @keyframes floatPaw {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-5px) rotate(-5deg); }
        }
        .header-title { font-family: 'Fredoka One', cursive; font-size: 23px; color: #fff; line-height: 1.1; }
        .header-sub   { font-size: 11px; color: var(--mint-dark); font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; margin-top: 2px; }
        .header-badges { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
        .badge {
          background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.22);
          border-radius: 20px; padding: 3px 11px; font-size: 11.5px; font-weight: 700;
          color: var(--mint); white-space: nowrap;
        }

        /* MESSAGES */
        .main {
          flex: 1; overflow-y: auto; padding: 24px 16px 12px;
          display: flex; flex-direction: column; gap: 18px;
          position: relative; z-index: 1;
          scrollbar-width: thin; scrollbar-color: var(--mint-dark) transparent;
        }
        .main::-webkit-scrollbar { width: 5px; }
        .main::-webkit-scrollbar-thumb { background: var(--mint-dark); border-radius: 10px; }

        /* EMPTY STATE */
        .empty-state {
          text-align: center; margin: auto; padding: 40px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          animation: fadeUp 0.6s ease forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .empty-icon {
          font-size: 78px;
          filter: drop-shadow(0 5px 10px rgba(27,77,54,0.22));
          animation: floatPaw 3.5s ease-in-out infinite;
        }
        .empty-title { font-family: 'Fredoka One', cursive; font-size: 28px; color: var(--forest); }
        .empty-sub   { font-size: 14px; color: var(--text-light); font-weight: 600; max-width: 270px; line-height: 1.65; }
        .quick-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 6px; }
        .chip {
          background: white; border: 2px solid var(--mint-dark); border-radius: 20px;
          padding: 7px 15px; font-size: 12.5px; font-weight: 700; color: var(--forest-mid);
          cursor: pointer; transition: all 0.2s ease; font-family: 'Nunito', sans-serif;
        }
        .chip:hover {
          background: var(--forest-mid); color: white; border-color: var(--forest-mid);
          transform: translateY(-2px); box-shadow: 0 5px 14px rgba(27,77,54,0.22);
        }

        /* ROWS */
        .msg-row {
          display: flex; align-items: flex-end; gap: 10px;
          animation: fadeUp 0.3s ease forwards;
          max-width: 760px; width: 100%;
        }
        .msg-row.user { flex-direction: row-reverse; margin-left: auto; }
        .msg-row.ai   { flex-direction: row;         margin-right: auto; }

        .avatar {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0; box-shadow: 0 2px 8px var(--shadow);
        }
        .user-av { background: linear-gradient(135deg, var(--gold-light), var(--gold)); }
        .ai-av   { background: linear-gradient(135deg, var(--forest-light), var(--forest)); }

        /* BUBBLES */
        .bubble {
          padding: 12px 16px; border-radius: 18px;
          font-size: 14px; line-height: 1.7; font-weight: 600;
          max-width: calc(100% - 56px);
          box-shadow: 0 2px 10px var(--shadow);
        }
        .user-bubble {
          background: linear-gradient(135deg, var(--forest-light), var(--forest));
          color: #fff; border-bottom-right-radius: 4px;
        }
        .ai-bubble {
          background: white; color: var(--text-dark);
          border-bottom-left-radius: 4px; border: 1.5px solid var(--mint-dark);
        }

        /* MARKDOWN STYLES inside ai bubble */
        .md-body p              { margin-bottom: 8px; }
        .md-body p:last-child   { margin-bottom: 0; }
        .md-body h1, .md-body h2, .md-body h3 {
          font-family: 'Fredoka One', cursive; color: var(--forest);
          margin: 14px 0 6px; line-height: 1.25;
        }
        .md-body h1 { font-size: 18px; }
        .md-body h2 { font-size: 16px; }
        .md-body h3 { font-size: 14.5px; }
        .md-body ul, .md-body ol { padding-left: 20px; margin-bottom: 8px; }
        .md-body li  { margin-bottom: 4px; }
        .md-body strong { color: var(--forest); }
        .md-body em     { color: var(--text-mid); }
        .md-body code {
          background: var(--mint); color: var(--forest);
          border-radius: 5px; padding: 1px 6px;
          font-size: 12.5px; font-family: 'Courier New', monospace;
        }
        .md-body pre {
          background: var(--forest); color: var(--mint);
          border-radius: 10px; padding: 12px 14px;
          overflow-x: auto; margin: 8px 0; font-size: 12.5px;
        }
        .md-body pre code { background: none; color: inherit; padding: 0; }
        .md-body blockquote {
          border-left: 3px solid var(--forest-light); padding-left: 12px;
          color: var(--text-mid); margin: 8px 0; font-style: italic;
        }
        .md-body table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 8px 0; }
        .md-body th { background: var(--mint); color: var(--forest); padding: 6px 10px; text-align: left; font-weight: 800; }
        .md-body td { padding: 5px 10px; border-bottom: 1px solid var(--mint-dark); }
        .md-body a  { color: var(--forest-light); text-decoration: underline; }
        .md-body hr { border: none; border-top: 1.5px solid var(--mint-dark); margin: 10px 0; }

        /* TYPING */
        .typing-row { display: flex; align-items: flex-end; gap: 10px; animation: fadeUp 0.3s ease forwards; }
        .typing-bubble {
          background: white; border: 1.5px solid var(--mint-dark);
          border-radius: 18px; border-bottom-left-radius: 4px;
          padding: 14px 18px; display: flex; align-items: center; gap: 5px;
          box-shadow: 0 2px 10px var(--shadow);
        }
        .dot { width: 8px; height: 8px; background: var(--forest-light); border-radius: 50%; animation: bounce 1.2s ease infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.45; }
          30%            { transform: translateY(-7px); opacity: 1; }
        }

        /* FOOTER */
        .footer {
          background: var(--warm-white); border-top: 2px solid var(--mint-dark);
          padding: 12px 16px 14px; box-shadow: 0 -2px 14px var(--shadow);
          position: relative; z-index: 10;
        }
        .input-form { max-width: 760px; margin: 0 auto; display: flex; gap: 10px; align-items: center; }
        .input-field {
          flex: 1; padding: 13px 20px; border-radius: 50px;
          border: 2px solid var(--mint-dark); background: white;
          font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600;
          color: var(--text-dark); outline: none; transition: all 0.2s ease;
        }
        .input-field::placeholder { color: var(--text-light); }
        .input-field:focus { border-color: var(--forest-light); box-shadow: 0 0 0 3px rgba(55,137,106,0.14); }
        .send-btn {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, var(--forest-light), var(--forest));
          border: none; cursor: pointer; display: flex; align-items: center;
          justify-content: center; color: white; transition: all 0.2s ease;
          box-shadow: 0 3px 12px rgba(27,77,54,0.4); flex-shrink: 0;
        }
        .send-btn:hover:not(:disabled) { transform: scale(1.1) rotate(-6deg); box-shadow: 0 6px 18px rgba(27,77,54,0.48); }
        .send-btn:disabled { background: linear-gradient(135deg, #ccc, #bbb); box-shadow: none; cursor: not-allowed; }
        .footer-note { text-align: center; font-size: 10.5px; color: var(--text-light); font-weight: 700; margin-top: 8px; letter-spacing: 0.3px; }
      `}</style>

      <div className="chat-wrap">
        <header className="header">
          <div className="header-mascot">🐾</div>
          <div>
            <div className="header-title">PawsHelper</div>
            <div className="header-sub">Таны тэжээвэр амьтны найз туслагч</div>
          </div>
          <div className="header-badges">
            <span className="badge">🐕 Нохой</span>
            <span className="badge">🐈 Муур</span>
            <span className="badge">🐇 Бусад</span>
          </div>
        </header>

        <main className="main">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🐶</div>
              <div className="empty-title">Сайн байна уу! 👋</div>
              <div className="empty-sub">
                Гэрийн тэжээвэр амьтдын талаар хүссэн бүхнээ асуугаарай!
              </div>
              <div className="quick-chips">
                {[
                  "🍖 Миний тэжээвэр амьтан юу идэж болох вэ?",
                  "😾 Миний муур яагаад нуугдаад байна вэ?",
                  "🐾 Вакцинжуулалтын хуваарь",
                  "💊 Нийтлэг эмүүд",
                  "🐶🐱 Тэжээвэр амьтны мэдээлэл",
                ].map((chip) => (
                  <button
                    key={chip}
                    className="chip"
                    onClick={() => handleChipClick(chip)}
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
              className={`msg-row ${msg.role === "USER" ? "user" : "ai"}`}
            >
              <div
                className={`avatar ${msg.role === "USER" ? "user-av" : "ai-av"}`}
              >
                {msg.role === "USER" ? "🧑" : "🐾"}
              </div>
              <div
                className={`bubble ${msg.role === "USER" ? "user-bubble" : "ai-bubble"}`}
              >
                {msg.role === "AI" ? (
                  <div className="md-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="typing-row">
              <div className="avatar ai-av">🐾</div>
              <div className="typing-bubble">
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </main>

        <footer className="footer">
          <form className="input-form" onSubmit={handleSubmit}>
            <input
              className="input-field"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Тэжээвэр амьтныхаа талаар асуугаарай... 🐾"
            />
            <button
              className="send-btn"
              type="submit"
              disabled={isLoading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </form>
          <p className="footer-note">
            🐾 AI-ийн тусламжтай · Эрүүл мэндийн асуудлаар заавал мэргэжлийн
            эмчээс зөвлөгөө авна уу
          </p>
        </footer>
      </div>
    </>
  );
}
