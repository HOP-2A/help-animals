"use client";

import { Button } from "@/components/ui/button";
import HeadBar from "../_components/headbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PawPrint, Plus, Sparkles } from "lucide-react";

type AdoptAnimal = {
  id: string;
  gender: string;
  age: string;
  name: string;
  images: string[];
  animalType: string;
  sterilized: string;
  status: string;
  createdAt: string;
};

const Page = () => {
  const [adoptAnimals, setAdoptAnimals] = useState<AdoptAnimal[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { push } = useRouter();

  const fetchAdoptAnimals = async () => {
    const res = await fetch("/api/adopt-animal");
    if (res.ok) {
      const data = await res.json();
      setAdoptAnimals(data);
    }
  };

  useEffect(() => {
    fetchAdoptAnimals();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50">
      <HeadBar />

      <div
        className="relative overflow-hidden bg-gradient-to-r from-navy-800 via-blue-900 to-blue-800 py-16 px-6"
        style={{
          background:
            "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #1e3a5f 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #fbbf24, transparent)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #f97316, transparent)",
            transform: "translate(-30%, 30%)",
          }}
        />

        <div className="absolute top-6 left-12 opacity-15 rotate-[-20deg]">
          <PawPrint size={52} className="text-amber-300" />
        </div>
        <div className="absolute top-10 right-16 opacity-10 rotate-[15deg]">
          <PawPrint size={40} className="text-yellow-300" />
        </div>
        <div className="absolute bottom-6 right-1/3 opacity-10 rotate-[30deg]">
          <PawPrint size={32} className="text-orange-300" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 rounded-full px-5 py-2 text-amber-300 text-sm font-semibold mb-5 backdrop-blur-sm">
            <Sparkles size={14} /> Амьтдыг гэр бүлдээ нэгтгэх платформ
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Үрчлэлтийн
            <span
              className="block text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(90deg, #fbbf24, #f97316)",
              }}
            >
              Хуудас 🐾
            </span>
          </h1>
          <p className="mt-4 text-blue-200 text-lg max-w-xl mx-auto leading-relaxed">
            Хайртай НАЙЗАА олж, амьтдын амьдралыг өөрчил — өнөөдрөөс эхэл!
          </p>

          <button
            onClick={() => push("/adoption/add")}
            className="mt-8 inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-extrabold text-blue-900 text-lg transition-all duration-200 cursor-pointer
              shadow-[0_6px_0_#92400e]
              hover:shadow-[0_8px_0_#92400e] hover:-translate-y-1 hover:brightness-105
              active:translate-y-1 active:shadow-[0_3px_0_#92400e]"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f97316)" }}
          >
            <Plus size={20} strokeWidth={3} />
            Үрчлүүлэх амьтан нэмэх
          </button>
        </div>

        <svg
          className="absolute -bottom-1 left-0 w-full"
          viewBox="0 0 1440 48"
          fill="none"
        >
          <path
            d="M0 48 C480 0 960 0 1440 48 L1440 48 L0 48 Z"
            fill="rgb(255 247 237)"
          />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-center text-sm font-bold text-amber-600 uppercase tracking-widest mb-7">
          Амьтдын төрөл сонгох
        </h2>
        <div className="grid grid-cols-3 gap-5">
          {[
            {
              gif: "/wave-cute.gif",
              label: "Нохой",
              emoji: "🐶",
              route: "/adoption/dog",
              color: "from-orange-400 to-amber-400",
              shadow: "#c2410c",
              bg: "from-orange-50 to-amber-50",
              border: "border-orange-200",
            },
            {
              gif: "/nap-cat.gif",
              label: "Муур",
              emoji: "🐱",
              route: "/adoption/cat",
              color: "from-rose-400 to-pink-400",
              shadow: "#9f1239",
              bg: "from-rose-50 to-pink-50",
              border: "border-rose-200",
            },
            {
              gif: "/husky-shiba.gif",
              label: "Тусламж хэрэгтэй",
              emoji: "💛",
              route: "/help-animal",
              color: "from-blue-500 to-indigo-500",
              shadow: "#1e3a5f",
              bg: "from-blue-50 to-indigo-50",
              border: "border-blue-200",
            },
          ].map((cat) => (
            <button
              key={cat.label}
              onClick={() => push(cat.route)}
              className={`group relative flex flex-col items-center gap-3 p-6 rounded-3xl border-2 ${cat.border} bg-gradient-to-br ${cat.bg}
                hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`}
              />
              <img
                src={cat.gif}
                alt={cat.label}
                className="w-24 h-24 object-contain rounded-2xl group-hover:scale-110 transition-transform duration-300"
              />
              <div
                className={`px-4 py-2 rounded-xl font-bold text-white text-sm bg-gradient-to-r ${cat.color} shadow-md`}
                style={{ boxShadow: `0 3px 0 ${cat.shadow}` }}
              >
                {cat.emoji} {cat.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
          <span className="text-orange-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <PawPrint size={14} /> Бүх амьтад
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-6xl w-full mx-auto px-4 pt-8 pb-24">
        {adoptAnimals.map((animal) => (
          <div
            key={animal.id}
            onMouseEnter={() => setHoveredId(animal.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className={`rounded-3xl overflow-hidden bg-white border-2 transition-all duration-300
              ${
                hoveredId === animal.id
                  ? "shadow-2xl shadow-orange-200 -translate-y-2 border-orange-300"
                  : "shadow-md border-transparent hover:border-amber-200"
              }`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={animal.images?.[0] || "/placeholder.png"}
                  alt={animal.name}
                  className={`w-full aspect-square object-cover transition-transform duration-500 ${hoveredId === animal.id ? "scale-108" : "scale-100"}`}
                  style={{
                    transform:
                      hoveredId === animal.id ? "scale(1.08)" : "scale(1)",
                  }}
                />

                <span
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg
                  ${
                    animal.status === "TEMPORARY"
                      ? "bg-gradient-to-r from-sky-400 to-blue-600"
                      : "bg-gradient-to-r from-violet-500 to-purple-700"
                  }`}
                >
                  {animal.status === "TEMPORARY" ? "⏳ Түр" : "🏡 Байнгын"}
                </span>

                <span
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md
                  ${animal.gender === "MALE" ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-500"}`}
                >
                  {animal.gender === "MALE" ? "♂" : "♀"}
                </span>

                <div
                  className={`absolute inset-0 bg-gradient-to-t from-orange-600/40 via-transparent to-transparent transition-opacity duration-300 ${hoveredId === animal.id ? "opacity-100" : "opacity-0"}`}
                />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-gray-800">
                    {animal.name}
                  </h3>
                  <PawPrint size={17} className="text-orange-300" />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full
                    ${animal.gender === "MALE" ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-500"}`}
                  >
                    {animal.gender === "MALE" ? "🐾 Эрэгтэй" : "🌸 Эмэгтэй"}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                    {animal.animalType === "Dog"
                      ? "🐶 Нохой"
                      : animal.animalType === "Cat"
                        ? "🐱 Муур"
                        : animal.animalType}
                  </span>
                </div>

                <p className="text-xs text-gray-400 font-medium">
                  📅 {new Date(animal.createdAt).toLocaleDateString()}
                </p>

                <button
                  onClick={() => push(`/adoption/adopt/${animal.id}`)}
                  className="w-full py-2.5 rounded-2xl font-bold text-sm text-white cursor-pointer transition-all duration-200
                    shadow-[0_4px_0_#c2410c] hover:shadow-[0_6px_0_#9a3412]
                    hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_#9a3412]"
                  style={{
                    background: "linear-gradient(135deg, #f97316, #fbbf24)",
                  }}
                >
                  🐾 Үрчлэх — {animal.name}
                </button>
              </div>
            </div>
          </div>
        ))}

        {adoptAnimals.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-28 text-center">
            <div className="text-8xl mb-5 animate-bounce">🐾</div>
            <h3 className="text-2xl font-black text-blue-900 mb-2">
              Амьтад олдсонгүй
            </h3>
            <p className="text-gray-400 max-w-sm">
              Одоогоор мэдээлэл байхгүй байна. Та эхний амьтанаа нэмж болно!
            </p>
            <button
              onClick={() => push("/adoption/add")}
              className="mt-6 px-6 py-3 rounded-2xl font-bold text-white cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #f97316, #fbbf24)",
              }}
            >
              + Амьтан нэмэх
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
