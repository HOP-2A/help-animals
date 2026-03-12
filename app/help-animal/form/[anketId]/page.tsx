"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/useAuth";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";

type Form = {
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
  userId: string;
  pet: {
    id: string;
    name: string;
    images: string[];
    animalType: string;
    userId: string;
  };
};

const STATUS_CONFIG: Record<
  string,
  { label: string; emoji: string; pill: string; bg: string }
> = {
  PENDING: {
    label: "Хүлээгдэж байна",
    emoji: "⏳",
    pill: "bg-amber-100 border-amber-300 text-amber-700",
    bg: "from-amber-400 to-yellow-300",
  },
  APPROVED: {
    label: "Зөвшөөрсөн",
    emoji: "✅",
    pill: "bg-green-100 border-green-300 text-green-700",
    bg: "from-green-400 to-emerald-300",
  },
  REJECTED: {
    label: "Татгалзсан",
    emoji: "❌",
    pill: "bg-red-100 border-red-300 text-red-600",
    bg: "from-red-400 to-rose-300",
  },
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-base shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-bold text-gray-800 mt-0.5 wrap-break-word">
        {value || "—"}
      </p>
    </div>
  </div>
);

const Section = ({
  emoji,
  title,
  accent,
  children,
}: {
  emoji: string;
  title: string;
  accent: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 overflow-hidden">
    <div className={`h-1.5 w-full bg-linear-to-r ${accent}`} />
    <div className="p-5">
      <h3 className="font-black text-gray-800 text-base mb-3 flex items-center gap-2">
        <span className="text-lg">{emoji}</span> {title}
      </h3>
      {children}
    </div>
  </div>
);

const Page = () => {
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id ?? null;
  const { user } = useAuth(clerkId);
  const userId = user?.id;
  const params = useParams();
  const anketId = params.anketId;
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form, setForm] = useState<Form>();
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const { push } = useRouter();
  const fetchForm = async () => {
    const res = await fetch(`/api/fetch-Anket/${anketId}`);
    if (res.ok) setForm(await res.json());
  };

  useEffect(() => {
    fetchForm();
  }, [anketId]);

  const approveAnket = async (animalId: string) => {
    if (!status) return;
    setSaving(true);
    const res = await fetch(`/api/myBreedingAnimal/${form?.pet.id}`, {
      method: "PUT",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ userId, animalId, status, formId: anketId }),
    });
    if (res.ok) {
      toast.success(
        status === "APPROVED"
          ? "🎉 Хүсэлтийг зөвшөөрлөө!"
          : status === "REJECTED"
            ? "Хүсэлтийг татгалзлаа."
            : "Амжилттай хадгалагдлаа.",
      );
      fetchForm();
    } else {
      toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
    }
    setSaving(false);
  };

  const deleteAnket = async (anketId: string) => {
    const res = await fetch(`/api/fetchForm/${userId}`, {
      method: "DELETE",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        anketId,
        userId,
      }),
    });

    if (res.ok) {
      toast.success("Амжилттай устгагдлаа!");
      push(`/profile/${userId}`);
    }
  };

  if (!form)
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-bounce">🐾</div>
          <p className="text-gray-400 font-bold">Ачааллаж байна...</p>
        </div>
      </div>
    );

  const handleContact = async (postOwnerId: string) => {
    if (!userId) {
      router.push("/sign-up");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postOwnerId, userId }),
      });

      const data = await res.json();
      router.push(`/chat/${data.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = STATUS_CONFIG[form.status] ?? STATUS_CONFIG["PENDING"];

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="relative bg-linear-to-r from-orange-500 via-amber-400 to-yellow-300 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute top-4 right-12 text-white/15 text-8xl select-none rotate-12">
          📋
        </div>

        <div className="relative max-w-2xl mx-auto px-5 py-10 text-center">
          {form.pet.images?.[0] && (
            <div className="mx-auto mb-4 w-24 h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden ring-4 ring-amber-200">
              <img
                src={form.pet.images[0]}
                alt={form.pet.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full mb-2">
            {form.pet.animalType === "Dog" ? "🐕" : "🐱"} {form.pet.name}-г
            үрчлэх хүсэлт
          </div>
          <h1 className="text-3xl font-black text-white drop-shadow">
            {form.firstName} {form.lastName}
            <span className="text-yellow-900">-ийн анкет</span>
          </h1>
          <p className="text-white/80 text-sm mt-1">
            {form.age} нас · {form.location}, {form.district}
          </p>

          <div className="mt-4 inline-flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 font-black text-sm ${currentStatus.pill}`}
            >
              {currentStatus.emoji} Одоогийн статус: {currentStatus.label}
            </span>
          </div>
        </div>
      </div>
      {userId === form.userId ? (
        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger>
              <div className="flex items-center justify-center bg-red-400 p-2 rounded-2xl  mr-10 mt-10 text-white font-bold cursor-pointer ring-3 ring-orange-500 hover:bg-red-500">
                Анкетыг устгах
              </div>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-center text-lg font-black">
                  Устгахдаа итгэлтэй байна уу?
                </DialogTitle>
                <DialogDescription className="text-center text-gray-500 text-sm mt-1">
                  Устгасан анкетыг дахин сэргээх боломжгүй.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 mt-2">
                <DialogClose className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-bold transition">
                  Цуцлах
                </DialogClose>
                <button
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-black transition"
                  onClick={() => deleteAnket(form.id)}
                >
                  Устгах
                </button>
              </div>
            </DialogContent>
          </Dialog>
          <div></div>
        </div>
      ) : (
        ""
      )}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <Section
          emoji="👤"
          title="Хүсэлт гаргагчийн мэдээлэл"
          accent="from-orange-400 to-amber-400"
        >
          <InfoRow
            icon="👤"
            label="Овог нэр"
            value={`${form.lastName} ${form.firstName}`}
          />
          <InfoRow icon="🎂" label="Нас" value={`${form.age} нас`} />
          <InfoRow icon="📞" label="Утасны дугаар" value={form.phoneNumber} />
          {form.secondaryPhone && (
            <InfoRow
              icon="📱"
              label="Нэмэлт утасны дугаар"
              value={form.secondaryPhone}
            />
          )}
          <InfoRow icon="✉️" label="Цахим шуудан" value={form.email} />
        </Section>

        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-0">
            <div className="w-0.5 h-4 border-l-4 border-dashed border-orange-300" />
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-amber-300 flex items-center justify-center text-sm shadow border-2 border-white">
              📍
            </div>
            <div className="w-0.5 h-4 border-l-4 border-dashed border-orange-300" />
          </div>
        </div>

        <Section
          emoji="🏠"
          title="Хаяг, байршил"
          accent="from-amber-400 to-yellow-400"
        >
          <InfoRow icon="🌏" label="Хот / Аймаг" value={form.location} />
          <InfoRow icon="📍" label="Дүүрэг / Сум" value={form.district} />
          <InfoRow icon="🏘️" label="Дэлгэрэнгүй хаяг" value={form.address} />
        </Section>

        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-0">
            <div className="w-0.5 h-4 border-l-4 border-dashed border-amber-300" />
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-400 to-yellow-300 flex items-center justify-center text-sm shadow border-2 border-white">
              🐾
            </div>
            <div className="w-0.5 h-4 border-l-4 border-dashed border-amber-300" />
          </div>
        </div>

        <Section
          emoji="🐾"
          title="Гэрийн тэжээвэр амьтны мэдээлэл"
          accent="from-sky-400 to-blue-300"
        >
          {form.hasPet ? (
            <div className="space-y-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-300 text-green-700 text-xs font-bold">
                  ✅ Гэрийн тэжээвэр амьтантай
                </span>
              </div>
              <InfoRow
                icon="📝"
                label="Тэжээвэр амьтны мэдээлэл"
                value={form.petInfo}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-xl">
                🚫
              </div>
              <div>
                <p className="font-bold text-gray-600 text-sm">
                  Тэжээвэр амьтангүй
                </p>
                <p className="text-xs text-gray-400">
                  Одоогоор гэрийн амьтан байхгүй байна
                </p>
              </div>
            </div>
          )}
        </Section>

        {form.notes && (
          <div>
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-0">
                <div className="w-0.5 h-4 border-l-4 border-dashed border-sky-300" />
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-sky-400 to-blue-300 flex items-center justify-center text-sm shadow border-2 border-white">
                  💬
                </div>
                <div className="w-0.5 h-4 border-l-4 border-dashed border-sky-300" />
              </div>
            </div>
            <Section
              emoji="💬"
              title="Нэмэлт мэдээлэл"
              accent="from-violet-400 to-purple-300"
            >
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {form.notes}
                </p>
              </div>
            </Section>
          </div>
        )}

        {userId !== form.userId ? (
          <div>
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-4 border-l-4 border-dashed border-orange-300" />
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-500 to-amber-400 flex items-center justify-center text-xl shadow-lg border-2 border-white">
                  ⚖️
                </div>
                <div className="w-0.5 h-4 border-l-4 border-dashed border-orange-300" />
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border-2 border-orange-200 overflow-hidden">
              <div className="h-1.5 w-full bg-linear-to-br from-orange-500 to-amber-400" />
              <div className="p-6">
                <h3 className="font-black text-gray-800 text-base mb-1 flex items-center gap-2">
                  ⚖️ Хүсэлтэд хариу өгөх
                </h3>
                <p className="text-xs text-gray-400 mb-5">
                  Хүсэлтийг хянасны дараа шийдвэрээ сонгоно уу. Хариу илгээснээр
                  хүсэлт гаргагчид мэдэгдэл очно.
                </p>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    {
                      val: "APPROVED",
                      emoji: "✅",
                      label: "Зөвшөөрөх",
                      sub: "Үрчлэлтийг баталгаажуулах",
                      color: "border-green-400 bg-green-50",
                      active: "ring-2 ring-green-400 scale-105 shadow-md",
                    },
                    {
                      val: "PENDING",
                      emoji: "⏳",
                      label: "Хүлээлгэх",
                      sub: "Дараа хариу өгөх",
                      color: "border-amber-400 bg-amber-50",
                      active: "ring-2 ring-amber-400 scale-105 shadow-md",
                    },
                    {
                      val: "REJECTED",
                      emoji: "❌",
                      label: "Татгалзах",
                      sub: "Татгалзах хариу илгээх",
                      color: "border-red-300 bg-red-50",
                      active: "ring-2 ring-red-400 scale-105 shadow-md",
                    },
                  ].map(({ val, emoji, label, sub, color, active }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setStatus(val)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all duration-150 text-center
                    ${color} ${status === val ? active : "hover:opacity-80"}`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="font-black text-gray-800 text-xs">
                        {label}
                      </span>
                      <span className="text-[10px] text-gray-400 leading-tight">
                        {sub}
                      </span>
                    </button>
                  ))}
                </div>

                {status && (
                  <div
                    className={`mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold
                ${STATUS_CONFIG[status]?.pill ?? ""}`}
                  >
                    {STATUS_CONFIG[status]?.emoji}{" "}
                    {STATUS_CONFIG[status]?.label} гэж сонгосон байна
                  </div>
                )}

                <button
                  onClick={() => approveAnket(form.pet.id)}
                  disabled={!status || saving}
                  className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-md transition-all
                ${
                  status && !saving
                    ? "bg-linear-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 active:scale-95 ring-4 ring-orange-200"
                    : "bg-gray-400 text-gray-400 cursor-not-allowed"
                }`}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Илгээж байна...
                    </span>
                  ) : !status ? (
                    "Шийдвэр сонгоно уу"
                  ) : status === "APPROVED" ? (
                    "✅ Зөвшөөрөх хариу илгээх"
                  ) : status === "REJECTED" ? (
                    "❌ Татгалзах хариу илгээх"
                  ) : (
                    "⏳ Хариу илгээх"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-0">
                <div className="w-0.5 h-4 border-l-4 border-dashed border-amber-300" />
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-500 to-amber-300 flex items-center justify-center text-sm shadow border-2 border-white">
                  📞
                </div>
                <div className="w-0.5 h-4 border-l-4 border-dashed border-amber-300" />
              </div>
            </div>
            <div className="flex justify-center">
              <button
                // onClick={() => push(`/profile/${form.pet.userId}`)}
                onClick={() => handleContact(form.pet.userId)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-white text-sm
   bg-linear-to-r from-sky-400 to-blue-500
    hover:from-sky-500 hover:to-blue-600
    active:scale-95 transition-all duration-150
    shadow-lg ring-4 ring-sky-100"
              >
                📞 Эзэнтэй холбогдох
              </button>
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
};

export default Page;
