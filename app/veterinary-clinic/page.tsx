"use client";

import { useState } from "react";
import {
  Phone,
  Clock,
  Mail,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

type Clinic = {
  id: number;
  name: string;
  address: string;
  phone: string | string[];
  hours?: string;
  image: string[];
  fbLink: string;
  email: string;
};

const veterinaryClinics: Clinic[] = [
  {
    id: 1,
    name: "SOS мал эмнэлэг",
    address: "БГД 11 хороо, Хувьсгалчдын 1 гудамж 15 тоот",
    phone: ["7017-1950", "7711-1950", "8900-1950", "8800-1950"],
    hours: "Даваа–Ням 9:00–19:00",
    image: ["/sos.jpg"],
    fbLink: "https://www.facebook.com/SOS.Animal.Health",
    email: "sos77111950@gmail.com",
  },
  {
    id: 2,
    name: "UB Vet амьтны эмнэлэг",
    address:
      "Хан-Уул дүүрэг, 19-р хороолол, Хан-Уул товертой уулзвараар урагшаа 300м",
    phone: ["7507-3555", "7007-3555"],
    hours: "Да–Ба 09–18 · Бямба 09–17 · Ням амарна",
    image: ["/ubVet.jpg"],
    fbLink: "https://www.facebook.com/UBVet",
    email: "ub-vet@hotmail.com",
  },
  {
    id: 3,
    name: "Амар мал эмнэлэг",
    address: "Баруун 4 зам, Өгөөж ХХК-ны урд, 39-р байр 1-р орц",
    phone: ["9115-1471", "9665-1195"],
    hours: "10:00–18:00 · Өдөр бүр",
    image: ["/amar2.jpg"],
    fbLink: "https://www.facebook.com/amarmalemneleg",
    email: "amarvetclinic@gmail.com",
  },
  {
    id: 4,
    name: "Сонор мал эмнэлэг",
    address:
      "БЗД, 14-р хороо, Централ молл хойно, Баян хүрээ хотхон 192-р байр",
    phone: ["7603-0547", "9117-0547"],
    hours: "Даваа–Ням 10:30–20:30",
    image: ["/sonorr.jpg"],
    fbLink: "https://www.facebook.com/Sonor91170547",
    email: "sonorclinic@gmail.con",
  },
  {
    id: 5,
    name: "City Paws мал эмнэлэг",
    address: "ЧД, 6-р хороо, Нийгмийн даатгалын хэлтсийн зүүн тал 65-р байр",
    hours: "Даваа–Ням 10:00–20:00",
    phone: ["9907-8300", "8507-8300"],
    image: ["/city-pawss.jpg"],
    fbLink: "https://www.facebook.com/profile.php?id=100077103117531",
    email: "citypaws8300@gmail.com",
  },
  {
    id: 6,
    name: "Animals Healthy мал эмнэлэг",
    address: "БЗД, Сансарын Баянцээлийн зүүн хойно 115-р байр",
    phone: "8804-4664",
    hours: "Лхагваас бусад бүх өдөр 11:00-18:00",
    image: ["/ah.jpg"],
    fbLink: "https://www.facebook.com/Sonor91170547",
    email: "animals.healthy@yahoo.com",
  },
  {
    id: 7,
    name: "ХААИС Мал амьтны эмнэлэг",
    address:
      "Улаанбаатар хот, Хан-Уул дүүрэг 22-р хороо Зайсан Мал эмнэлгийн сургуулийн ард",
    phone: "75107777",
    hours: "Мягмар–Баасан гарагт 09:00-17:00",
    image: ["/logo_muls.png"],
    fbLink: "https://www.facebook.com/lms.muls.edu.mn/",
    email: "",
  },
  {
    id: 8,
    name: "Жаргал мал эмнэлэг",
    address:
      "Баянгол дүүрэг, Баруун 4 зам, Гранд Плаза төвийн замын хойно Hillside хотхоны баруун талд 5 давхар байр, 1-р давхар",
    phone: "9985 2575",
    hours: "Даваа - Баасан: 09:00 - 18:00",
    image: ["/jargalo.jpg"],
    fbLink: "https://www.facebook.com/jargalvet",
    email: "jargalvetclinic@gmail.com",
  },
  {
    id: 9,
    name: "Энэрэх мал эмнэлэг",
    address:
      "Улаанбаатар хот, Хан-Уул дүүрэг, 20-р хороо, Чингисийн өргөн чөлөө 145/5",
    phone: "7011 4723",
    hours: "Даваа - Баасан: 09:00 - 16:30 Бямба: 09:00 - 17:30",
    image: ["/doggyg.jpg"],
    fbLink:
      "https://www.facebook.com/p/Энэрэх-мал-эмнэлэг-сургалтын-төв-100057807363343/",
    email: "Enerekhhospital@gmail.com",
  },
  {
    id: 10,
    name: "Жонон мал эмнэлэг",
    address: "Чингэлтэй дүүрэг, 6-р хороо Чикаго клубын зүүн талд",
    phone: "7777 6680",
    hours: "Даваа - Баасан: 09:00 - 19:00 Бямба - Ням: 10:00 - 18:00",
    image: ["/jonon.jpg"],
    fbLink: "https://www.facebook.com/JononVeternaryClinic/",
    email: "jononvetclinic@gmail.com",
  },
];

const PALETTES = [
  {
    num: "bg-teal-500",
    tag: "bg-teal-50 text-teal-700 border-teal-200",
    card: "hover:border-teal-200",
    dot: "bg-teal-400",
  },
  {
    num: "bg-sky-500",
    tag: "bg-sky-50 text-sky-700 border-sky-200",
    card: "hover:border-sky-200",
    dot: "bg-sky-400",
  },
  {
    num: "bg-violet-500",
    tag: "bg-violet-50 text-violet-700 border-violet-200",
    card: "hover:border-violet-200",
    dot: "bg-violet-400",
  },
  {
    num: "bg-emerald-500",
    tag: "bg-emerald-50 text-emerald-700 border-emerald-200",
    card: "hover:border-emerald-200",
    dot: "bg-emerald-400",
  },
  {
    num: "bg-rose-500",
    tag: "bg-rose-50 text-rose-700 border-rose-200",
    card: "hover:border-rose-200",
    dot: "bg-rose-400",
  },
  {
    num: "bg-indigo-500",
    tag: "bg-indigo-50 text-indigo-700 border-indigo-200",
    card: "hover:border-indigo-200",
    dot: "bg-indigo-400",
  },
];

const toPhones = (p: string | string[]) => (Array.isArray(p) ? p : [p]);

const Thumb = ({ images, name }: { images: string[]; name: string }) => {
  const [i, setI] = useState(0);
  const valid = images.filter(Boolean);
  if (!valid.length) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl select-none">
        🏥
      </div>
    );
  }
  return (
    <div className="relative w-full h-full group overflow-hidden">
      <img
        src={valid[i]}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {valid.length > 1 && (
        <>
          <button
            onClick={() => setI((p) => (p - 1 + valid.length) % valid.length)}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 text-gray-700 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setI((p) => (p + 1) % valid.length)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 text-gray-700 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
};

const Page = () => {
  const [search, setSearch] = useState("");

  const filtered = veterinaryClinics.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="relative  bg-linear-to-br from-rose-500 via-orange-400 to-amber-300 border-b border-orange-200 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-4 right-20 text-white/10 text-8xl select-none rotate-12 pointer-events-none">
          🐾
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-white/70" />
                  <span className="w-2 h-2 rounded-full bg-white/50" />
                  <span className="w-2 h-2 rounded-full bg-white/30" />
                </div>
                <span className="text-white/80 text-xs font-bold uppercase tracking-widest">
                  Улаанбаатар · {veterinaryClinics.length} эмнэлэг
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black leading-tight drop-shadow-sm">
                <span className="text-white">Амьтны</span>{" "}
                <span className="text-yellow-200 decoration-amber-200">
                  эмнэлгүүд
                </span>
              </h1>
              <p className="mt-2 text-white/80 text-sm max-w-sm leading-relaxed">
                Таны тэжээвэр амьтанд хамгийн ойр, найдвартай эмнэлгүүд
              </p>
            </div>

            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Эмнэлэг хайх..."
                className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/80 focus:outline-none focus:border-white/60 transition"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {[
              { icon: "🏥", label: `${veterinaryClinics.length} эмнэлэг` },
              { icon: "📍", label: "УБ хотын дотор" },
              { icon: "📞", label: "Шууд холбогдох" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold text-white"
              >
                {icon} {label}
              </div>
            ))}
          </div>
        </div>
        <img
          src={"/happy-cat.gif"}
          className="hidden md:block w-50 h-50 absolute top-26 right-5"
        ></img>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-bold">Хайлтад тохирох эмнэлэг олдсонгүй</p>
          </div>
        )}

        {filtered.map((clinic, i) => {
          const pal = PALETTES[i % PALETTES.length];
          return (
            <div
              key={clinic.id}
              className={`group bg-white border-2 border-gray-100 rounded-3xl overflow-hidden ${pal.card} hover:shadow-lg transition-all duration-200`}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative sm:w-48 shrink-0">
                  <div
                    className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-xl ${pal.num} flex items-center justify-center text-white font-black text-xs shadow`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="w-full sm:w-48 h-40 sm:h-full min-h-40">
                    <Thumb images={clinic.image} name={clinic.name} />
                  </div>
                </div>

                <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-2 h-2 rounded-full ${pal.dot} shrink-0`}
                      />
                      <h2 className="text-base font-black text-gray-800 leading-tight">
                        {clinic.name}
                      </h2>
                    </div>

                    <div
                      className={`inline-flex items-start gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold leading-relaxed mb-2 ${pal.tag}`}
                    >
                      📍 {clinic.address}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {clinic.hours && (
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {clinic.hours}
                        </div>
                      )}
                      {clinic.email && (
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <Mail className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          {clinic.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {toPhones(clinic.phone).map((p) => (
                      <a
                        key={p}
                        href={`tel:${p.replace(/\D/g, "")}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition"
                      >
                        <Phone className="w-3 h-3 text-teal-500" /> {p}
                      </a>
                    ))}

                    <a
                      href={clinic.fbLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-black hover:bg-blue-100 transition"
                    >
                      <ExternalLink className="w-3 h-3" /> Facebook
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pb-10 text-orange-500 text-xs">
        🐾 Нийт {veterinaryClinics.length} эмнэлэг · Улаанбаатар
      </div>
    </div>
  );
};

export default Page;
