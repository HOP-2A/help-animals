"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { upload } from "@vercel/blob/client";
import dynamic from "next/dynamic";
import HeadBar from "../_components/headbar";
import {
  Heart,
  MapPinned,
  PawPrint,
  MapPin,
  HeartPulse,
  Image as ImageIcon,
  Star,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/useAuth";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type HelpAnimal = {
  id: string;
  location: string;
  description: string;
  images: string[];
  status: string;
  userId: string;
  condition: string;
  lat: number;
  lng: number;
  phoneNumber: string;
  user: { id: string; firstName: string; lastName: string; profileImg: string };
};

type DecoPosition = {
  size: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  rot: number;
  op: number;
};

const decorations: DecoPosition[] = [
  { size: 52, top: "10%", left: "6%", rot: -20, op: 0.15 },
  { size: 36, top: "15%", right: "8%", rot: 15, op: 0.12 },
  { size: 28, bottom: "12%", right: "20%", rot: 30, op: 0.1 },
];

const SelectLocationMap = dynamic(() => import("../components/googlemap"), {
  ssr: false,
});
type ImageItem = { file: File; url: string };

const statusConfig: Record<
  string,
  { label: string; color: string; emoji: string }
> = {
  LOST: {
    label: "Алга болсон",
    color: "from-red-400 to-rose-500",
    emoji: "🔴",
  },
  HOMELESS: {
    label: "Гудамжны",
    color: "from-blue-500 to-indigo-600",
    emoji: "🏠",
  },
  IN_PROGRESS: {
    label: "Аврагдаж байна",
    color: "from-amber-400 to-yellow-500",
    emoji: "⏳",
  },
  RESCUED: {
    label: "Аврагдсан",
    color: "from-green-400 to-emerald-500",
    emoji: "✅",
  },
};

const conditionConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  HEALTHY: {
    label: "Эрүүл",
    bg: "bg-green-100",
    text: "text-green-700",
  },
  INJURED: {
    label: "Бэртсэн",
    bg: "bg-red-100",
    text: "text-red-700",
  },
  STARVING: {
    label: "Өлссөн/сульдсан",
    bg: "bg-orange-100",
    text: "text-orange-700",
  },
};

const Page = () => {
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id ?? null;
  const { user } = useAuth(clerkId);
  const userId = user?.id;

  const [inputValues, setInputValues] = useState({
    animalStatus: "",
    healthCondition: "",
    location: "",
    description: "",
    images: [],
    phoneNumber: "",
  });
  const [allHelpAnimals, setHelpAnimals] = useState<HelpAnimal[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const { push } = useRouter();

  const handleLocationSelect = (lat: number, lng: number) =>
    setLocation({ lat, lng });

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setImages((prev) => [
      ...prev,
      ...Array.from(files).map((file) => ({ file, url: "" })),
    ]);
  };

  const uploadImages = async () => {
    setUploading(true);
    const updated = await Promise.all(
      images.map(async (img) => {
        if (img.url) return img;
        const uploaded = await upload(img.file.name, img.file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        return { ...img, url: uploaded.url };
      }),
    );
    setImages(updated);
    toast.success("Зураг амжилттай хуулагдлаа!");
    setUploading(false);
    return updated;
  };

  const createdHelpAnimal = async () => {
    if (!location) {
      toast.error("Байршлаа сонгоно уу");
      return;
    }
    const uploaded = await uploadImages();
    if (!uploaded.length) {
      toast.error("Зургуудыг оруулна уу");
      return;
    }
    const payload = {
      description: inputValues.description,
      images: uploaded.map((img) => img.url),
      status: inputValues.animalStatus,
      userId,
      condition: inputValues.healthCondition,
      lat: location.lat,
      lng: location.lng,
      location: inputValues.location,
      phoneNumber: inputValues.phoneNumber,
    };
    try {
      const res = await fetch("/api/help-animal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Амьтан аврах хүсэлт амжилттай илгээгдлээ!");
        setInputValues({
          animalStatus: "",
          healthCondition: "",
          location: "",
          description: "",
          images: [],
          phoneNumber: "",
        });
        setImages([]);
        setLocation(null);
        fetchHelpAnimals();
      } else {
        const data = await res.json();
        toast.error(data.error || "Алдаа гарлаа");
      }
    } catch {
      toast.error("Алдаа гарлаа");
    }
  };

  const handleInputs = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInputValues({ ...inputValues, [name]: value });
  };

  const fetchHelpAnimals = async () => {
    const res = await fetch("/api/help-animal");
    const data = await res.json();
    if (res.ok) setHelpAnimals(data);
  };

  const handleLike = async (postId: string) => {
    const res = await fetch(`/api/help-animal-like/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      const data = await res.json();
      setLiked((prev) => ({ ...prev, [postId]: data.message === "liked" }));
    }
  };

  useEffect(() => {
    fetchHelpAnimals();
  }, []);

  const helpAnimal = allHelpAnimals.filter((a) => a.status !== "RESCUED");

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg, #fef9f0 0%, #fff7ed 40%, #eff6ff 100%)",
      }}
    >
      <HeadBar />

      <div
        className="relative overflow-hidden py-16 px-6 text-center"
        style={{
          background:
            "linear-gradient(135deg, #1e3a5f 0%, #1e40af 60%, #1d4ed8 100%)",
        }}
      >
        <div
          className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #fbbf24, transparent)",
          }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-56 h-56 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #f97316, transparent)",
          }}
        />

        {decorations.map((p, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: p.top,
              left: p.left,
              right: p.right,
              bottom: p.bottom,
              transform: `rotate(${p.rot}deg)`,
              opacity: p.op,
            }}
          />
        ))}

        <div className="relative z-10 max-w-2xl mx-auto">
          <img src="cat-cute.gif" className="w-32 h-32 mx-auto mb-4" />
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 rounded-full px-5 py-2 text-amber-300 text-sm font-semibold mb-5 backdrop-blur-sm">
            <Heart size={14} fill="currentColor" /> Тусламж хэрэгтэй амьтад
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Нэг товшилт нэг
            <span
              className="block"
              style={{
                WebkitTextFillColor: "transparent",
                backgroundImage: "linear-gradient(90deg,#fbbf24,#f97316)",
                WebkitBackgroundClip: "text",
              }}
            >
              амийг аварна 🐾
            </span>
          </h1>
          <p className="mt-4 text-blue-200 text-base max-w-md mx-auto">
            Гудамжинд ганцаардсан, алга болсон, тусламж хэрэгтэй амьтдыг олж
            мэдэгдэж хамтдаа аварцгаая.
          </p>

          <Dialog>
            <DialogTrigger asChild>
              <button
                className="mt-8 inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-extrabold text-blue-900 text-lg transition-all duration-200 cursor-pointer
                shadow-[0_6px_0_#92400e] hover:shadow-[0_8px_0_#92400e] hover:-translate-y-1 active:translate-y-1 active:shadow-[0_3px_0_#92400e]"
                style={{
                  background: "linear-gradient(135deg,#fbbf24,#f97316)",
                }}
              >
                <PawPrint size={20} strokeWidth={2.5} />
                Тусламж хэрэгтэй амьтан нэмэх
              </button>
            </DialogTrigger>

            <DialogContent
              className="max-w-lg w-[95vw] rounded-3xl p-6 max-h-[90vh] overflow-y-auto border-0 shadow-2xl"
              style={{ background: "linear-gradient(160deg,#fef9f0,#fff7ed)" }}
            >
              <DialogHeader className="text-center space-y-2">
                <DialogTitle className="text-2xl font-black text-blue-900 flex justify-center items-center gap-2">
                  🐾 Амьтан аврах хүсэлт
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 leading-relaxed">
                  Тусламж хэрэгтэй амьтны мэдээллийг аль болох дэлгэрэнгүй
                  оруулна уу. Таны оруулсан мэдээлэл нэг амьтны амийг аварч
                  чадна ❤️
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                      <PawPrint size={15} className="text-orange-400" /> Амьтны
                      байдал <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={inputValues.animalStatus}
                      onValueChange={(v) =>
                        setInputValues({ ...inputValues, animalStatus: v })
                      }
                    >
                      <SelectTrigger className="rounded-xl border-amber-200 focus:ring-amber-300">
                        <SelectValue placeholder="Сонгох..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="LOST">🔴 Алга болсон</SelectItem>
                        <SelectItem value="HOMELESS">
                          🏠 Эзэнгүй / гудамжны
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                      <HeartPulse size={15} className="text-red-400" /> Эрүүл
                      мэнд <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={inputValues.healthCondition}
                      onValueChange={(v) =>
                        setInputValues({ ...inputValues, healthCondition: v })
                      }
                    >
                      <SelectTrigger className="rounded-xl border-amber-200 focus:ring-amber-300">
                        <SelectValue placeholder="Сонгох..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="HEALTHY">Эрүүл</SelectItem>
                        <SelectItem value="INJURED">Бэртсэн</SelectItem>
                        <SelectItem value="STARVING">
                          Өлссөн / сульдсан
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                    <MapPin size={15} className="text-red-500" /> Байршлын нэр{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Жишээ: Баянзүрх дүүрэг, 13-р хороолол..."
                    value={inputValues.location}
                    name="location"
                    onChange={handleInputs}
                    className="rounded-xl border-amber-200 focus-visible:ring-amber-300"
                  />
                </div>

                <div className="rounded-2xl border-2 border-amber-100 p-4 space-y-3 bg-amber-50/50">
                  <Label className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                    <MapPinned size={15} className="text-red-500" /> Газрын
                    зураг дээр байршил сонгох{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="overflow-hidden rounded-xl border-2 border-amber-200">
                    <SelectLocationMap onSelect={handleLocationSelect} />
                  </div>
                  {location && (
                    <p className="text-xs text-amber-600 font-medium bg-amber-100 rounded-lg px-3 py-1.5">
                      📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">
                    Утасны дугаар
                  </Label>
                  <Input
                    placeholder="Утасны дугаар оруулах"
                    value={inputValues.phoneNumber}
                    name="phoneNumber"
                    onChange={handleInputs}
                    className="rounded-xl border-amber-200 focus-visible:ring-amber-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">
                    Тайлбар <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Амьтны байдал, хэр удаан тэнд байсан, ямар тусламж хэрэгтэй мэт..."
                    rows={4}
                    value={inputValues.description}
                    name="description"
                    onChange={handleInputs}
                    className="rounded-xl border-amber-200 focus-visible:ring-amber-300 resize-none"
                  />
                </div>

                <div className="rounded-2xl border-2 border-amber-100 p-4 space-y-3 bg-orange-50/40">
                  <Label className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                    <ImageIcon size={15} className="text-pink-500" /> Амьтны
                    зураг <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFile}
                    className="cursor-pointer rounded-xl border-amber-200 file:bg-amber-400 file:text-white file:border-0 file:rounded-lg file:font-semibold"
                  />
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img.url || URL.createObjectURL(img.file)}
                            alt={`preview ${idx}`}
                            className="rounded-xl object-cover h-24 w-full border-2 border-amber-100"
                          />
                          <button
                            onClick={() =>
                              setImages((p) => p.filter((_, i) => i !== idx))
                            }
                            className="absolute top-1 right-1 bg-red-400 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md transition-colors"
                          >
                            ×
                          </button>
                          {img.url && (
                            <div className="absolute bottom-1 left-1 bg-green-400 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs">
                              ✓
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={uploadImages}
                    disabled={uploading}
                    className="w-full py-2.5 rounded-xl font-bold text-white text-sm transition-all cursor-pointer disabled:opacity-60
                      shadow-[0_3px_0_#c2410c] hover:shadow-[0_5px_0_#c2410c] hover:-translate-y-0.5 active:translate-y-0.5"
                    style={{
                      background: "linear-gradient(135deg,#f97316,#fbbf24)",
                    }}
                  >
                    {uploading
                      ? "⏳ Зураг байршуулаж байна..."
                      : "📸 Зураг байршуулах"}
                  </button>
                </div>

                <button
                  onClick={createdHelpAnimal}
                  className="w-full py-4 rounded-2xl font-extrabold text-blue-900 text-lg transition-all cursor-pointer
                    shadow-[0_5px_0_#92400e] hover:shadow-[0_7px_0_#92400e] hover:-translate-y-1 active:translate-y-1"
                  style={{
                    background: "linear-gradient(135deg,#fbbf24,#f97316)",
                  }}
                >
                  🐾 Тусламжийн хүсэлт илгээх
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <svg
          className="absolute -bottom-1 left-0 w-full"
          viewBox="0 0 1440 48"
          fill="none"
        >
          <path
            d="M0 48 C480 0 960 0 1440 48 L1440 48 L0 48 Z"
            fill="#fef9f0"
          />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Нийт хүсэлт",
              value: helpAnimal.length,
              emoji: "🐾",
              color: "from-orange-400 to-amber-400",
            },
            {
              label: "Алга болсон",
              value: helpAnimal.filter((a) => a.status === "LOST").length,
              emoji: "🔴",
              color: "from-red-400 to-rose-500",
            },
            {
              label: "Гудамжны",
              value: helpAnimal.filter((a) => a.status === "HOMELESS").length,
              emoji: "🏠",
              color: "from-blue-500 to-indigo-500",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white shadow-md border border-amber-100 p-4 text-center"
            >
              <div
                className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
              >
                {stat.emoji} {stat.value}
              </div>
              <div className="text-xs font-semibold text-gray-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
          <span className="text-orange-500 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <Heart size={14} fill="currentColor" /> Тусламж хүлээж буй амьтад
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-6xl w-full mx-auto px-4 pb-24">
        {helpAnimal.map((animal) => {
          const st = statusConfig[animal.status] || {
            label: animal.status,
            color: "from-gray-400 to-gray-500",
            emoji: "❓",
          };
          const cd = conditionConfig[animal.condition] || {
            label: animal.condition,
            bg: "bg-gray-100",
            text: "text-gray-700",
            emoji: "❓",
          };
          const isOwn = animal.userId === userId;
          const isHovered = hoveredId === animal.id;

          return (
            <div
              key={animal.id}
              onMouseEnter={() => setHoveredId(animal.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className={`rounded-3xl overflow-hidden bg-white border-2 transition-all duration-300
                ${isHovered ? "shadow-2xl shadow-orange-200 -translate-y-2 border-orange-300" : "shadow-md border-transparent hover:border-amber-100"}`}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={animal.images?.[0] || "/placeholder.png"}
                    alt="Animal"
                    className="w-full aspect-square object-cover transition-transform duration-500"
                    style={{
                      transform: isHovered ? "scale(1.07)" : "scale(1)",
                    }}
                  />

                  <span
                    className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${st.color}`}
                  >
                    {st.emoji} {st.label}
                  </span>

                  {isOwn && (
                    <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                      <Star size={16} className="text-white fill-white" />
                    </span>
                  )}

                  {!isOwn && (
                    <button
                      onClick={() => handleLike(animal.id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer
                        ${liked[animal.id] ? "bg-rose-400" : "bg-white/80 hover:bg-rose-100"}`}
                    >
                      <Heart
                        size={15}
                        className={
                          liked[animal.id]
                            ? "text-white fill-white"
                            : "text-rose-400"
                        }
                      />
                    </button>
                  )}

                  <div
                    className={`absolute inset-0 bg-linear-to-t from-orange-600/35 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
                  />
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${cd.bg} ${cd.text}`}
                    >
                      {cd.label}
                    </span>
                    <PawPrint size={16} className="text-orange-300" />
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-gray-500 font-medium">
                    <MapPin
                      size={13}
                      className="text-orange-400 mt-0.5 shrink-0"
                    />
                    <span className="line-clamp-2 wrap-break-word">
                      {animal.location}
                    </span>
                  </div>

                  <button
                    onClick={() => push(`/help-animal/location/${animal.id}`)}
                    className="w-full py-2.5 rounded-2xl font-bold text-sm text-white cursor-pointer transition-all duration-200
                      shadow-[0_4px_0_#c2410c] hover:shadow-[0_6px_0_#9a3412]
                      hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_#9a3412]"
                    style={{
                      background: "linear-gradient(135deg,#f97316,#fbbf24)",
                    }}
                  >
                    💛 Тусламж үзүүлэх
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {helpAnimal.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-28 text-center">
            <div className="text-8xl mb-5">🐾</div>
            <h3 className="text-2xl font-black text-blue-900 mb-2">
              Тусламж хүсэлт алга
            </h3>
            <p className="text-gray-400 max-w-sm">
              Одоогоор тусламж хэрэгтэй амьтад бүртгэгдээгүй байна. Та анхны
              мэдэгдэлийг нэмж болно!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
