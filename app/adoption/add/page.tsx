"use client";

import HeadBar from "../../_components/headbar";
import { useState, ChangeEvent } from "react";

import { Input } from "@/components/ui/input";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/useAuth";

type ImageItem = { file: File; url: string };

type InputValues = {
  name: string;
  age: string;
  breed: string;
  sterilized: string;
  description: string;
  CatFriendly: string;
  DogFriendly: string;
  KidFriendly: string;
  AggressionLevel: string;
  AggressionNote: string;
  personality: string;
  healthInfo: string;
  status: string;
  temporaryEnd: string;
  animalType: string;
  gender: string;
};
type InputKeys = keyof InputValues;
const Section = ({
  step,
  emoji,
  title,
  subtitle,
  color,
  children,
}: {
  step: number;
  emoji: string;
  title: string;
  subtitle?: string;
  color: string;
  children: React.ReactNode;
}) => (
  <div className={`relative bg-white rounded-3xl shadow-md overflow-hidden`}>
    <div className={`h-2 w-full ${color}`} />
    <div className="p-6">
      <div className="flex items-start gap-4 mb-5">
        <div
          className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0`}
        >
          {step}
        </div>
        <div>
          <h2 className="font-black text-gray-800 text-lg leading-tight">
            {emoji} {title}
          </h2>
          {subtitle && (
            <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-gray-600 flex items-center gap-1">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    {children}
  </div>
);

const Textarea = ({
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
}) => (
  <textarea
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="w-full text-sm border-2 border-gray-100 focus:border-amber-400 focus:outline-none transition-colors rounded-xl p-3 resize-none bg-gray-50 focus:bg-white placeholder:text-gray-300"
  />
);

const ToggleGroup = ({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; emoji: string; color: string }[];
}) => (
  <div className="flex gap-2 flex-wrap">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all
          ${value === opt.value ? `${opt.color} shadow-sm scale-105` : "border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300"}`}
      >
        <span>{opt.emoji}</span> {opt.label}
      </button>
    ))}
  </div>
);

const Page = () => {
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id ?? null;
  const { user } = useAuth(clerkId);
  const userId = user?.id;

  const [inputValues, setInputValues] = useState<InputValues>({
    name: "",
    age: "",
    breed: "",
    sterilized: "",
    description: "",
    CatFriendly: "",
    DogFriendly: "",
    KidFriendly: "",
    AggressionLevel: "",
    AggressionNote: "",
    personality: "",
    healthInfo: "",
    status: "",
    temporaryEnd: "",
    animalType: "",
    gender: "",
  });

  const handleInputs = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInputValues((p) => ({ ...p, [name]: value }));
  };

  const setField = (key: InputKeys, val: string) =>
    setInputValues((p) => ({ ...p, [key]: val }));

  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);

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
    toast.success("Зургууд амжилттай илгээгдлээ!");
    setUploading(false);
  };

  const createAdopt = async () => {
    const res = await fetch("/api/adopt-animal", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        userId,
        ...inputValues,
        images: images.map((img) => img.url),
        temporaryEnd: inputValues.temporaryEnd
          ? new Date(inputValues.temporaryEnd).toISOString()
          : null,
      }),
    });
    if (res.ok) {
      toast.success("Амжилттай нэмэгдлээ!");
      setInputValues({
        name: "",
        age: "",
        breed: "",
        sterilized: "",
        description: "",
        CatFriendly: "",
        DogFriendly: "",
        KidFriendly: "",
        AggressionLevel: "",
        AggressionNote: "",
        personality: "",
        healthInfo: "",
        status: "",
        temporaryEnd: "",
        animalType: "",
        gender: "",
      });
      setImages([]);
    } else {
      const err = await res.json();
      toast.error(err.error);
    }
  };

  const isComplete =
    inputValues.name &&
    inputValues.age &&
    inputValues.breed &&
    inputValues.sterilized &&
    inputValues.description &&
    inputValues.CatFriendly &&
    inputValues.DogFriendly &&
    inputValues.KidFriendly &&
    inputValues.AggressionLevel &&
    inputValues.AggressionNote &&
    inputValues.personality &&
    inputValues.healthInfo &&
    inputValues.status &&
    inputValues.gender &&
    inputValues.animalType &&
    images;

  const friendlyOpts = [
    {
      value: "Yes",
      label: "Сайн нийцдэг",
      emoji: "✅",
      color: "border-green-400 bg-green-50 text-green-700",
    },
    {
      value: "No",
      label: "Нийцдэггүй",
      emoji: "❌",
      color: "border-red-300 bg-red-50 text-red-600",
    },
    {
      value: "Unknown",
      label: "Тодорхойгүй",
      emoji: "❓",
      color: "border-gray-300 bg-gray-100 text-gray-500",
    },
  ];

  const aggressionOpts = [
    {
      value: "Low",
      label: "Бага",
      emoji: "😊",
      color: "border-green-400 bg-green-50 text-green-700",
    },
    {
      value: "Medium",
      label: "Дунд",
      emoji: "😐",
      color: "border-yellow-400 bg-yellow-50 text-yellow-700",
    },
    {
      value: "High",
      label: "Өндөр",
      emoji: "⚠️",
      color: "border-red-400 bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-50">
      <HeadBar />

      <div className="relative bg-linear-to-r from-orange-500 via-amber-400 to-yellow-300 py-10 px-4 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute top-3 right-12 text-white/20 text-8xl select-none rotate-12">
          🐾
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-bold px-4 py-1.5 rounded-full mb-3">
            🐾 Үрчлүүлэх бүртгэл
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md">
            Амьтандаа{" "}
            <span className="bg-white/25 px-2 rounded-xl text-yellow-900">
              сайн эзэн
            </span>{" "}
            олоорой
          </h1>
          <p className="mt-2 text-white/90 text-sm font-medium max-w-sm mx-auto">
            Амьтныхаа мэдээллийг бүрэн бөглөж, тохирох гэр бүл олоход туслаарай
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {[
            "bg-orange-400",
            "bg-amber-400",
            "bg-yellow-400",
            "bg-lime-400",
            "bg-sky-400",
            "bg-rose-400",
          ].map((c, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${c} opacity-70`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16 space-y-5">
        <Section
          step={1}
          emoji="⏳"
          title="Үрчлүүлэх хугацаа"
          subtitle="Түр зуур эсвэл бүрмөсөн?"
          color="bg-orange-400"
        >
          <div className="space-y-4">
            <Field label="Үрчлүүлэх төрөл" required>
              <div className="flex gap-3">
                {[
                  {
                    val: "TEMPORARY",
                    emoji: "⏳",
                    label: "Түр зуур",
                    sub: "Буцааж авах хугацаатай",
                    color: "border-amber-400 bg-amber-50 text-amber-800",
                  },
                  {
                    val: "PERMANENT",
                    emoji: "🏠",
                    label: "Бүрмөсөн",
                    sub: "Байнгын гэр олох",
                    color: "border-green-400 bg-green-50 text-green-800",
                  },
                ].map(({ val, emoji, label, sub, color }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setField("status", val)}
                    className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all
                      ${inputValues.status === val ? `${color} shadow-md scale-[1.02]` : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
                  >
                    <div className="text-2xl mb-1">{emoji}</div>
                    <div className="font-black text-sm">{label}</div>
                    <div className="text-xs opacity-60 mt-0.5">{sub}</div>
                  </button>
                ))}
              </div>
            </Field>

            {inputValues.status === "TEMPORARY" && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  ⏳ Буцааж авах өдрийг сонгоно уу
                </div>
                <Input
                  type="date"
                  name="temporaryEnd"
                  value={inputValues.temporaryEnd}
                  onChange={handleInputs}
                  min={new Date().toISOString().split("T")[0]}
                  className="h-11 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-white"
                />
              </div>
            )}

            <Field label="Яагаад үрчлүүлэх болсон тайлбар" required>
              <Textarea
                name="description"
                value={inputValues.description}
                onChange={handleInputs}
                placeholder="Жишээ: Гадаадад амьдрахаар болсон тул сайн эзэн олж өгмөөр байна..."
                rows={3}
              />
            </Field>
          </div>
        </Section>

        <Section
          step={2}
          emoji="🐾"
          title="Үндсэн мэдээлэл"
          subtitle="Амьтны нэр, нас, үүлдэр"
          color="bg-amber-400"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Нэр" required>
                <Input
                  name="name"
                  value={inputValues.name}
                  onChange={handleInputs}
                  placeholder="Амьтны нэр..."
                  className="h-11 border-2 border-gray-100 focus:border-amber-400 rounded-xl bg-gray-50 focus:bg-white"
                />
              </Field>
              <Field label="Нас" required>
                <Input
                  name="age"
                  value={inputValues.age}
                  onChange={handleInputs}
                  placeholder="2 жил, 6 сар..."
                  className="h-11 border-2 border-gray-100 focus:border-amber-400 rounded-xl bg-gray-50 focus:bg-white"
                />
              </Field>
            </div>

            <Field label="Үүлдэр" required>
              <Input
                name="breed"
                value={inputValues.breed}
                onChange={handleInputs}
                placeholder="Жишээ: Лабрадор, Персиан муур, Холимог..."
                className="h-11 border-2 border-gray-100 focus:border-amber-400 rounded-xl bg-gray-50 focus:bg-white"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Амьтны төрөл" required>
                <div className="flex gap-2">
                  {[
                    { val: "Dog", emoji: "🐕", label: "Нохой" },
                    { val: "Cat", emoji: "🐱", label: "Муур" },
                  ].map(({ val, emoji, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setField("animalType", val)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold flex flex-col items-center gap-0.5 transition-all
                        ${inputValues.animalType === val ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm" : "border-gray-200 bg-gray-50 text-gray-400"}`}
                    >
                      <span className="text-xl">{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Хүйс" required>
                <div className="flex gap-2">
                  {[
                    { val: "MALE", emoji: "♂️", label: "Эр" },
                    { val: "FEMALE", emoji: "♀️", label: "Эм" },
                  ].map(({ val, emoji, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setField("gender", val)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold flex flex-col items-center gap-0.5 transition-all
                        ${
                          inputValues.gender === val
                            ? val === "MALE"
                              ? "border-sky-400 bg-sky-50 text-sky-700 shadow-sm"
                              : "border-rose-400 bg-rose-50 text-rose-700 shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-400"
                        }`}
                    >
                      <span className="text-xl">{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>
        </Section>

        <Section
          step={3}
          emoji="❤️"
          title="Эрүүл мэнд & зан ааш"
          subtitle="Вакцин, эмчилгээ, зан чанар"
          color="bg-rose-400"
        >
          <div className="space-y-4">
            <Field label="Эрүүл мэндийн мэдээлэл" required>
              <Textarea
                name="healthInfo"
                value={inputValues.healthInfo}
                onChange={handleInputs}
                placeholder="Вакцинжуулалт, хийлгэсэн эмчилгээ, анхаарах зүйлс..."
                rows={3}
              />
            </Field>

            <Field label="Заслага хийлгэсэн эсэх" required>
              <ToggleGroup
                name="sterilized"
                value={inputValues.sterilized}
                onChange={(v) => setField("sterilized", v)}
                options={[
                  {
                    value: "Yes",
                    label: "Тийм",
                    emoji: "✅",
                    color: "border-green-400 bg-green-50 text-green-700",
                  },
                  {
                    value: "No",
                    label: "Үгүй",
                    emoji: "❌",
                    color: "border-red-300 bg-red-50 text-red-600",
                  },
                  {
                    value: "Unknown",
                    label: "Тодорхойгүй",
                    emoji: "❓",
                    color: "border-gray-300 bg-gray-100 text-gray-500",
                  },
                ]}
              />
            </Field>

            <Field label="Зан ааш">
              <Textarea
                name="personality"
                value={inputValues.personality}
                onChange={handleInputs}
                placeholder="Амьтны зан ааш, дадал зуршлыг бичнэ үү..."
                rows={2}
              />
            </Field>

            <Field label="Зан аашны онцгой анхаарах зүйлс" required>
              <Textarea
                name="AggressionNote"
                value={inputValues.AggressionNote}
                onChange={handleInputs}
                placeholder="Тодорхой орчин, дуу чимээ, хөдөлгөөнд хэрхэн хариу үзүүлдгийг дурдана уу..."
                rows={2}
              />
            </Field>
          </div>
        </Section>

        <Section
          step={4}
          emoji="🤝"
          title="Нийцэмжтэй байдал"
          subtitle="Бусад амьтан болон хүүхэдтэй"
          color="bg-sky-400"
        >
          <div className="space-y-5">
            {[
              {
                key: "DogFriendly" as InputKeys,
                label: "🐕 Нохойтой нийцэмж",
                opts: friendlyOpts,
              },
              {
                key: "CatFriendly" as InputKeys,
                label: "🐱 Мууртай нийцэмж",
                opts: friendlyOpts,
              },
              {
                key: "KidFriendly" as InputKeys,
                label: "👶 Хүүхэдтэй нийцэмж",
                opts: friendlyOpts,
              },
              {
                key: "AggressionLevel" as InputKeys,
                label: "⚡ Дайсагналын түвшин",
                opts: aggressionOpts,
              },
            ].map(({ key, label, opts }) => (
              <Field key={key} label={label} required>
                <ToggleGroup
                  name={key}
                  value={inputValues[key]}
                  onChange={(v) => setField(key, v)}
                  options={opts}
                />
              </Field>
            ))}
          </div>
        </Section>

        <Section
          step={5}
          emoji="📸"
          title="Зургууд"
          subtitle="Олон зураг байх тусам илүү сайн!"
          color="bg-violet-400"
        >
          <div className="space-y-4">
            <label
              htmlFor="image-upload"
              className="block border-2 border-dashed border-violet-300 rounded-2xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all bg-gray-50 group"
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                📷
              </div>
              <div className="font-bold text-gray-600 text-sm">
                Зураг нэмэхийн тулд энд дарна уу
              </div>
              <div className="text-xs text-gray-400 mt-1">
                JPG, PNG • Олон зураг нэгэн зэрэг сонгох боломжтой
              </div>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFile}
                className="hidden"
                id="image-upload"
              />
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-xl overflow-hidden shadow-sm"
                  >
                    <img
                      src={img.url || URL.createObjectURL(img.file)}
                      alt={`Зураг ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {img.url && (
                      <div className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        ✓ Илгээгдсэн
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <label
                  htmlFor="image-upload"
                  className="aspect-square rounded-xl border-2 border-dashed border-violet-200 flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all bg-gray-50"
                >
                  <span className="text-2xl text-violet-300">+</span>
                  <span className="text-[10px] text-violet-300 font-bold">
                    Нэмэх
                  </span>
                </label>
              </div>
            )}

            {images.some((img) => !img.url) && (
              <button
                type="button"
                name="images"
                onClick={uploadImages}
                disabled={uploading}
                className="w-full py-3 rounded-2xl font-black text-white text-sm
               bg-linear-to-r from-violet-500 to-purple-400
                  hover:from-violet-600 hover:to-purple-500
                  disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Илгээж байна...
                  </>
                ) : (
                  <>
                    📤 Зургуудыг илгээх ({images.filter((i) => !i.url).length}{" "}
                    зураг)
                  </>
                )}
              </button>
            )}
          </div>
        </Section>

        <div className="pt-2 pb-4">
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 mb-4">
            <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">
              Бөглөлтийн хяналт
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: "name", label: "Нэр" },
                { key: "age", label: "Нас" },
                { key: "breed", label: "Үүлдэр" },
                { key: "animalType", label: "Төрөл" },
                { key: "gender", label: "Хүйс" },
                { key: "status", label: "Статус" },
                { key: "description", label: "Тайлбар" },
                { key: "healthInfo", label: "Эрүүл мэнд" },
                { key: "sterilized", label: "Заслага" },
                { key: "personality", label: "Зан ааш" },
                { key: "DogFriendly", label: "Нохойтой" },
                { key: "CatFriendly", label: "Мууртай" },
                { key: "KidFriendly", label: "Хүүхэдтэй" },
                { key: "AggressionLevel", label: "Дайсагналт" },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg
                  ${inputValues[key as InputKeys] ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"}`}
                >
                  <span>{inputValues[key as InputKeys] ? "✓" : "○"}</span>
                  <span className="font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={createAdopt}
            disabled={!isComplete}
            className={`w-full py-4 rounded-2xl font-black  text-lg shadow-xl transition-all
              ${
                isComplete
                  ? "bg-linear-to-r from-orange-500 text-white to-amber-400 hover:from-orange-600 hover:to-amber-500 active:scale-95 ring-4 ring-orange-200"
                  : "bg-gray-200 text-gray-700 cursor-not-allowed"
              }`}
          >
            {isComplete
              ? "🐾 Амьтанаа бүртгүүлэх"
              : "⬆️ Бүх талбарыг бөглөнө үү"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
