"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type AdoptionForm = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  hasPet: boolean;
  age: string;
  address: string;
  status: string;
  phoneNumber: string;
  secondaryPhone: string;
  location: string;
  district: string;
  petInfo: string;
  notes: string;
};

type AdoptAnimal = {
  AggressionLevel: string;
  AggressionNote: string;
  CatFriendly: string;
  DogFriendly: string;
  KidFriendly: string;
  adoptionForms: AdoptionForm[];
  age: string;
  animalType: string;
  breed: string;
  createdAt: string;
  description: string;
  gender: string;
  healthInfo: string;
  id: string;
  images: string[];
  name: string;
  personality: string;
  status: string;
  sterilized: string;
  temporaryEnd: string;
  userId: string;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; emoji: string; pill: string; card: string; dot: string }
> = {
  PENDING: {
    label: "Хүлээгдэж байна",
    emoji: "⏳",
    pill: "bg-amber-100 border-amber-300 text-amber-700",
    card: "border-amber-200 hover:border-amber-400",
    dot: "bg-amber-400",
  },
  APPROVED: {
    label: "Зөвшөөрсөн",
    emoji: "✅",
    pill: "bg-green-100 border-green-300 text-green-700",
    card: "border-green-200 hover:border-green-400",
    dot: "bg-green-400",
  },
  REJECTED: {
    label: "Татгалзсан",
    emoji: "❌",
    pill: "bg-red-100 border-red-300 text-red-600",
    card: "border-red-200 hover:border-red-400",
    dot: "bg-red-400",
  },
};

const ALL_FILTERS = [
  { key: null, label: "Бүгд", emoji: "🐾" },
  { key: "PENDING", label: "Хүлээгдэж байна", emoji: "⏳" },
  { key: "APPROVED", label: "Зөвшөөрсөн", emoji: "✅" },
  { key: "REJECTED", label: "Татгалзсан", emoji: "❌" },
];

const MiniGallery = ({ images, name }: { images: string[]; name: string }) => {
  const [idx, setIdx] = useState(0);
  if (!images?.length)
    return (
      <div className="w-full aspect-4/3 rounded-2xl bg-amber-100 flex items-center justify-center text-5xl">
        🐾
      </div>
    );
  return (
    <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden group shadow-md">
      <img
        src={images[idx]}
        alt={name}
        className="w-full h-full object-cover transition-all duration-300"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={() =>
              setIdx((p) => (p - 1 + images.length) % images.length)
            }
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 text-orange-500 font-black flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition text-lg"
          >
            ‹
          </button>
          <button
            onClick={() => setIdx((p) => (p + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 text-orange-500 font-black flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition text-lg"
          >
            ›
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-3" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
      <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
        {idx + 1}/{images.length}
      </div>
    </div>
  );
};

const Chip = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <div className="flex flex-col bg-amber-50 border border-amber-200 rounded-xl p-2.5 gap-0.5">
    <span className="text-base">{icon}</span>
    <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">
      {label}
    </span>
    <span className="text-gray-800 font-bold text-xs">{value || "—"}</span>
  </div>
);

const FriendlyChip = ({ label, value }: { label: string; value: string }) => {
  const isYes = value === "Yes";
  const isNo = value === "No";
  return (
    <div
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold
      ${isYes ? "bg-green-50 border-green-300 text-green-700" : isNo ? "bg-red-50 border-red-200 text-red-500" : "bg-gray-50 border-gray-200 text-gray-400"}`}
    >
      <span>{isYes ? "✅" : isNo ? "❌" : "❓"}</span>
      {label}
    </div>
  );
};

const Page = () => {
  const params = useParams();
  const animalId = params.animalId;
  const { push } = useRouter();

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [adoptAnimal, setAdoptAnimal] = useState<AdoptAnimal>();

  const fetchAdoptAnimal = async () => {
    const res = await fetch(`/api/myBreedingAnimal/${animalId}`);
    if (res.ok) setAdoptAnimal(await res.json());
  };

  useEffect(() => {
    fetchAdoptAnimal();
  }, [animalId]);

  const filteredForms =
    adoptAnimal?.adoptionForms.filter(
      (f) => statusFilter === null || f.status === statusFilter,
    ) ?? [];

  const counts = {
    all: adoptAnimal?.adoptionForms.length ?? 0,
    PENDING:
      adoptAnimal?.adoptionForms.filter((f) => f.status === "PENDING").length ??
      0,
    APPROVED:
      adoptAnimal?.adoptionForms.filter((f) => f.status === "APPROVED")
        .length ?? 0,
    REJECTED:
      adoptAnimal?.adoptionForms.filter((f) => f.status === "REJECTED")
        .length ?? 0,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="relative bg-linear-to-r from-orange-500 via-amber-400 to-yellow-300 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-8 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute top-4 right-12 text-white/15 text-8xl select-none rotate-12">
          🐾
        </div>
        <div className="relative max-w-3xl mx-auto px-5 py-8">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            📋 Үрчлүүлэх амьтны мэдээллийн самбар
          </div>
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-full sm:w-52 shrink-0">
              <MiniGallery
                images={adoptAnimal?.images ?? []}
                name={adoptAnimal?.name ?? ""}
              />
            </div>

            <div className="flex-1 text-white space-y-3">
              <div>
                <h1 className="text-3xl font-black drop-shadow">
                  {adoptAnimal?.name ?? "..."}
                </h1>
                <p className="text-white/80 text-sm mt-0.5">
                  {adoptAnimal?.breed} ·{" "}
                  {adoptAnimal?.animalType === "Dog" ? "🐕 Нохой" : "🐱 Муур"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { icon: "🎂", label: adoptAnimal?.age ?? "—" },
                  {
                    icon: adoptAnimal?.gender === "MALE" ? "♂️" : "♀️",
                    label: adoptAnimal?.gender === "MALE" ? "Эр" : "Эм",
                  },
                  {
                    icon: "🏥",
                    label:
                      adoptAnimal?.sterilized === "true"
                        ? "Заслагатай"
                        : "Заслагагүй",
                  },
                  {
                    icon: "📊",
                    label:
                      adoptAnimal?.status === "TEMPORARY"
                        ? "Түр зуур"
                        : "Бүрмөсөн",
                  },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    {icon} {label}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <FriendlyChip
                  label="Нохойтой"
                  value={adoptAnimal?.DogFriendly ?? ""}
                />
                <FriendlyChip
                  label="Мууртай"
                  value={adoptAnimal?.CatFriendly ?? ""}
                />
                <FriendlyChip
                  label="Хүүхэдтэй"
                  value={adoptAnimal?.KidFriendly ?? ""}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1.5 h-8 rounded-full bg-orange-400" />
          <h2 className="text-xl font-black text-gray-800">
            🐾 Үрчлэх хүсэлтүүд
          </h2>
          <span className="ml-1 text-xs font-black px-2.5 py-1 rounded-full text-white bg-orange-400">
            {counts.all}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white rounded-2xl shadow-sm border border-gray-100 w-fit">
          {ALL_FILTERS.map(({ key, label, emoji }) => {
            const count =
              key === null ? counts.all : counts[key as keyof typeof counts];
            const active = statusFilter === key;
            return (
              <button
                key={String(key)}
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-black transition-all
                  ${
                    active
                      ? "bg-linear-to-r from-orange-500 to-amber-400 text-white shadow-md scale-105"
                      : "text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                  }`}
              >
                {emoji} {label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-black
                  ${active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-400"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredForms.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-3">📭</div>
            <p className="font-black text-gray-500 text-lg">
              {statusFilter === null
                ? "Одоогоор үрчлэх хүсэлт ирээгүй байна"
                : `"${STATUS_CONFIG[statusFilter]?.label}" хүсэлт байхгүй байна`}
            </p>
            <p className="text-gray-300 text-sm mt-1">
              Хүсэлт ирэхэд энд харагдана
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredForms.map((form, i) => {
              const cfg =
                STATUS_CONFIG[form.status] ?? STATUS_CONFIG["PENDING"];
              return (
                <div
                  key={form.id}
                  className={`bg-white rounded-3xl border-2 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${cfg.card}`}
                >
                  <div className={`h-1.5 w-full ${cfg.dot}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl ${cfg.pill} border flex items-center justify-center text-lg font-black shrink-0`}
                        >
                          {form.firstName?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-base">
                            {form.firstName} {form.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {form.age} нас · {form.district || form.location}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-black shrink-0 ${cfg.pill}`}
                      >
                        {cfg.emoji} {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.phoneNumber && (
                        <div className="flex items-center gap-1 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          📞 {form.phoneNumber}
                        </div>
                      )}
                      {form.email && (
                        <div className="flex items-center gap-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          ✉️ {form.email}
                        </div>
                      )}
                      {form.hasPet && (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          🐾 Гэрийн тэжээвэр амьтантай
                        </div>
                      )}
                    </div>

                    {form.notes && (
                      <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <p className="text-xs text-gray-400 font-bold mb-0.5">
                          💬 Тэмдэглэл
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                          {form.notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => push(`/help-animal/form/${form.id}`)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-white text-sm
                        bg-linear-to-r from-orange-500 to-amber-400
                          hover:from-orange-600 hover:to-amber-500
                          active:scale-95 transition-all shadow-sm"
                      >
                        Анкет харах →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
