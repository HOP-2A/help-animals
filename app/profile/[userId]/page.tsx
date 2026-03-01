"use client";

import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/useAuth";
import HeadBar from "../../_components/headbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Star, SquareX, MapPin, PawPrint } from "lucide-react";
import { useState, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FormReqSection from "@/app/components/FormReqSection";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImg: string;
  phoneNumber: string;
};

type AnimalStatus = "LOST" | "HOMELESS" | "IN_PROGRESS" | "RESCUED";
type AnimalCondition = "HEALTHY" | "INJURED" | "STARVING";

type HelpAnimal = {
  id: string;
  location: string;
  description: string;
  images: string[];
  status: AnimalStatus;
  userId: string;
  condition: AnimalCondition;
  lat: number;
  lng: number;
  phoneNumber: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImg: string;
  };
};

type AdoptAnimal = {
  id: string;
  animalType: string;
  breed: string;
  name: string;
  age: string;
  gender: string;
  status: string;
  userId: string;
  images: string[];
  temporaryEnd: string;
};

type ReqForm = {
  id: string;
  status: string;
  pet: {
    name: string;
    images: string[];
    status: string;
    id: string;
    animalType: string;
  };
};

const STATUS_MAP: Record<
  AnimalStatus,
  { label: string; color: string; bg: string }
> = {
  LOST: {
    label: "Төөрсөн",
    color: "text-red-700",
    bg: "bg-red-100 border-red-300",
  },
  HOMELESS: {
    label: "Эзэнгүй",
    color: "text-blue-700",
    bg: "bg-blue-100 border-blue-300",
  },
  IN_PROGRESS: {
    label: "Хайгдаж байна",
    color: "text-amber-700",
    bg: "bg-amber-100 border-amber-300",
  },
  RESCUED: {
    label: "Аврагдсан",
    color: "text-green-700",
    bg: "bg-green-100 border-green-300",
  },
};
const CONDITION_MAP: Record<
  AnimalCondition,
  { label: string; color: string; bg: string }
> = {
  HEALTHY: {
    label: "Эрүүл",
    color: "text-green-700",
    bg: "bg-green-50 border-green-300",
  },
  INJURED: {
    label: "Гэмтсэн",
    color: "text-red-700",
    bg: "bg-red-50 border-red-300",
  },
  STARVING: {
    label: "Өлссөн",
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-300",
  },
};
const ADOPT_STATUS_MAP: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  TEMPORARY: {
    label: "Түр зуур",
    color: "text-amber-700",
    bg: "bg-amber-100 border-amber-300",
  },
  PERMANENT: {
    label: "Бүрмөсөн",
    color: "text-sky-700",
    bg: "bg-sky-100 border-sky-300",
  },
};

const FORM_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    emoji: string;
    pill: string;
    stripe: string;
    glow: string;
    msg: string;
  }
> = {
  PENDING: {
    label: "Хүлээгдэж байна",
    emoji: "⏳",
    pill: "bg-amber-100 border-amber-300 text-amber-700",
    stripe: "bg-amber-400",
    glow: "hover:border-amber-300",
    msg: "Таны хүсэлтийг эзэн хянаж байна. Удахгүй хариу ирнэ!",
  },
  APPROVED: {
    label: "Зөвшөөрсөн",
    emoji: "✅",
    pill: "bg-green-100 border-green-300 text-green-700",
    stripe: "bg-green-400",
    glow: "hover:border-green-300",
    msg: "Баяр хүргэе! Таны хүсэлт зөвшөөрөгдлөө. Эзэнтэй холбогдоорой.",
  },
  REJECTED: {
    label: "Татгалзсан",
    emoji: "❌",
    pill: "bg-red-100 border-red-300 text-red-600",
    stripe: "bg-red-400",
    glow: "hover:border-red-300",
    msg: "Энэ удаа хүсэлт зөвшөөрөгдсөнгүй. Өөр амьтдыг үзнэ үү.",
  },
};

const REQ_FILTERS: { key: string | null; label: string; emoji: string }[] = [
  { key: null, label: "Бүгд", emoji: "🐾" },
  { key: "PENDING", label: "Хүлээгдэж байна", emoji: "⏳" },
  { key: "APPROVED", label: "Зөвшөөрсөн", emoji: "✅" },
  { key: "REJECTED", label: "Татгалзсан", emoji: "❌" },
];

const Pill = ({
  label,
  color,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${bg} ${color}`}
  >
    {label}
  </span>
);

const SectionTitle = ({
  emoji,
  title,
  count,
  accent,
}: {
  emoji: string;
  title: string;
  count: number;
  accent: string;
}) => (
  <div className={`flex items-center gap-3 mb-5`}>
    <div className={`w-1.5 h-8 rounded-full ${accent}`} />
    <h2 className="text-xl font-black text-gray-800">
      {emoji} {title}
    </h2>
    <span
      className={`ml-1 text-xs font-black px-2.5 py-1 rounded-full text-white ${accent}`}
    >
      {count}
    </span>
  </div>
);

const DeleteDialog = ({ onConfirm }: { onConfirm: () => void }) => (
  <Dialog>
    <DialogTrigger>
      <div className="w-7 h-7 rounded-full bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition cursor-pointer">
        <SquareX className="text-red-400 hover:text-red-600 w-4 h-4" />
      </div>
    </DialogTrigger>
    <DialogContent className="rounded-3xl max-w-sm">
      <DialogHeader>
        <DialogTitle className="text-center text-lg font-black">
          Устгахдаа итгэлтэй байна уу?
        </DialogTitle>
        <DialogDescription className="text-center text-gray-500 text-sm mt-1">
          Устгасан мэдээллийг дахин сэргээх боломжгүй.
        </DialogDescription>
      </DialogHeader>
      <div className="flex gap-3 mt-2">
        <DialogClose className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-bold transition">
          Цуцлах
        </DialogClose>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-black transition"
        >
          Устгах
        </button>
      </div>
    </DialogContent>
  </Dialog>
);

const EditStatusDialog = ({
  animal,
  onSave,
}: {
  animal: HelpAnimal;
  onSave: (postId: string, status: string, condition: string) => void;
}) => {
  const [status, setStatus] = useState(animal.status);
  const [condition, setCondition] = useState(animal.condition);

  return (
    <Dialog>
      <DialogTrigger>
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-400 border-2 border-white shadow flex items-center justify-center cursor-pointer hover:bg-amber-500 transition">
          <Star className="w-4 h-4 text-white fill-white" />
        </div>
      </DialogTrigger>
      <DialogContent className="rounded-3xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center font-black text-lg">
            Мэдээлэл шинэчлэх
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400 text-xs">
            Амьтны статус болон нөхцөлийг шинэчилнэ үү
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="bg-gray-50 rounded-2xl p-3 flex justify-between items-center text-sm">
            <span className="text-gray-500 font-semibold">
              Одоогийн статус:
            </span>
            <Pill {...STATUS_MAP[animal.status]} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600">
              Шинэ статус
            </label>
            <select
              className="w-full border-2 border-gray-100 rounded-xl p-2.5 text-sm focus:border-amber-400 focus:outline-none bg-gray-50"
              value={status}
              onChange={(e) => setStatus(e.target.value as AnimalStatus)}
            >
              <option value="RESCUED">Аврагдсан / Эзэнтэй болсон</option>
              <option value="HOMELESS">Эзэнгүй / гудамжны</option>
              <option value="LOST">Төөрсөн</option>
              <option value="IN_PROGRESS">Хайгдаж байна</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600">
              Биеийн байдал
            </label>
            <select
              className="w-full border-2 border-gray-100 rounded-xl p-2.5 text-sm focus:border-amber-400 focus:outline-none bg-gray-50"
              value={condition}
              onChange={(e) => setCondition(e.target.value as AnimalCondition)}
            >
              <option value="HEALTHY">Эрүүл</option>
              <option value="STARVING">Өлссөн / сульдсан</option>
              <option value="INJURED">Гэмтсэн</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <DialogClose className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition">
              Цуцлах
            </DialogClose>
            <button
              onClick={() => onSave(animal.id, status, condition)}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-white text-sm font-black transition shadow-sm"
            >
              Хадгалах
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Page = () => {
  const { push } = useRouter();

  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id ?? null;
  const { user } = useAuth(clerkId);
  const myId = user?.id;

  const params = useParams();
  const userId = params.userId;

  const [helpAnimals, setHelpAnimals] = useState<HelpAnimal[]>([]);
  const [myAdoptAnimal, setMyAdoptAnimal] = useState<AdoptAnimal[]>([]);
  const [reUser, setReUser] = useState<User | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [reqFilter, setReqFilter] = useState<string | null>(null);
  const [formReq, setFormReq] = useState<ReqForm[]>([]);

  const fetchUser = async () => {
    if (!userId) return;
    const res = await fetch(`/api/edit-profileImg`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) setReUser(await res.json());
  };

  const fetchRescue = async () => {
    if (!userId) return;
    const res = await fetch(`/api/my-rescue-animals/${userId}`);
    if (res.ok) setHelpAnimals(await res.json());
  };

  const fetchAdopt = async () => {
    if (!userId) return;
    const res = await fetch(`/api/my-adopt-animal/${userId}`);
    if (res.ok) setMyAdoptAnimal(await res.json());
  };

  const fetchForm = async () => {
    const res = await fetch(`/api/fetchForm/${userId}`);
    if (res.ok) {
      const data = await res.json();
      setFormReq(data);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser();
      fetchRescue();
      fetchAdopt();
      fetchForm();
    }
  }, [userId]);

  const handleSaveProfileImg = async () => {
    if (!imgFile) {
      toast.error("Нүүр зураг сонгоно уу.");
      return;
    }
    setUploading(true);
    try {
      const uploaded = await upload(imgFile.name, imgFile, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      const res = await fetch(`/api/edit-profileImg`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, imageUrl: uploaded.url }),
      });
      if (res.ok) {
        toast.success("Нүүр зураг шинэчлэгдлээ!");
        fetchUser();
      }
    } catch {
      toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setUploading(false);
    }
  };

  const editRescueAnimal = async (
    postId: string,
    status: string,
    condition: string,
  ) => {
    const res = await fetch(`/api/my-rescue-animals/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, userId, status, condition }),
    });
    if (res.ok) {
      toast.success("Амжилттай шинэчлэгдлээ");
      fetchRescue();
    }
  };

  const deleteRescueAnimal = async (postId: string) => {
    const res = await fetch(`/api/help-animal`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, postId }),
    });
    if (res.ok) {
      toast.success("Устгагдлаа!");
      fetchRescue();
    }
  };

  const deleteAdoptAnimal = async (adoptAnimalId: string) => {
    const res = await fetch(`/api/my-adopt-animal/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, adoptAnimalId }),
    });
    if (res.ok) {
      toast.success("Устгагдлаа!");
      fetchAdopt();
    }
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-50">
      <HeadBar />

      <div className="relative bg-linear-to-r from-orange-500 via-amber-400 to-yellow-300 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute top-4 right-16 text-white/15 text-8xl select-none rotate-12">
          🐾
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-10 flex items-end gap-6">
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-2xl ring-4 ring-amber-200 overflow-hidden bg-white">
              <Avatar className="w-full h-full">
                <AvatarImage
                  src={reUser?.profileImg}
                  alt="profile"
                  className="object-cover"
                />
                <AvatarFallback className="bg-orange-400 text-white text-3xl font-black w-full h-full flex items-center justify-center">
                  {reUser?.firstName?.[0]}
                  {reUser?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <Dialog>
              <DialogTrigger>
                <div className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white shadow-md border-2 border-amber-300 flex items-center justify-center hover:bg-amber-50 transition cursor-pointer">
                  <Camera className="w-4 h-4 text-amber-600" />
                </div>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-center font-black">
                    Нүүр зураг солих
                  </DialogTitle>
                  <DialogDescription />
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <label className="block border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center cursor-pointer hover:bg-amber-50 transition">
                    <div className="text-3xl mb-1">📷</div>
                    <div className="text-sm font-bold text-gray-600">
                      Зураг сонгох
                    </div>
                    <Input
                      type="file"
                      onChange={(e) => setImgFile(e.target.files?.[0] ?? null)}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                  {imgFile && (
                    <p className="text-xs text-center text-amber-600 font-semibold">
                      {imgFile.name}
                    </p>
                  )}
                  <button
                    onClick={handleSaveProfileImg}
                    disabled={uploading}
                    className="w-full py-3 rounded-2xl bg-linear-to-r from-orange-500 to-amber-400 text-white font-black shadow-md hover:from-orange-600 hover:to-amber-500 transition disabled:opacity-60"
                  >
                    {uploading ? "Илгээж байна..." : "Хадгалах"}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="pb-1">
            <h1 className="text-3xl font-black text-white drop-shadow">
              {reUser?.firstName} {reUser?.lastName}
            </h1>
            <p className="text-white/80 text-sm mt-0.5">{reUser?.email}</p>

            <div className="flex gap-3 mt-3">
              {helpAnimals.length > 0 && (
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1">
                  🆘 {helpAnimals.length} тусламж
                </div>
              )}
              {myAdoptAnimal.length > 0 && (
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1">
                  🐾 {myAdoptAnimal.length} үрчлүүлэх
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {helpAnimals.length > 0 && (
          <section>
            <SectionTitle
              emoji="🆘"
              title="Тусламж хэрэгтэй амьтад"
              count={helpAnimals.length}
              accent="bg-rose-400"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {helpAnimals.map((animal) => (
                <div
                  key={animal.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-transparent hover:border-rose-200"
                >
                  <div className="relative aspect-square">
                    <img
                      src={animal.images?.[0] || "/placeholder.png"}
                      alt="Animal"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-2 left-2">
                      <Pill {...STATUS_MAP[animal.status]} />
                    </div>

                    {animal.userId === userId && (
                      <EditStatusDialog
                        animal={animal}
                        onSave={editRescueAnimal}
                      />
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Pill {...CONDITION_MAP[animal.condition]} />
                      <DeleteDialog
                        onConfirm={() => deleteRescueAnimal(animal.id)}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{animal.location}</span>
                    </div>
                    <button
                      onClick={() => push(`/help-animal/location/${animal.id}`)}
                      className="w-full py-2 rounded-xl bg-linear-to-r from-rose-400 to-orange-400 text-white text-xs font-black hover:from-rose-500 hover:to-orange-500 transition active:scale-95 shadow-sm"
                    >
                      Харах →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {myAdoptAnimal.length > 0 && (
          <section>
            <SectionTitle
              emoji="🐾"
              title="Үрчлүүлэх амьтад"
              count={myAdoptAnimal.length}
              accent="bg-amber-400"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {myAdoptAnimal.map((animal) => {
                const statusInfo = ADOPT_STATUS_MAP[animal.status] ?? {
                  label: animal.status,
                  color: "text-gray-600",
                  bg: "bg-gray-100 border-gray-300",
                };
                return (
                  <div
                    key={animal.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-transparent hover:border-amber-200"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={animal.images?.[0] || "/placeholder.png"}
                        alt={animal.name}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute top-2 left-2">
                        <Pill {...statusInfo} />
                      </div>

                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow text-base">
                        {animal.animalType === "Dog" ? "🐕" : "🐱"}
                      </div>
                    </div>

                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-gray-800 text-sm truncate">
                          {animal.name}
                        </span>
                        <DeleteDialog
                          onConfirm={() => deleteAdoptAnimal(animal.id)}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                          {animal.gender === "MALE" ? "♂️ Эр" : "♀️ Эм"}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                          {animal.age}
                        </span>
                      </div>
                      {animal.status === "TEMPORARY" && animal.temporaryEnd && (
                        <div className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 font-semibold">
                          📅{" "}
                          {new Date(animal.temporaryEnd).toLocaleDateString(
                            "mn-MN",
                          )}{" "}
                          хүртэл
                        </div>
                      )}
                      {userId === myId ? (
                        <button
                          onClick={() =>
                            push(`/profile/${userId}/adoption/${animal.id}`)
                          }
                          className="w-full py-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-400 text-white text-xs font-black hover:from-amber-500 hover:to-orange-500 transition active:scale-95 shadow-sm"
                        >
                          Дэлгэрэнгүй →
                        </button>
                      ) : (
                        <button
                          onClick={() => push(`/adoption/adopt/${animal.id}`)}
                          className="w-full py-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-400 text-white text-xs font-black hover:from-amber-500 hover:to-orange-500 transition active:scale-95 shadow-sm"
                        >
                          Дэлгэрэнгүй →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {userId === myId ? (
          <FormReqSection
            formReq={formReq}
            reqFilter={reqFilter}
            setReqFilter={setReqFilter}
            onView={(id) => push(`/help-animal/form/${id}`)}
          />
        ) : (
          ""
        )}

        {helpAnimals.length === 0 && myAdoptAnimal.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🐾</div>
            <p className="text-gray-400 font-bold text-lg">
              Одоогоор мэдээлэл байхгүй байна
            </p>
            <p className="text-gray-300 text-sm mt-1">
              Амьтны мэдээлэл оруулснаар энд харагдана
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
