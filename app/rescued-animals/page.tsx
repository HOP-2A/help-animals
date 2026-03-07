"use client";

import { useEffect, useState } from "react";
import HeadBar from "../_components/headbar";

type HelpAnimal = {
  id: string;
  location: string;
  images: string[];
  status: string;
  condition: string;
};

function useCount(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    const step = Math.ceil(target / (duration / 16));
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      setCount(cur);
      if (cur >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return count;
}

export default function RescuedAnimals() {
  const [animals, setAnimals] = useState<HelpAnimal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const count = useCount(animals.length);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/help-animal");
      if (res.ok) {
        const data: HelpAnimal[] = await res.json();
        setAnimals(data.filter((a) => a.status === "RESCUED"));
        setTimeout(() => setLoaded(true), 120);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdf8f2] overflow-x-hidden">
      <HeadBar />

      <div className="relative bg-linear-to-br from-rose-400 via-orange-300 to-amber-300 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/15 blur-2xl pointer-events-none" />
        <div className="absolute top-8 right-0 w-64 h-64 rounded-full bg-rose-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-72 h-40 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

        <div className="absolute top-8 left-[8%] rotate-12 text-4xl opacity-20 select-none pointer-events-none">
          🐾
        </div>
        <div className="absolute top-14 right-[12%] -rotate-6 text-5xl opacity-15 select-none pointer-events-none">
          🐾
        </div>
        <div className="absolute bottom-12 left-[20%] rotate-6 text-3xl opacity-20 select-none pointer-events-none">
          🐾
        </div>
        <div className="absolute bottom-8 right-[25%] -rotate-12 text-4xl opacity-15 select-none pointer-events-none">
          🐾
        </div>

        <div className="relative max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-md border border-white/30 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Аврагдсан амьтад
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight drop-shadow-md">
            Тэд гэртээ
            <br />
            <span className="relative inline-block mt-1">
              буцаж ирлээ
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 7 Q25 2 50 7 Q75 12 100 7 Q125 2 150 7 Q175 12 200 7"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            🏠
          </h1>

          <p className="mt-6 text-white/85 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
            Гудамжинд өссөн, тусламж хүсэн хүлээсэн эдгээр найзууд — одоо дулаан
            гэрт, хайртай эзэнтэйгээ
          </p>

          {animals.length > 0 && (
            <div className="mt-8 inline-flex flex-col items-center bg-white/20 backdrop-blur-md border border-white/30 px-8 py-4 rounded-3xl shadow-lg">
              <span className="text-5xl font-black text-white leading-none tabular-nums">
                {count}
              </span>
              <span className="text-white/80 text-sm font-bold mt-1 uppercase tracking-wider">
                амьтан аврагдсан ❤️
              </span>
            </div>
          )}
        </div>

        <div className="relative h-14">
          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 1440 56"
            preserveAspectRatio="none"
          >
            <path
              d="M0 56 L0 28 Q180 0 360 18 Q540 36 720 18 Q900 0 1080 18 Q1260 36 1440 18 L1440 56 Z"
              fill="#fdf8f2"
            />
          </svg>
        </div>
        <img src="/h-cat.gif" className="absolute bottom-10 right-5"></img>
        <img
          src="/m-dog.gif"
          className="absolute bottom-13 left-5 w-61 h-61"
        ></img>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24">
        {animals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-28 h-28 rounded-full bg-linear-to-br from-rose-100 to-amber-100 flex items-center justify-center text-6xl mb-6 shadow-inner">
              🐾
            </div>
            <h3 className="text-2xl font-black text-gray-700 mb-2">
              Одоогоор мэдээлэл байхгүй
            </h3>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Аврагдсан амьтдын мэдээлэл нэмэгдэхэд энд харагдана
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-8 pt-2">
              <div className="w-1.5 h-8 rounded-full bg-linear-to-b from-rose-400 to-amber-400" />
              <h2 className="text-xl font-black text-gray-800">
                Аврагдсан амьтдын дурсамж
              </h2>
              <div className="flex items-center gap-1.5 bg-rose-100 border border-rose-200 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span className="text-xs font-black text-rose-600">
                  {animals.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {animals.map((animal, i) => {
                const delay = (i % 10) * 50;
                return (
                  <div
                    key={animal.id}
                    style={{
                      opacity: loaded ? 1 : 0,
                      transform: loaded
                        ? "translateY(0) scale(1)"
                        : "translateY(16px) scale(0.97)",
                      transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
                    }}
                  >
                    <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-rose-100/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                      <img
                        src={animal.images?.[0] || "/placeholder.png"}
                        alt="Аврагдсан амьтан"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />

                      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />

                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-md">
                        <span className="text-[10px]">❤️</span>
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-wide">
                          Аврагдсан
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 text-center space-y-2 -mb-14">
              <div className="flex justify-center gap-2 text-2xl">
                <span>🐕</span>
                <span>🐈</span>
                <span>🐕</span>
                <span>🐈</span>
              </div>
              <p className="text-sm text-gray-600 font-semibold">
                Эдгээр амьтдыг аврасан бүх сайн сэтгэлтэй хүмүүст — баярлалаа ❤️
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
