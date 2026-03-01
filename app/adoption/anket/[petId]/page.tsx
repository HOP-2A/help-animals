"use client";
import { toast } from "sonner";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/providers/useAuth";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  PawPrint,
  Heart,
  FileText,
  Home,
} from "lucide-react";

const locations: { value: string; label: string }[] = [
  { value: "ULAANBAATAR", label: "Улаанбаатар" },
  { value: "ARKHANGAI", label: "Архангай" },
  { value: "BAYANKHONGOR", label: "Баянхонгор" },
  { value: "BAYAN_OLGII", label: "Баян-Өлгий" },
  { value: "BULGAN", label: "Булган" },
  { value: "GOVI_ALTAI", label: "Говь-Алтай" },
  { value: "GOVI_SUMBER", label: "Говьсүмбэр" },
  { value: "DARKHAN", label: "Дархан" },
  { value: "DORNOD", label: "Дорнод" },
  { value: "DORNOGOVI", label: "Дорноговь" },
  { value: "DUNDGOVI", label: "Дундговь" },
  { value: "ZAVKHAN", label: "Завхан" },
  { value: "ORKHON", label: "Орхон" },
  { value: "UVURKHANGAI", label: "Өвөрхангай" },
  { value: "UMNUGOVI", label: "Өмнөговь" },
  { value: "SUKHBAATAR", label: "Сүхбаатар" },
  { value: "SELENGE", label: "Сэлэнгэ" },
  { value: "TUV", label: "Төв" },
  { value: "UVS", label: "Увс" },
  { value: "KHOVD", label: "Ховд" },
  { value: "KHUVSGUL", label: "Хөвсгөл" },
];

export default function AnketPage() {
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id ?? null;
  const { user } = useAuth(clerkId);
  const userId = user?.id;
  const params = useParams();
  const petId = params.petId;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    age: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    secondaryPhone: "",
    location: "",
    district: "",
    address: "",
    email: "",
    hasPet: false,
    petInfo: "",
    petId: "",
    userId: "",
    status: "PENDING",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    if (!form) {
      return;
    }

    const res = await fetch("/api/anket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, age: Number(form.age), petId, userId }),
    });
    if (res.ok) {
      toast.success("🐾 Анкет амжилттай илгээгдлээ!");
      setForm({
        age: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        secondaryPhone: "",
        location: "",
        district: "",
        address: "",
        email: "",
        hasPet: false,
        petInfo: "",
        petId: "",
        userId: "",
        status: "PENDING",
        notes: "",
      });
    } else {
      toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
      return;
    }
    setLoading(false);
  };

  const inputClass = `w-full px-4 py-3 rounded-2xl border-2 border-amber-100 bg-amber-50/40 
    text-gray-700 placeholder-gray-400 font-medium text-sm
    focus:outline-none focus:border-amber-300 focus:bg-white focus:ring-2 focus:ring-amber-100
    transition-all duration-200`;

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg,#fef9f0 0%,#fff7ed 40%,#eff6ff 100%)",
      }}
    >
      <div className="relative overflow-hidden bg-linear-to-r from-blue-700  to-blue-900 py-14 px-6 text-center">
        <div className="absolute top-4 left-8 opacity-20 rotate-[-15deg]">
          <PawPrint size={48} className="text-white" />
        </div>
        <div className="absolute bottom-4 right-10 opacity-20 rotate-20">
          <PawPrint size={64} className="text-white" />
        </div>
        <div className="absolute top-8 right-1/3 opacity-10 rotate-10">
          <PawPrint size={36} className="text-white" />
        </div>

        <div className="relative z-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl -mt-10 mb-3"
            style={{ background: "linear-gradient(135deg,#fbbf24,#f97316)" }}
          >
            <PawPrint size={30} className="text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl  font-extrabold text-white tracking-tight ">
            Үрчилж авах анкет
          </h1>
          <p className="mt-3 text-blue-200 text-lg max-w-md mx-auto">
            Таны анкет хянагдсаны дараа холбоо барина. Худал мэдээлэл өгөх нь
            үрчилж авах боломжийг хязгаарлана. Амьтдыг сайн эзэнд үрчүүлэх нь
            манай тэргүүлэх зорилт юм.
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

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
        <Section
          icon={<User size={18} />}
          title="Хувийн мэдээлэл"
          color="from-orange-400 to-amber-400"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field
              icon={<User size={15} className="text-orange-400" />}
              label="Нэр *"
            >
              <input
                className={inputClass}
                name="firstName"
                placeholder="Таны нэр"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </Field>
            <Field
              icon={<User size={15} className="text-orange-400" />}
              label="Овог *"
            >
              <input
                className={inputClass}
                name="lastName"
                value={form.lastName}
                placeholder="Таны овог"
                onChange={handleChange}
                required
              />
            </Field>
          </div>
          <Field
            icon={<Heart size={15} className="text-rose-400" />}
            label="Нас *"
          >
            <input
              className={inputClass}
              name="age"
              type="number"
              value={form.age}
              placeholder="Таны нас"
              onChange={handleChange}
              required
              min={18}
            />
          </Field>
        </Section>

        <Section
          icon={<Phone size={18} />}
          title="Холбоо барих мэдээлэл"
          color="from-blue-500 to-indigo-500"
        >
          <Field
            icon={<Phone size={15} className="text-blue-500" />}
            label="Утасны дугаар *"
          >
            <input
              className={inputClass}
              name="phoneNumber"
              placeholder="8888-8888"
              onChange={handleChange}
              value={form.phoneNumber}
              required
            />
          </Field>
          <Field
            icon={<Phone size={15} className="text-blue-300" />}
            label="Нэмэлт утасны дугаар"
          >
            <input
              className={inputClass}
              name="secondaryPhone"
              value={form.secondaryPhone}
              placeholder="Нэмэлт дугаар (заавал биш)"
              onChange={handleChange}
            />
          </Field>
          <Field
            icon={<Mail size={15} className="text-indigo-500" />}
            label="Цахим шуудан *"
          >
            <input
              className={inputClass}
              name="email"
              type="email"
              value={form.email}
              placeholder="example@email.com"
              onChange={handleChange}
              required
            />
          </Field>
        </Section>

        <Section
          icon={<MapPin size={18} />}
          title="Байршлын мэдээлэл"
          color="from-rose-400 to-pink-500"
        >
          <Field
            icon={<MapPin size={15} className="text-rose-500" />}
            label="Хот / Аймаг *"
          >
            <Select
              value={form.location}
              onValueChange={(v) => setForm({ ...form, location: v })}
            >
              <SelectTrigger className={`${inputClass} h-auto`}>
                <SelectValue placeholder="Хот / Аймаг сонгох..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl max-h-60 shadow-xl border-amber-100">
                {locations.map((loc) => (
                  <SelectItem
                    key={loc.value}
                    value={loc.value}
                    className="rounded-xl cursor-pointer hover:bg-amber-50 font-medium"
                  >
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field
              icon={<Home size={15} className="text-pink-500" />}
              label="Дүүрэг / Сум *"
            >
              <input
                className={inputClass}
                name="district"
                placeholder="Дүүрэг / Сум"
                value={form.district}
                onChange={handleChange}
                required
              />
            </Field>
            <Field
              icon={<MapPin size={15} className="text-pink-300" />}
              label="Дэлгэрэнгүй хаяг"
            >
              <input
                className={inputClass}
                name="address"
                value={form.address}
                placeholder="Гудамж, байр (заавал биш)"
                onChange={handleChange}
              />
            </Field>
          </div>
        </Section>

        <Section
          icon={<PawPrint size={18} />}
          title="Амьтантай холбоотой туршлага"
          color="from-amber-400 to-yellow-400"
        >
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                name="hasPet"
                checked={form.hasPet}
                onChange={handleChange}
                className="w-5 h-5 rounded-lg border-2 border-amber-300 checked:bg-amber-400 cursor-pointer accent-amber-400"
              />
            </div>
            <div>
              <p className="font-bold text-gray-700 text-sm group-hover:text-amber-600 transition-colors">
                Өмнө нь тэжээвэр амьтан тэжээж байсан
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                Тийм бол дэлгэрэнгүй мэдээлэл оруулна уу
              </p>
            </div>
          </label>

          {form.hasPet && (
            <Field
              icon={<PawPrint size={15} className="text-amber-500" />}
              label="Өмнөх туршлага"
            >
              <textarea
                className={`${inputClass} resize-none`}
                name="petInfo"
                value={form.petInfo}
                rows={3}
                placeholder="Ямар амьтан тэжээж байсан, хэр удаан, ямар нөхцөлд гэх мэт..."
                onChange={handleChange}
              />
            </Field>
          )}

          <Field
            icon={<FileText size={15} className="text-amber-600" />}
            label="Нэмэлт мэдээлэл"
          >
            <textarea
              className={`${inputClass} resize-none`}
              name="notes"
              value={form.notes}
              rows={4}
              placeholder="Өөрийнхөө тухай нэмэлт мэдээлэл, яагаад амьтан үрчилж авах болсон шалтгаан гэх мэт..."
              onChange={handleChange}
            />
          </Field>
        </Section>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl font-extrabold text-white transition-all
            shadow-[0_6px_0_#92400e] hover:shadow-[0_8px_0_#92400e] 
           active:shadow-[0_3px_0_#92400e] text-lg"
          disabled={loading}
          style={{ background: "linear-gradient(135deg,#fbbf24,#f97316)" }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Илгээж байна...
            </span>
          ) : !loading ? (
            "🐾 Анкет илгээх"
          ) : (
            ""
          )}
        </button>

        <p className="text-center text-gray-400 text-xs pb-6">
          Анкет илгээснээр та манай{" "}
          <span className="text-amber-500 font-semibold">
            үйлчилгээний нөхцөл
          </span>
          -тэй зөвшөөрч байгаа болно.
        </p>
      </form>
    </div>
  );
}

function Section({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white shadow-md border border-amber-100 overflow-hidden">
      <div
        className={`flex items-center gap-3 px-6 py-4 bg-gradient-to-r ${color}`}
      >
        <div className="w-8 h-8 rounded-xl bg-white/25 flex items-center justify-center text-white">
          {icon}
        </div>
        <h2 className="font-black text-white tracking-tight">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
