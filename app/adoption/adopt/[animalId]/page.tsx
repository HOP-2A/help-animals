"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Animal = {
  id: string;
  name: string;
  breed: string;
  age: string;
  animalType: string;
  AggressionLevel: string;
  AggressionNote: string;
  DogFriendly: string;
  CatFriendly: string;
  KidFriendly: string;
  personality: string;
  temporaryEnd: string;
  status: string;
  gender: string;
  images: string[];
  healthInfo: string;
  description: string;
  sterilized: string;
  createdAt: string;
};

const FriendlyBadge = ({ label, value }: { label: string; value: string }) => {
  const isYes = value === "Yes";
  const isNo = value === "No";
  return (
    <div
      className={`flex flex-col items-center gap-1 px-3 py-3 rounded-2xl border-2 font-semibold text-sm text-center transition-all
        ${isYes ? "bg-amber-100 border-amber-400 text-amber-700" : isNo ? "bg-blue-50 border-blue-300 text-blue-500" : "bg-gray-50 border-gray-200 text-gray-400"}`}
    >
      <span className="text-2xl">{isYes ? "✅" : isNo ? "❌" : "❓"}</span>
      <span className="text-xs leading-tight">{label}</span>
      <span className="text-xs font-bold">
        {isYes ? "Нийцдэг" : isNo ? "Нийцдэггүй" : "Тодорхойгүй"}
      </span>
    </div>
  );
};

const AggressionBadge = ({ level }: { level: string }) => {
  const map: Record<string, { label: string; color: string }> = {
    Low: {
      label: "Бага",
      color: "bg-green-100 border-green-400 text-green-700",
    },
    Medium: {
      label: "Дунд",
      color: "bg-yellow-100 border-yellow-400 text-yellow-700",
    },
    High: {
      label: "Өндөр",
      color: "bg-red-100 border-red-400 text-red-700",
    },
  };
  const info = map[level] ?? {
    label: "Тодорхойгүй",
    color: "bg-gray-100 border-gray-300 text-gray-500",
    emoji: "❓",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 font-bold text-sm ${info.color}`}
    >
      {info.label}
    </span>
  );
};

const JourneyStep = ({
  step,
  title,
  desc,
  color,
  accent,
  icon,
  side,
}: {
  step: number;
  title: string;
  desc: string;
  color: string;
  accent: string;
  icon: string;
  side: "left" | "right";
}) => (
  <div
    className={`relative flex items-center gap-0 ${side === "right" ? "flex-row" : "flex-row-reverse"}`}
  >
    <div className={`flex-1 ${side === "right" ? "mr-3" : "ml-3"}`}>
      <div className={`rounded-2xl border-2 ${color} p-3 shadow-sm`}>
        <div
          className={`text-[10px] font-black uppercase tracking-wider mb-1 ${accent}`}
        >
          Алхам {step}
        </div>
        <div className="font-bold text-gray-800 text-sm">{title}</div>
        <div className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</div>
      </div>
    </div>
    <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-400 to-amber-300 flex items-center justify-center text-base shadow-lg border-4 border-white shrink-0 z-10">
      {icon}
    </div>
    <div className="flex-1" />
  </div>
);

const ImageGallery = ({ images, name }: { images: string[]; name: string }) => {
  const [selected, setSelected] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full">
      <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-2 ring-amber-200">
        <img
          src={images[selected]}
          alt={`${name} - зураг ${selected + 1}`}
          className="w-full h-full object-cover transition-all duration-300"
        />

        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
          {selected + 1} / {images.length}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setSelected((p) => (p - 1 + images.length) % images.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-orange-500 font-black text-lg transition-all active:scale-90"
            >
              ‹
            </button>
            <button
              onClick={() => setSelected((p) => (p + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-orange-500 font-black text-lg transition-all active:scale-90"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 px-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150 shadow-sm
                ${i === selected ? "border-orange-400 ring-2 ring-orange-300 scale-105" : "border-white hover:border-amber-300"}`}
            >
              <img
                src={src}
                alt={`thumb-${i}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Page = () => {
  const [animal, setAnimal] = useState<Animal>();
  const params = useParams();
  const animalId = params.animalId;
  const { push } = useRouter();

  const fetchAnimal = async () => {
    const res = await fetch(`/api/adopt-animal/${animalId}`);
    if (res.ok) {
      const data = await res.json();
      setAnimal(data);
    }
  };

  useEffect(() => {
    fetchAnimal();
  }, [animalId]);

  const infoItems = [
    { label: "Нас", value: animal?.age, icon: "🎂" },
    {
      label: "Хүйс",
      value: animal?.gender === "FEMALE" ? "Эмэгтэй" : "Эрэгтэй",
      icon: "⚥",
    },
    { label: "Үүлдэр", value: animal?.breed, icon: "🐕" },
    { label: "Эрүүл мэнд", value: animal?.healthInfo, icon: "❤️" },
    {
      label: "Заслага",
      value: animal?.sterilized === "true" ? "Тийм ✅" : "Үгүй ❌",
      icon: "🏥",
    },
    ...(animal?.status === "TEMPORARY"
      ? [
          {
            label: "Буцах хугацаа",
            value: animal?.temporaryEnd
              ? new Date(animal.temporaryEnd).toLocaleDateString("mn-MN")
              : "-",
            icon: "📅",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#fff8f0] font-sans overflow-x-hidden">
      <div className="relative bg-linear-to-br from-orange-500 via-amber-400 to-yellow-300 py-14 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-white/10 -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-4 right-10 text-white/20 text-8xl select-none rotate-12">
          🐾
        </div>
        <div className="absolute bottom-4 left-10 text-white/20 text-6xl select-none -rotate-12">
          🐾
        </div>

        <div className="relative max-w-xl mx-auto text-center">
          {animal?.images?.[0] ? (
            <div className="mx-auto mb-4 w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden ring-4 ring-amber-200">
              <img
                src={animal.images[0]}
                alt={animal.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="mx-auto mb-4 w-28 h-28 rounded-full border-4 border-white shadow-2xl bg-white/30 flex items-center justify-center ring-4 ring-amber-200">
              <span className="text-5xl">🐶</span>
            </div>
          )}
          <h1 className="text-4xl font-black text-white drop-shadow">
            Сайн уу! Намайг
            <span className="text-yellow-900 underline decoration-wavy decoration-white/60">
              {animal?.name ?? "..."}{" "}
            </span>{" "}
            гэдэг 🐾
          </h1>
          <p className="mt-2 text-white/90 font-semibold text-base">
            {animal?.breed} {animal?.breed && animal?.animalType && "·"}{" "}
            {animal?.animalType}
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pb-12">
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-8 border-l-4 border-dashed border-orange-300" />
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-400 to-amber-300 flex items-center justify-center text-xl shadow-md border-2 border-white">
            📸
          </div>
          <div className="w-0.5 h-4 border-l-4 border-dashed border-orange-300" />
        </div>

        {animal?.images && animal.images.length > 0 && (
          <div className="relative bg-white rounded-3xl shadow-xl border-2 border-orange-200 p-4">
            <div className="absolute -top-3 left-5 text-xl drop-shadow z-10">
              📍
            </div>
            <h2 className="text-sm font-black text-orange-500 mb-3 flex items-center gap-1">
              📸 {animal.name}-ийн зургууд
              <span className="ml-1 text-xs bg-orange-100 text-orange-400 rounded-full px-2 py-0.5 font-bold">
                {animal.images.length} зураг
              </span>
            </h2>
            <ImageGallery images={animal.images} name={animal.name} />
          </div>
        )}

        <div className="flex justify-end pr-6">
          <svg
            width="80"
            height="56"
            viewBox="0 0 80 56"
            fill="none"
            className="overflow-visible"
          >
            <path
              d="M10 0 Q10 28 40 28 Q70 28 70 56"
              stroke="#fb923c"
              strokeWidth="3.5"
              strokeDasharray="7 5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex justify-end pr-2">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-400 to-amber-300 flex items-center justify-center text-base shadow border-2 border-white">
            💛
          </div>
        </div>
        <div className="flex justify-end pr-6">
          <svg width="80" height="28" viewBox="0 0 80 28" fill="none">
            <path
              d="M70 0 Q70 14 40 14 Q10 14 10 28"
              stroke="#fb923c"
              strokeWidth="3.5"
              strokeDasharray="7 5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="relative mr-6">
          <div className="absolute -top-2 -right-4 text-xl drop-shadow z-10 -rotate-12">
            📍
          </div>
          <div className="bg-white rounded-3xl shadow-lg border-2 border-orange-200 p-5">
            <h2 className="text-sm font-black text-orange-500 mb-2">
              💛 Яагаад үрчлүүлэх болсон шалтгаан
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              {animal?.description || "Мэдээлэл байхгүй байна."}
            </p>
          </div>
        </div>

        <div className="flex justify-start pl-6">
          <svg width="80" height="56" viewBox="0 0 80 56" fill="none">
            <path
              d="M70 0 Q70 28 40 28 Q10 28 10 56"
              stroke="#fbbf24"
              strokeWidth="3.5"
              strokeDasharray="7 5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex justify-start pl-2">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-amber-400 to-yellow-300 flex items-center justify-center text-base shadow border-2 border-white">
            📋
          </div>
        </div>
        <div className="flex justify-start pl-6">
          <svg width="80" height="28" viewBox="0 0 80 28" fill="none">
            <path
              d="M10 0 Q10 14 40 14 Q70 14 70 28"
              stroke="#fbbf24"
              strokeWidth="3.5"
              strokeDasharray="7 5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="relative ml-6">
          <div className="absolute -top-2 -left-4 text-xl drop-shadow z-10">
            📍
          </div>
          <div className="bg-white rounded-3xl shadow-lg border-2 border-amber-200 p-5">
            <h2 className="text-sm font-black text-amber-600 mb-4">
              📋 Ерөнхий мэдээлэл
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {infoItems.map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex flex-col gap-0.5"
                >
                  <span className="text-lg">{icon}</span>
                  <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wide leading-tight">
                    {label}
                  </span>
                  <span className="text-gray-800 font-bold text-xs">
                    {value || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pr-6">
          <svg
            width="80"
            height="56"
            viewBox="0 0 80 56"
            fill="none"
            className="overflow-visible"
          >
            <path
              d="M10 0 Q10 28 40 28 Q70 28 70 56"
              stroke="#7dd3fc"
              strokeWidth="3.5"
              strokeDasharray="7 5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex justify-end pr-2">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-sky-400 to-blue-300 flex items-center justify-center text-base shadow border-2 border-white">
            😸
          </div>
        </div>
        <div className="flex justify-end pr-6">
          <svg width="80" height="28" viewBox="0 0 80 28" fill="none">
            <path
              d="M70 0 Q70 14 40 14 Q10 14 10 28"
              stroke="#7dd3fc"
              strokeWidth="3.5"
              strokeDasharray="7 5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="relative mr-6">
          <div className="absolute -top-2 -right-4 text-xl drop-shadow z-10 rotate-6">
            📍
          </div>
          <div className="bg-white rounded-3xl shadow-lg border-2 border-sky-200 p-5">
            <h2 className="text-sm font-black text-sky-500 mb-4">
              😸 Зан чанар
            </h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <FriendlyBadge
                label="Нохойтой"
                value={animal?.DogFriendly ?? ""}
              />
              <FriendlyBadge label="Муурт" value={animal?.CatFriendly ?? ""} />
              <FriendlyBadge
                label="Хүүхэдтэй"
                value={animal?.KidFriendly ?? ""}
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <span className=" font-semibold text-gray-500">
                Дайсагналын түвшин:
              </span>
              <AggressionBadge level={animal?.AggressionLevel ?? ""} />
            </div>
            <div className="text-sm font-black text-sky-500 mb-4">
              Зан аашны онцгой анхаарах зүйлс
            </div>
            {animal?.AggressionNote && (
              <p className="text-xs text-gray-600 bg-sky-50 border border-sky-200 rounded-xl p-3 leading-relaxed wrap-break-word">
                📝 {animal.AggressionNote}
              </p>
            )}

            <div className="text-sm font-black text-sky-500 mt-3"> Зан ааш</div>
            {animal?.personality && (
              <p className="mt-2 text-xs text-gray-700 bg-amber-50 border border-amber-200 rounded-xl p-3 leading-relaxed">
                ✨ {animal.personality}
              </p>
            )}
          </div>
        </div>

        {/* ── CENTER connector to journey ── */}
        <div className="flex flex-col items-center mt-1">
          <svg width="100" height="48" viewBox="0 0 100 48" fill="none">
            <path
              d="M30 0 Q30 24 50 24 Q70 24 70 48"
              stroke="#fb923c"
              strokeWidth="3.5"
              strokeDasharray="7 5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-400 to-amber-300 flex items-center justify-center text-xl shadow-lg border-2 border-white -mt-1">
            🗺️
          </div>
          <div className="w-0.5 h-5 border-l-4 border-dashed border-orange-300" />
        </div>

        {/* ── CARD 4: Journey timeline ── */}
        <div className="relative bg-white rounded-3xl shadow-lg border-2 border-orange-200 p-5">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl drop-shadow z-10">
            🏠
          </div>
          <h2 className="text-sm font-black text-orange-500 mb-6 text-center mt-1">
            Үрчлэлтийн үйл явц
          </h2>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 border-l-4 border-dashed border-amber-200 z-0" />
            <div className="space-y-3 relative z-10">
              <JourneyStep
                side="right"
                step={1}
                icon="📝"
                title="Анкет бөглөнө"
                desc="Маягтыг бүрэн бөглөж илгээнэ."
                color="border-yellow-300 bg-yellow-50"
                accent="text-yellow-600"
              />
              <div className="flex justify-center">
                <div className="h-3 border-l-4 border-dashed border-amber-200" />
              </div>
              <JourneyStep
                side="left"
                step={2}
                icon="🔍"
                title="Анкетыг хянана"
                desc="Таны мэдээллийг нягтлана"
                color="border-amber-300 bg-amber-50"
                accent="text-amber-600"
              />
              <div className="flex justify-center">
                <div className="h-3 border-l-4 border-dashed border-orange-300" />
              </div>
              <JourneyStep
                side="right"
                step={3}
                icon="📞"
                title="Тантай холбогдоно"
                desc="Анкет шалгуурыг давсан бол тань руу залгах эсвэл имэйл явуулна"
                color="border-orange-300 bg-orange-50"
                accent="text-orange-600"
              />
              <div className="flex justify-center">
                <div className="h-3 border-l-4 border-dashed border-sky-300" />
              </div>
              <JourneyStep
                side="left"
                step={4}
                icon="🤝"
                title="Амьтантайгаа уулзана"
                desc="Нүүр тулан уулзаж, шийдвэрээ гаргана"
                color="border-sky-300 bg-sky-50"
                accent="text-sky-600"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-0.5 h-8 border-l-4 border-dashed border-orange-300" />
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-orange-500 to-amber-400 flex items-center justify-center text-2xl shadow-xl border-4 border-white">
            🐾
          </div>
          <div className="w-0.5 h-4 border-l-4 border-dashed border-orange-300" />
        </div>

        <div className="bg-white rounded-3xl border-2 border-orange-200 shadow-xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            {animal?.name}-г гэртээ угтаж авахад бэлэн үү? 🏡
          </p>
          <button
            onClick={() => push(`/adoption/anket/${animal?.id}`)}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-black text-white text-lg 
              bg-linear-to-r from-orange-500 to-amber-400
              hover:from-orange-600 hover:to-amber-500
              active:scale-95 transition-all duration-150
              ring-4 ring-orange-200 hover:ring-orange-300 shadow-lg sun-glow-hover cursor-pointer"
          >
            🐾 {animal?.name ?? "Амьтан"}-г үрчлэх
          </button>
          <img src="/click-dog.gif" className="w-40 h-40 pt-5"></img>
          <p className="mt-3 text-xs text-gray-500">
            * Үрчлэлтийн шийдвэр гаргахаас өмнө сайтар бодоорой.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
