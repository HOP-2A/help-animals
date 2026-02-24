"use client";

import { Button } from "@/components/ui/button";
import HeadBar from "../../_components/headbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PawPrint, Heart, SlidersHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
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

  const filteredAnimals = adoptAnimals.filter((animal) => {
    if (animal.animalType !== "Cat") return false;
    if (genderFilter && animal.gender !== genderFilter) return false;
    if (statusFilter && animal.status !== statusFilter) return false;
    return true;
  });

  const hasActiveFilters = genderFilter || statusFilter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <HeadBar />

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 py-14 px-6 text-center">
        <div className="absolute top-4 left-8 opacity-20 rotate-[-15deg]">
          <PawPrint size={48} className="text-white" />
        </div>
        <div className="absolute bottom-4 right-10 opacity-20 rotate-[20deg]">
          <PawPrint size={64} className="text-white" />
        </div>
        <div className="absolute top-8 right-1/3 opacity-10 rotate-[10deg]">
          <PawPrint size={36} className="text-white" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-sm rounded-full px-5 py-2 text-white font-semibold text-sm mb-4 border border-white/40">
            <Heart size={14} fill="white" /> Муурыг гэр бүлдээ нэгтгэх
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-sm tracking-tight">
            Үрчлэх муур хайх 🐾
          </h1>
          <p className="mt-3 text-white/90 text-lg max-w-xl mx-auto">
            Та хайж буй найзаа олоорой — тэд таныг хүлээж байна!
          </p>
        </div>

        <svg
          className="absolute -bottom-1 left-0 w-full"
          viewBox="0 0 1440 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40 Z"
            fill="rgb(255 247 237)"
          />
        </svg>
      </div>

      {/* Filter Bar */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-amber-700 font-semibold">
            <SlidersHorizontal size={18} />
            <span>Шүүлтүүр:</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium text-sm transition-all
                  ${
                    statusFilter
                      ? "bg-orange-400 border-orange-400 text-white shadow-md"
                      : "bg-white border-orange-200 text-orange-600 hover:border-orange-400 hover:bg-orange-50"
                  }`}
              >
                {statusFilter === "TEMPORARY"
                  ? "Түр зуур"
                  : statusFilter === "PERMANENT"
                    ? "Байнгын"
                    : "Хугацаа"}
                {statusFilter && (
                  <X
                    size={14}
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatusFilter(null);
                    }}
                  />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl shadow-xl border-orange-100">
              <DropdownMenuItem
                onClick={() => setStatusFilter("TEMPORARY")}
                className="rounded-xl cursor-pointer hover:bg-orange-50 text-orange-700"
              >
                ⏳ Түр зуур харуулна
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setStatusFilter("PERMANENT")}
                className="rounded-xl cursor-pointer hover:bg-purple-50 text-purple-700"
              >
                🏡 Байнгын гэр бүл
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium text-sm transition-all
                  ${
                    genderFilter
                      ? "bg-rose-400 border-rose-400 text-white shadow-md"
                      : "bg-white border-rose-200 text-rose-600 hover:border-rose-400 hover:bg-rose-50"
                  }`}
              >
                {genderFilter === "MALE"
                  ? "🐾 Эрэгтэй"
                  : genderFilter === "FEMALE"
                    ? "🌸 Эмэгтэй"
                    : "Хүйс"}
                {genderFilter && (
                  <X
                    size={14}
                    onClick={(e) => {
                      e.stopPropagation();
                      setGenderFilter(null);
                    }}
                  />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl shadow-xl border-rose-100">
              <DropdownMenuItem
                onClick={() => setGenderFilter("MALE")}
                className="rounded-xl cursor-pointer hover:bg-blue-50 text-blue-700"
              >
                🐾 Эрэгтэй
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setGenderFilter("FEMALE")}
                className="rounded-xl cursor-pointer hover:bg-rose-50 text-rose-700"
              >
                🌸 Эмэгтэй
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setGenderFilter(null);
                setStatusFilter(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm font-medium transition-all"
            >
              <X size={14} /> Цэвэрлэх
            </button>
          )}

          <span className="ml-auto text-sm text-amber-600 font-semibold bg-amber-100 px-3 py-1.5 rounded-full">
            {filteredAnimals.length} муур олдлоо
          </span>
        </div>
      </div>

      {/* Dog Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-6xl w-full mx-auto px-4 pt-6 pb-24">
        {filteredAnimals.map((dog) => (
          <div
            key={dog.id}
            className="group relative"
            onMouseEnter={() => setHoveredId(dog.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className={`
                rounded-3xl overflow-hidden bg-white shadow-md border-2 border-transparent
                transition-all duration-300
                ${
                  hoveredId === dog.id
                    ? "shadow-2xl shadow-orange-200 -translate-y-2 border-orange-300"
                    : "hover:shadow-lg"
                }
              `}
            >
              <div className="relative overflow-hidden">
                <img
                  src={dog.images?.[0] || "/placeholder.png"}
                  alt={dog.name}
                  className={`w-full aspect-square object-cover transition-transform duration-500 ${
                    hoveredId === dog.id ? "scale-105" : "scale-100"
                  }`}
                />

                <span
                  className={`
                    absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md
                    ${
                      dog.status === "TEMPORARY"
                        ? "bg-gradient-to-r from-sky-400 to-blue-500"
                        : "bg-gradient-to-r from-violet-400 to-purple-600"
                    }
                  `}
                >
                  {dog.status === "TEMPORARY" ? "⏳ Түр" : "🏡 Байнгын"}
                </span>

                <span
                  className={`
                    absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md
                    ${
                      dog.gender === "MALE"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-rose-100 text-rose-500"
                    }
                  `}
                >
                  {dog.gender === "MALE" ? "♂" : "♀"}
                </span>

                <div
                  className={`absolute inset-0 bg-gradient-to-t from-orange-500/30 to-transparent transition-opacity duration-300 ${
                    hoveredId === dog.id ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-gray-800 tracking-tight">
                    {dog.name}
                  </h3>
                  <PawPrint size={18} className="text-orange-300" />
                </div>

                <span
                  className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                    dog.gender === "MALE"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-rose-100 text-rose-500"
                  }`}
                >
                  {dog.gender === "MALE" ? "Эрэгтэй" : "Эмэгтэй"}
                </span>

                <p className="text-xs text-gray-400 font-medium">
                  📅 {new Date(dog.createdAt).toLocaleDateString()}
                </p>

                <button
                  className="w-full py-2.5 rounded-2xl font-bold text-sm text-white transition-all duration-200
                    bg-gradient-to-r from-orange-400 to-amber-400
                    shadow-[0_4px_0_#c2410c]
                    hover:from-orange-500 hover:to-amber-500
                    hover:shadow-[0_6px_0_#9a3412]
                    active:translate-y-1 active:shadow-[0_2px_0_#9a3412]
                    cursor-pointer"
                  onClick={() => push(`/help-animal/location/${dog.id}`)}
                >
                  🐾 Үрчлэх — {dog.name}
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAnimals.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-4">🐾</div>
            <h3 className="text-2xl font-bold text-amber-700 mb-2">
              Муур олдсонгүй
            </h3>
            <p className="text-amber-500 max-w-sm">
              Шүүлтүүрээ өөрчилж дахин хайна уу. Тэд таныг хаа нэгтээ хүлээж
              байна!
            </p>
            <button
              onClick={() => {
                setGenderFilter(null);
                setStatusFilter(null);
              }}
              className="mt-6 px-6 py-3 rounded-2xl bg-orange-400 text-white font-bold hover:bg-orange-500 transition-colors shadow-md"
            >
              Шүүлтүүр цэвэрлэх
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
