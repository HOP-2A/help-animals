"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ANIMAL_PHOTOS = [
  "./helpAnimal7.jpg",
  "./helpAnimal2.jpg",
  "./helpAnimal3.jpg",
  "./helpAnimal4.jpg",
  "./helpAnimal5.jpg",
  "./helpAnimal6.jpg",
];

function Header() {
  return (
    <header
      className={`fixed top-0 pt-5 pb-5 left-0 right-0 z-50 bg-[#fffbf0]/96 backdrop-blur-xl shadow-lg shadow-orange-900/6`}
    >
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-3">
        <div>
          <img src="/safe-logo.png" className="w-40 h-18 my-10"></img>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-up"
            className={`hidden sm:block text-sm font-bold px-4 py-2 rounded-xl transition-all text-amber-950`}
          >
            Нэвтрэх
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-black px-5 py-2.5 rounded-2xl bg-linear-to-r from-[#f59e0b] to-[#ea580c] text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all"
          >
            Бүртгүүлэх ✨
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const [vis, setVis] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    setTimeout(() => setVis(true), 100);
    const interval = setInterval(
      () => setCurrentPhoto((p) => (p + 1) % ANIMAL_PHOTOS.length),
      3000,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#fffbf0] overflow-x-hidden"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(3deg)} }
        @keyframes floatR { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(-3deg)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .float { animation: float 3.5s ease-in-out infinite; }
        .floatR { animation: floatR 4s ease-in-out infinite; }
        .fade-slide { animation: fadeSlide 0.6s ease forwards; }
        .shimmer-text {
          background: linear-gradient(90deg, #f59e0b, #ea580c, #f59e0b, #fbbf24);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <Header />
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#431407] via-[#7c2d12] to-[#9a3412]" />

        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(251,191,36,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-2/3 h-full"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 80% 30%, rgba(234,88,12,0.15) 0%, transparent 70%)",
          }}
        />

        {[
          {
            e: "🐕",
            x: "4%",
            y: "20%",
            cls: "float",
            s: "text-5xl",
            delay: "0s",
          },
          {
            e: "🐈",
            x: "90%",
            y: "15%",
            cls: "floatR",
            s: "text-4xl",
            delay: "0.5s",
          },
          {
            e: "🐾",
            x: "8%",
            y: "65%",
            cls: "floatR",
            s: "text-3xl",
            delay: "1s",
          },
          {
            e: "🦮",
            x: "85%",
            y: "65%",
            cls: "float",
            s: "text-5xl",
            delay: "1.5s",
          },
          {
            e: "🌻",
            x: "50%",
            y: "5%",
            cls: "float",
            s: "text-3xl",
            delay: "0.8s",
          },
          {
            e: "🍊",
            x: "92%",
            y: "45%",
            cls: "floatR",
            s: "text-2xl",
            delay: "0.3s",
          },
          {
            e: "⭐",
            x: "3%",
            y: "42%",
            cls: "float",
            s: "text-2xl",
            delay: "1.2s",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`absolute ${item.s} opacity-25 select-none pointer-events-none ${item.cls}`}
            style={{ left: item.x, top: item.y, animationDelay: item.delay }}
          >
            {item.e}
          </div>
        ))}

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            style={{
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s ease",
            }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-yellow-300 text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full mb-7">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              Монголын тэжээвэр амьтны платформ
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black text-white leading-[1.05] mb-6">
              <span className="shimmer-text">Амьтдыг хамгаалцгаая!</span>
            </h1>

            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-10 max-w-lg">
              Гудамжинд өссөн, хайр хүлээсэн амьтдыг авран — дулаан гэр, хайртай
              эзэнтэй болгоход тань бид тусална 🧡
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href="/sign-up"
                className="group flex items-center gap-3 bg-linear-to-r from-[#f59e0b] to-[#ea580c] text-white font-black px-8 py-4 rounded-2xl shadow-2xl shadow-orange-900/40 hover:scale-105 hover:shadow-orange-500/50 transition-all text-base"
              >
                <span className="text-xl">🐾</span>
                Бүртгүүлэх ✨
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </div>

          <div
            className="relative flex justify-center"
            style={{
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.9s ease 0.2s",
            }}
          >
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 xl:w-96 xl:h-96">
              <div className="absolute inset-0 rounded-[3rem] bg-linear-to-br from-[#f59e0b] to-[#ea580c] blur-2xl opacity-40 scale-110" />

              <div className="relative w-full h-full rounded-[3rem] overflow-hidden border-4 border-white/20 shadow-2xl">
                {ANIMAL_PHOTOS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Амьтан"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                    style={{ opacity: i === currentPhoto ? 1 : 0 }}
                  />
                ))}
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
              </div>

              <div className="absolute -bottom-5 -left-8 bg-white rounded-2xl px-4 py-3 fshadow-xl flex items-center gap-2.5 float">
                <span className="text-2xl">❤️</span>
                <div>
                  <div className="text-xs font-black text-[#431407]">
                    Өнөөдөр аврагдсан
                  </div>
                  <div className="text-lg font-black text-[#ea580c]">
                    12 амьтан
                  </div>
                </div>
              </div>

              <div className="absolute -top-5 -right-6 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2.5 floatR">
                <span className="text-2xl">🏠</span>
                <div>
                  <div className="text-xs font-black text-[#431407]">
                    Эзэнтэй болсон
                  </div>
                  <div className="text-lg font-black text-[#f59e0b]">
                    6 амьтан
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                {ANIMAL_PHOTOS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhoto(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentPhoto ? "bg-yellow-400 w-5" : "bg-white/30"}`}
                  />
                ))}
              </div>
            </div>
            <div
              className="absolute top-8 -left-12 w-24 h-24 rounded-2xl overflow-hidden border-3 border-white/40 shadow-xl float opacity-80 hidden lg:block"
              style={{ animationDelay: "1s" }}
            >
              <img
                src={ANIMAL_PHOTOS[2]}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute bottom-12 -right-10 w-20 h-20 rounded-2xl overflow-hidden border-3 border-white/40 shadow-xl floatR opacity-80 hidden lg:block"
              style={{ animationDelay: "0.5s" }}
            >
              <img
                src={ANIMAL_PHOTOS[4]}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            className="w-full h-20"
          >
            <path
              d="M0 80 L0 40 Q180 5 360 25 Q540 45 720 25 Q900 5 1080 25 Q1260 45 1440 25 L1440 80 Z"
              fill="#fffbf0"
            />
          </svg>
        </div>
      </section>
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 rounded-full bg-linear-to-b  from-[#f59e0b] to-[#ea580c]" />
            <h2 className="text-2xl font-black text-[#431407]">
              Тусламж хүлээж буй нөхдүүд
            </h2>
            <div className="ml-auto">
              <Link
                href="/sign-up"
                className="text-sm font-black text-[#ea580c] hover:underline"
              >
                Бүгдийг үзэх →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {ANIMAL_PHOTOS.map((src, i) => (
              <div
                key={i}
                className="group aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
              >
                <img
                  src={src}
                  alt="Амьтан"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-linear-to-br from-[#fff7ed] to-[#fffbf0]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-[#9a3412] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              🍊 Яаж ажилладаг вэ?
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-[#431407]">
              Хялбар 4 алхам
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: 1,
                emoji: "📝",
                title: "Бүртгүүлэх",
                desc: "Хэдхэн минутад бүртгэлээ үүсгэж мэдээллээ оруулна.",
                bg: "from-[#fef3c7] to-[#fde68a]",
              },
              {
                step: 2,
                emoji: "🐕",
                title:
                  "Тусламж хэрэгтэй амьтадын мэдээллийг харах болон оруулах боломжтой",
                desc: "",
                bg: "from-[#ffedd5] to-[#fed7aa]",
              },
              {
                step: 3,
                emoji: "🏡",
                title: "Тэжээвэр амьтнаа үрчлүүлэх болон амьтан үрчилж авах",
                desc: "",
                bg: "from-[#dcfce7] to-[#bbf7d0]",
              },
              {
                step: 4,
                emoji: "❤️",
                title: "Амьтны эмнэлгүүдийг мэдээллүүдийг харах боломжтой",
                desc: "",
                bg: "from-[#fce7f3] to-[#fbcfe8]",
              },
            ].map(({ step, emoji, title, desc, bg }) => (
              <div
                key={step}
                className={`relative rounded-[2rem] p-7 bg-linear-to-br ${bg} hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-200/60 transition-all duration-300 group overflow-hidden`}
              >
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/40 group-hover:scale-150 transition-transform duration-500" />
                <div className="text-4xl mb-4">{emoji}</div>
                <div className="text-xs font-black uppercase tracking-widest text-[#9a3412]/40 mb-1">
                  Алхам {step}
                </div>
                <h3 className="text-lg font-black text-[#431407] mb-2">
                  {title}
                </h3>
                <p className="text-sm text-[#78350f]/70 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-[#78350f] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              🌟 Зорилго & Алсын Хараа
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-[#431407]">
              Бидний Зорилго
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative rounded-[2.5rem] overflow-hidden bg-linear-to-br from-[#431407] to-[#7c2d12] p-10 text-white shadow-2xl shadow-orange-900/20">
              <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
                }}
              />
              <div className="absolute -bottom-8 -left-8 text-[120px] opacity-10 select-none">
                🎯
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#f59e0b] to-[#ea580c] flex items-center justify-center text-2xl shadow-lg">
                    🎯
                  </div>
                  <span className="text-lg font-black text-yellow-300 uppercase tracking-wider">
                    Зорилго
                  </span>
                </div>
                <h3 className="text-3xl font-black mb-4 leading-tight">
                  Гудамжны, алга болсон амьтдыг авран, эзэнтэй болгох
                </h3>
                <p className="text-white/70 text-base leading-relaxed">
                  Бид амьтдын амь насыг хамгаалж, хайр халамж өгөх гэр бүлтэй
                  болгохын тулд иргэд, байгууллагуудыг нэгтгэдэг. Гудамжинд
                  өссөн, төөрсөн амьтан бүрд дулаан гэр, хайртай эзэнтэй болгох
                  .
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {["Авран хамгаалах 🛡️", "Эзэнтэй болгох 🏠"].map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/10 border border-white/20 text-white/80 text-xs font-bold px-3 py-1.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative rounded-[2.5rem] overflow-hidden bg-linear-to-br from-[#f59e0b] to-[#f97316] p-10 text-white shadow-2xl shadow-orange-400/30">
              <div className="absolute -bottom-8 -right-8 text-[100px] opacity-15 select-none">
                🌅
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/25 flex items-center justify-center text-2xl shadow-lg">
                    🌅
                  </div>
                  <span className="text-lg font-black text-white/90 uppercase tracking-wider">
                    Алсын Хараа
                  </span>
                </div>
                <h3 className="text-2xl font-black mb-4 leading-tight">
                  Амьтан бүр хайрлагдах ертөнц
                </h3>
                <p className="text-white/85 text-sm leading-relaxed">
                  Орон гэргүй амьтдын тоог багасгах — дулаан гэр, сайн эзэнтэй
                  болгох.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    "Гудамжны амьтдын тоог багасгах",
                    "Амьтан аврах, эзэнтэй болгох",
                    "Амьтан тэжээх талаар мэдээлэл түгээх",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-black text-white shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-sm font-bold text-white/90">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {[
              {
                emoji: "💛",
                title: "Хайр",
                desc: "Амьтан бүрт болзолгүй хайр тавьдаг",
              },
              {
                emoji: "🤝",
                title: "Хамтын ажиллагаа",
                desc: "Иргэд, байгуулагуудтай хамтарч ажилладаг",
              },
              {
                emoji: "🌱",
                title: "Тогтвортой байдал",
                desc: "Урт хугацааны шийдлийг эрэлхийлдэг",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-[2rem] p-7 shadow-sm border border-orange-100 hover:shadow-xl hover:-translate-y-1.5 hover:border-orange-200 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{v.emoji}</div>
                <h3 className="text-lg font-black text-[#431407] mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-[#78350f]/65 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-[#fff7ed]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-[#431407]">
              ✨ Бидний онцлог
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title:
                  "Тусламж хэрэгтэй амьтдын мэдээллийг шууд харах боломжтой.",
              },
              {
                title: "Амьтнаа үрчлүүлэх эсвэл үрчилж авах ухаалаг шийдэл",
              },
              {
                title: "  Анх удаа тэжээвэр амьтан тэжээж байна уу?",
              },

              {
                title: "Ойролцоох амьтны эмнэлгийн мэдээллийг харах олно.",
              },
              {
                title:
                  "24/7 AI туслагч, амьтантай холбоотой зөвлөгөө, асуулт хариулт.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group flex gap-4 items-start bg-white rounded-3xl p-5 shadow-sm border border-orange-100 hover:border-[#f59e0b]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <h3 className=" text-center font-black text-[#431407] mb-1 text-sm">
                    {f.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
