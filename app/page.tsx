"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ── HEADER ──────────────────────────────────────────────────────────────────
function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <span className="text-lg">🐾</span>
          </div>
          <span
            className={`text-xl font-black tracking-tight transition-colors ${
              scrolled ? "text-gray-800" : "text-white"
            }`}
          >
            PawCare
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-7">
          {[
            { label: "Нүүр", href: "/" },
            { label: "Амьтад", href: "/animals" },
            { label: "Тэжээвэр", href: "/foster" },
            { label: "Зөвлөгөө", href: "/community" },
            { label: "Эмнэлэг", href: "/clinics" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold transition-colors hover:text-rose-400 ${
                scrolled ? "text-gray-600" : "text-white/85"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`hidden sm:block text-sm font-bold px-4 py-2 rounded-xl transition-all ${
              scrolled
                ? "text-gray-700 hover:bg-gray-100"
                : "text-white hover:bg-white/15"
            }`}
          >
            Нэвтрэх
          </Link>
          <Link
            href="/register"
            className="text-sm font-black px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-lg shadow-rose-400/30 hover:shadow-rose-400/50 hover:scale-105 transition-all"
          >
            Бүртгүүлэх
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── FLOATING BLOB ────────────────────────────────────────────────────────────
function Blob({ className, color }: { className: string; color: string }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-pulse ${className}`}
      style={{ background: color }}
    />
  );
}

// ── STEP CARD ─────────────────────────────────────────────────────────────────
function StepCard({
  step,
  emoji,
  title,
  desc,
  color,
  delay,
}: {
  step: number;
  emoji: string;
  title: string;
  desc: string;
  color: string;
  delay: string;
}) {
  return (
    <div
      className="group relative bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
      style={{ animationDelay: delay }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md"
        style={{ background: color }}
      >
        {emoji}
      </div>
      <div className="absolute top-5 right-5 text-6xl font-black opacity-5 select-none">
        {step}
      </div>
      <h3 className="text-base font-black text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// ── FEATURE CARD ──────────────────────────────────────────────────────────────
function FeatureCard({
  emoji,
  title,
  desc,
  gradient,
}: {
  emoji: string;
  title: string;
  desc: string;
  gradient: string;
}) {
  return (
    <div
      className={`relative rounded-3xl p-7 text-white overflow-hidden group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ${gradient}`}
    >
      <div className="absolute -bottom-6 -right-6 text-8xl opacity-15 group-hover:opacity-25 transition-opacity select-none">
        {emoji}
      </div>
      <div className="text-3xl mb-4">{emoji}</div>
      <h3 className="text-lg font-black mb-2">{title}</h3>
      <p className="text-sm text-white/80 leading-relaxed">{desc}</p>
    </div>
  );
}

// ── HOME PAGE ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfaf6] font-sans overflow-x-hidden">
      <Header />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-rose-500 to-orange-400" />

        {/* Animated blobs */}
        <Blob
          className="w-[500px] h-[500px] -top-32 -left-32 opacity-40"
          color="radial-gradient(circle, #f43f5e, transparent)"
        />
        <Blob
          className="w-[400px] h-[400px] top-20 right-0 opacity-30"
          color="radial-gradient(circle, #fb923c, transparent)"
        />
        <Blob
          className="w-[600px] h-[600px] bottom-0 left-1/4 opacity-20"
          color="radial-gradient(circle, #a78bfa, transparent)"
        />

        {/* Floating emojis */}
        {["🐕", "🐈", "🐇", "🐾", "🏠", "❤️", "🦮", "🐩"].map((e, i) => (
          <div
            key={i}
            className="absolute text-3xl sm:text-4xl opacity-20 select-none pointer-events-none animate-bounce"
            style={{
              left: `${8 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2.5 + (i % 3) * 0.5}s`,
            }}
          >
            {e}
          </div>
        ))}

        {/* Hero content */}
        <div
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <div className="inline-flex items-center gap-2.5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            Монголын тэжээвэр амьтны платформ
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white leading-[1.05] mb-6 drop-shadow-xl">
            Найзаа ол,{" "}
            <span className="relative">
              <span className="relative z-10">гэртээ ав</span>
              <svg
                className="absolute -bottom-2 left-0 w-full z-0"
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 10 Q37.5 2 75 10 Q112.5 18 150 10 Q187.5 2 225 10 Q262.5 18 300 10"
                  stroke="rgba(251,191,36,0.9)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-white/85 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Гудамжны амьтдыг авран, хайрлах гэр олоход тань туслана. Тэжээвэр
            амьтан, tur хэлтэс, мэргэжлийн зөвлөгөө — бүгд нэг дороос.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/animals"
              className="group flex items-center gap-3 bg-white text-rose-600 font-black px-8 py-4 rounded-2xl shadow-2xl shadow-black/20 hover:scale-105 hover:shadow-rose-200/50 transition-all text-base"
            >
              <span className="text-xl">🐾</span>
              Амьтан хайх
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
            <Link
              href="/help"
              className="flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/30 text-white font-black px-8 py-4 rounded-2xl hover:bg-white/25 transition-all text-base"
            >
              <span className="text-xl">🆘</span>
              Тусламж хэрэгтэй
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { n: "1,240+", label: "Аврагдсан" },
              { n: "380+", label: "Гэр олсон" },
              { n: "95+", label: "Эмнэлэг" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl py-4 px-2"
              >
                <div className="text-2xl font-black text-white">{s.n}</div>
                <div className="text-xs text-white/70 font-semibold mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-20">
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M0 80 L0 40 Q180 5 360 25 Q540 45 720 25 Q900 5 1080 25 Q1260 45 1440 25 L1440 80 Z"
              fill="#fdfaf6"
            />
          </svg>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              ✨ Яаж ажилладаг вэ?
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-800 mb-4">
              Хялбар 4 алхам
            </h2>
            <p className="text-gray-400 text-base max-w-md mx-auto">
              Амьтан аврахаас эхлээд гэр олох хүртэлх бүх үйл явц манай
              платформд байна
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StepCard
              step={1}
              emoji="📝"
              title="Бүртгүүлэх"
              desc="Системд нэвтэрч өөрийн мэдээллээ оруулан бүртгүүлнэ. Хэдхэн минутад дуусна."
              color="linear-gradient(135deg, #dbeafe, #bfdbfe)"
              delay="0ms"
            />
            <StepCard
              step={2}
              emoji="🐕"
              title="Мэдээлэл оруулах"
              desc="Тусламж хэрэгтэй амьтны мэдээллийг оруулна. Зургийг нь нэмж, байршлыг тэмдэглэнэ."
              color="linear-gradient(135deg, #fce7f3, #fbcfe8)"
              delay="100ms"
            />
            <StepCard
              step={3}
              emoji="🏠"
              title="Tur хэлтэс"
              desc="Тэжээвэр амьтантай хүмүүс tur хэлтэсний хүсэлт илгээнэ. Та тохирох хүнийг сонгоно."
              color="linear-gradient(135deg, #d1fae5, #a7f3d0)"
              delay="200ms"
            />
            <StepCard
              step={4}
              emoji="❤️"
              title="Гэр олох"
              desc="Амьтан дулаан гэртэй болж, хайрлах эзэнтэй болно. Бүгд аз жаргалтай!"
              color="linear-gradient(135deg, #fef3c7, #fde68a)"
              delay="300ms"
            />
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#fdfaf6] to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              🌟 Бидний онцлог
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-800">
              Бидэнтэй байх давуу тал
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              emoji="🆘"
              title="Авралын мэдээлэл"
              desc="Гудамжинд тусламж хэрэгтэй амьтан олсон бол тэр дороо мэдээлэл оруулаарай. Манай сайн дурынхан хурдан хариу үйлдэл үзүүлнэ."
              gradient="bg-gradient-to-br from-rose-500 to-pink-600"
            />
            <FeatureCard
              emoji="🏡"
              title="Tur хэлтэс"
              desc="Амьтан байнгын гэр олтол tur хэлтэсний хүмүүс халамжилна. Та хүсэлт илгээж, тохирох хүнийг анкетаар сонгоно."
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            />
            <FeatureCard
              emoji="💬"
              title="Зөвлөгөөний булан"
              desc="Анх удаа тэжээвэр амьтан авсан уу? Туршлагатай хүмүүсээс зөвлөгөө авж, AI chat-аар асуулт тавь."
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <FeatureCard
              emoji="🐾"
              title="Үрчилж авах"
              desc="Манай сайтаас амьтан үрчилж авах боломжтой. Анкет бөглөж, тухайн амьтны эзнийг сонирхуулаарай."
              gradient="bg-gradient-to-br from-amber-500 to-orange-500"
            />
            <FeatureCard
              emoji="🏥"
              title="Амьтны эмнэлэг"
              desc="Өөрт ойрхон амьтны эмнэлгүүдийг хайж олоорой. Байршил, үнэ, нээлттэй цаг бүгдийг нэг дороос шалгана."
              gradient="bg-gradient-to-br from-sky-500 to-blue-600"
            />
            <FeatureCard
              emoji="🤖"
              title="AI Туслагч"
              desc="Амьтны тухай асуулт байвал манай AI туслагчаас асуугаарай. 24/7 хариулт авна."
              gradient="bg-gradient-to-br from-fuchsia-500 to-pink-500"
            />
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 p-12 text-center shadow-2xl shadow-rose-300/40">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              {["🐕", "🐈", "🐾", "❤️", "🏠"].map((e, i) => (
                <span
                  key={i}
                  className="absolute text-5xl"
                  style={{
                    left: `${10 + i * 20}%`,
                    top: `${20 + (i % 2) * 40}%`,
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
            <div className="relative z-10">
              <div className="text-5xl mb-4">🐾</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Өнөөдөр нэгдээрэй
              </h2>
              <p className="text-white/85 text-base mb-8 max-w-md mx-auto leading-relaxed">
                Монголын амьтдыг авран, хайрлах гэр олоход бидэнтэй хамт нэгдэж
                ажиллаарай
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/register"
                  className="bg-white text-rose-600 font-black px-8 py-3.5 rounded-2xl hover:scale-105 hover:shadow-xl transition-all text-sm"
                >
                  Бүртгүүлэх — Үнэгүй
                </Link>
                <Link
                  href="/animals"
                  className="bg-white/20 backdrop-blur border border-white/30 text-white font-black px-8 py-3.5 rounded-2xl hover:bg-white/30 transition-all text-sm"
                >
                  Амьтад үзэх →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════════════════════ */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center">
                <span className="text-lg">🐾</span>
              </div>
              <span className="text-xl font-black">PawCare</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 PawCare Mongolia — Бүх амьтан хайр халамжийг зохистой авах
              ёстой ❤️
            </p>
            <div className="flex gap-5">
              {["Бидний тухай", "Холбоо барих", "Нууцлал"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
