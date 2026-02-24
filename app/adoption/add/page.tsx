"use client";

import { Button } from "@/components/ui/button";
import HeadBar from "../../_components/headbar";
import { useState, useEffect, ChangeEvent } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/useAuth";
type ImageItem = {
  file: File;
  url: string;
};

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
    setInputValues({ ...inputValues, [name]: value });
  };
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file) => ({ file, url: "" }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const uploadImages = async () => {
    setUploading(true);

    const updatedImages = await Promise.all(
      images.map(async (img) => {
        if (img.url) return img;
        const uploaded = await upload(img.file.name, img.file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        return { ...img, url: uploaded.url };
      }),
    );

    setImages(updatedImages);
    toast.success("Амжилттай upload хийгдлээ!");
    setUploading(false);
  };

  const createAdopt = async () => {
    const res = await fetch("/api/adopt-animal", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        userId,
        description: inputValues.description,
        name: inputValues.name,
        breed: inputValues.breed,
        age: inputValues.age,
        sterilized: inputValues.sterilized,
        CatFriendly: inputValues.CatFriendly,
        DogFriendly: inputValues.DogFriendly,
        KidFriendly: inputValues.KidFriendly,
        AggressionLevel: inputValues.AggressionLevel,
        AggressionNote: inputValues.AggressionNote,
        personality: inputValues.personality,
        healthInfo: inputValues.healthInfo,
        images: images.map((img) => img.url),
        status: inputValues.status,
        animalType: inputValues.animalType,
        gender: inputValues.gender,
        temporaryEnd: inputValues.temporaryEnd
          ? new Date(inputValues.temporaryEnd).toISOString()
          : null,
      }),
    });

    if (res.ok) {
      toast.success("amjilttai nemegdlee");
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
    } else if (!res.ok) {
      const err = await res.json();
      toast.error(err.error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <HeadBar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🐾 Үрчлүүлэх амьтан
          </h1>{" "}
          <p className="text-gray-700">
            {" "}
            Амьтныхаа мэдээллийг бүрэн бөглөж, сайн гэр бүл олоход туслаарай
          </p>
        </div>
        <form className="space-y-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                ⏰ Үрчлүүлэх хугацаа
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 -mt-7">
                <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                  Үрчлүүлэх төрөл <span className="text-red-500">*</span>
                </label>
                <p className="text-gray-600 text-sm">
                  Амьтнаа түр зуур уу эсвэл бүрмөсөн үрчлүүлэх үү?
                </p>

                <Select
                  value={inputValues.status}
                  onValueChange={(value: string) =>
                    setInputValues({
                      ...inputValues,
                      status: value,
                      temporaryEnd:
                        value === "PERMANENT" ? "" : inputValues.temporaryEnd,
                    })
                  }
                >
                  <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 transition-colors">
                    <SelectValue placeholder="Сонгоно уу..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEMPORARY">
                      <div className="flex items-center gap-5">
                        <div className="text-2xl">⏳</div>
                        <div>
                          <div className="font-medium">Түр зуур үрчлүүлэх</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="PERMANENT">
                      <div className="flex items-center gap-3 py-2">
                        <div className="text-2xl">🏠</div>
                        <div>
                          <div className="font-medium">Бүрмөсөн үрчлүүлэх</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {inputValues.status === "TEMPORARY" && (
                <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-800">
                    <span className="font-semibold">Түр зуурын үрчлэлт </span>
                  </div>

                  <p className="text-amber-700 text-sm">
                    Амьтнаа хэзээ буцааж авах өдрөө сонгоно уу
                  </p>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                      📅 Буцааж авах өдөр{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      name="temporaryEnd"
                      value={inputValues.temporaryEnd}
                      onChange={handleInputs}
                      min={new Date().toISOString().split("T")[0]}
                      className="h-12 text-base border-2 border-amber-300 focus:border-amber-500 transition-colors bg-white"
                    />
                  </div>
                </div>
              )}
              {inputValues.status === "PERMANENT" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <Badge className="bg-green-400 text-sm">
                    Бүрмөсөн үрчлэлт
                  </Badge>
                </div>
              )}
              <div className="space-y-2">
                {" "}
                <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                  {" "}
                  📋 Яагаад үрчлүүлэх болсон тайлбар{" "}
                  <span className="text-red-500">*</span>{" "}
                </label>{" "}
                <textarea
                  name="description"
                  value={inputValues.description}
                  onChange={handleInputs}
                  placeholder="Жишээ: Гадаадад амьдрахаар болсон..."
                  className="w-full h-24 text-base border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-md p-3 resize-none"
                />{" "}
              </div>{" "}
            </CardContent>
          </Card>{" "}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            {" "}
            <CardHeader className="pb-4">
              {" "}
              <CardTitle className="flex items-center gap-2 text-xl">
                {" "}
                Үндсэн мэдээлэл{" "}
              </CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent className="space-y-6 -mt-7">
              {" "}
              <div className="grid md:grid-cols-2 gap-6">
                {" "}
                <div className="space-y-2">
                  {" "}
                  <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                    {" "}
                    Нэр <span className="text-red-500">*</span>{" "}
                  </label>{" "}
                  <Input
                    name="name"
                    value={inputValues.name}
                    onChange={handleInputs}
                    placeholder="Амьтны нэрийг бичнэ үү..."
                    className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 transition-colors"
                  />{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                    {" "}
                    Нас <span className="text-red-500">*</span>{" "}
                  </label>{" "}
                  <Input
                    name="age"
                    value={inputValues.age}
                    onChange={handleInputs}
                    placeholder="Жишээ: 2 жил, 6 сар, 3 жил 4 сар..."
                    className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 transition-colors"
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                  {" "}
                  Үүлдэр <span className="text-red-500">*</span>{" "}
                </label>{" "}
                <Input
                  name="breed"
                  value={inputValues.breed}
                  onChange={handleInputs}
                  placeholder="Жишээ: Герман Овчаарка, Персиан муур, Эрлиз муур, Холимог..."
                  className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />{" "}
              </div>{" "}
              <div className="flex gap-10">
                <div className="space-y-2">
                  {" "}
                  <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                    {" "}
                    Амьтны төрлийг сонгоно уу
                    <span className="text-red-500">*</span>{" "}
                  </label>{" "}
                  <Select
                    value={inputValues.animalType}
                    onValueChange={(value: string) =>
                      setInputValues({
                        ...inputValues,
                        animalType: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Сонгох..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cat">Муур</SelectItem>
                      <SelectItem value="Dog">Нохой</SelectItem>
                    </SelectContent>
                  </Select>
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                    {" "}
                    Хүйс <span className="text-red-500">*</span>{" "}
                  </label>{" "}
                  <Select
                    value={inputValues.gender}
                    onValueChange={(value: string) =>
                      setInputValues({
                        ...inputValues,
                        gender: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Хүйс..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FEMALE">Эм</SelectItem>
                      <SelectItem value="MALE">Эр</SelectItem>
                    </SelectContent>
                  </Select>
                </div>{" "}
              </div>
            </CardContent>{" "}
          </Card>{" "}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            {" "}
            <CardHeader className="pb-4">
              {" "}
              <CardTitle className="flex items-center gap-2 text-xl">
                Эрүүл мэнд ба зан ааш{" "}
              </CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent className="space-y-6 -mt-7">
              {" "}
              <div className="space-y-2">
                {" "}
                <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                  {" "}
                  Эрүүл мэндийн мэдээлэл{" "}
                  <span className="text-red-500">*</span>{" "}
                </label>{" "}
                <textarea
                  name="healthInfo"
                  value={inputValues.healthInfo}
                  onChange={handleInputs}
                  placeholder="Вакцинжуулалт, хийлгэсэн эмчилгээ, тогтмол үзүүлдэг эмнэлэг эмчилгээ болон анхаарах зүйлсийг бичнэ үү.."
                  className="w-full h-20 text-base border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-md p-3 resize-none"
                />{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                  {" "}
                  Заслага хийлгэсэн эсэх
                  <span className="text-red-500">*</span>{" "}
                </label>{" "}
                <Select
                  value={inputValues.sterilized}
                  onValueChange={(value: string) =>
                    setInputValues({
                      ...inputValues,
                      sterilized: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Сонгох..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Тийм</SelectItem>
                    <SelectItem value="No">Үгүй</SelectItem>
                    <SelectItem value="Unknown">Тодорхойгүй</SelectItem>
                  </SelectContent>
                </Select>
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                  {" "}
                  Зан ааш{" "}
                </label>{" "}
                <textarea
                  name="personality"
                  value={inputValues.personality}
                  onChange={handleInputs}
                  placeholder="Амьтны зан ааш, дадал зуршлыг бичнэ үү..."
                  className="w-full h-20 text-base border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-md p-3 resize-none"
                />{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                  {" "}
                  Зан аашны онцгой анхаарах зүйлс
                </label>{" "}
                <textarea
                  name="AggressionNote"
                  value={inputValues.AggressionNote}
                  onChange={handleInputs}
                  placeholder="Анхаарах зан төлөвийн онцлог, тодорхой нөхцөлд илрэх хариу үйлдэл. Тодорхой орчин, дуу чимээ, хөдөлгөөнд хэрхэн хариу үзүүлдгийг дурдана уу бичнэ үү
"
                  className="w-full h-20 text-base border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-md p-3 resize-none"
                />
              </div>
            </CardContent>
          </Card>{" "}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                Бусадтай нийцэмжтэй байдал
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    label: "🐱 Мууртай нийцэмж",
                    name: "CatFriendly",
                    icon: "🐱",
                  },
                  {
                    label: "🐕 Нохойтой нийцэмж",
                    name: "DogFriendly",
                    icon: "🐕",
                  },
                  {
                    label: "👶 Хүүхэдтэй нийцэмж",
                    name: "KidFriendly",
                    icon: "👶",
                  },
                  {
                    label: "⚡ Дайсагналын түвшин",
                    name: "AggressionLevel",
                    icon: "⚡",
                  },
                ].map(({ label, name, icon }) => (
                  <div className="space-y-2" key={name}>
                    {" "}
                    <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                      {" "}
                      {icon} {label.replace(/🐱|🐕|👶|⚡ /, "")}{" "}
                    </label>{" "}
                    <Select
                      value={inputValues[name as InputKeys]}
                      onValueChange={(value: string) =>
                        setInputValues({ ...inputValues, [name]: value })
                      }
                    >
                      {" "}
                      <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 transition-colors">
                        {" "}
                        <SelectValue placeholder="Сонгоно уу..." />{" "}
                      </SelectTrigger>{" "}
                      <SelectContent>
                        {" "}
                        {name === "AggressionLevel" ? (
                          <>
                            {" "}
                            <SelectItem value="Low">
                              {" "}
                              <div className="flex items-center gap-2">
                                {" "}
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-800"
                                >
                                  Бага
                                </Badge>{" "}
                              </div>{" "}
                            </SelectItem>{" "}
                            <SelectItem value="Medium">
                              {" "}
                              <div className="flex items-center gap-2">
                                {" "}
                                <Badge
                                  variant="secondary"
                                  className="bg-yellow-100 text-yellow-800"
                                >
                                  Дунд
                                </Badge>{" "}
                              </div>{" "}
                            </SelectItem>{" "}
                            <SelectItem value="High">
                              {" "}
                              <div className="flex items-center gap-2">
                                {" "}
                                <Badge
                                  variant="secondary"
                                  className="bg-red-100 text-red-800"
                                >
                                  Өндөр
                                </Badge>{" "}
                              </div>{" "}
                            </SelectItem>{" "}
                          </>
                        ) : (
                          <>
                            <SelectItem value="Yes">
                              <div className="flex items-center gap-2">
                                ✅ Сайн нийцдэг
                              </div>
                            </SelectItem>
                            <SelectItem value="No">
                              <div className="flex items-center gap-2">
                                ❌ Нийцдэггүй
                              </div>
                            </SelectItem>
                            <SelectItem value="Unknown">
                              <div className="flex items-center gap-2">
                                ❓ Тодорхойгүй
                              </div>
                            </SelectItem>
                          </>
                        )}{" "}
                      </SelectContent>{" "}
                    </Select>{" "}
                  </div>
                ))}{" "}
                <img
                  src="/d-c.gif"
                  className="w-50 h-40 absolute right-1.5 bottom-1"
                ></img>
              </div>{" "}
            </CardContent>{" "}
          </Card>{" "}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            {" "}
            <CardHeader className="pb-4">
              {" "}
              <CardTitle className="flex items-center gap-2 text-xl">
                {" "}
                📸 Амьтныхаа зургийг оруулна уу{" "}
              </CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent className="space-y-4">
              {" "}
              <div className="space-y-2">
                {" "}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors -mt-8 mb-10">
                  {" "}
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFile}
                    className="hidden"
                    id="image-upload"
                  />{" "}
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {" "}
                    <div className="text-4xl">📷</div>{" "}
                    <div className="text-gray-600">
                      Зураг сонгохын тулд энд дарна уу
                    </div>{" "}
                  </label>{" "}
                </div>{" "}
              </div>{" "}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {" "}
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      {" "}
                      <img
                        src={img.url ? img.url : URL.createObjectURL(img.file)}
                        alt={`Зураг ${idx + 1}`}
                        className="rounded-xl object-cover h-40 w-full shadow-md group-hover:shadow-lg transition-shadow"
                      />{" "}
                      <button
                        onClick={() =>
                          setImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-lg transition-colors"
                      >
                        {" "}
                        ×{" "}
                      </button>{" "}
                    </div>
                  ))}{" "}
                </div>
              )}{" "}
              <Button
                onClick={() => uploadImages()}
                disabled={images.length === 0 || uploading}
                className="bg-amber-500 text-white  border-2 rounded-xl font-bold px-8 py-4 text-lg backdrop-blur-sm transition-all hover:bg-amber-600 cursor-pointer absolute right-3 bottom-1"
              >
                {" "}
                {uploading ? (
                  <div className="flex items-center gap-2">
                    {" "}
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>{" "}
                    Зураг илгээж байна...{" "}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {" "}
                    📤 Зураг илгээх{" "}
                  </div>
                )}{" "}
              </Button>{" "}
            </CardContent>{" "}
          </Card>{" "}
          <img src="/cat-cat.gif" className="-mb-6 -ml-7"></img>
          <Button
            onClick={createAdopt}
            className="bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold px-10 py-4 text-lg transition-all hover:scale-105 shadow-lg
            "
            type="button"
            disabled={
              !inputValues.name ||
              !inputValues.age ||
              !inputValues.breed ||
              !inputValues.sterilized ||
              !inputValues.description ||
              !inputValues.CatFriendly ||
              !inputValues.DogFriendly ||
              !inputValues.KidFriendly ||
              !inputValues.AggressionLevel ||
              !inputValues.AggressionNote ||
              !inputValues.personality ||
              !inputValues.healthInfo ||
              !inputValues.status ||
              !inputValues.gender ||
              !inputValues.animalType
            }
          >
            {" "}
            <div className="flex items-center gap-2 cursor-pointer">
              Илгээх
            </div>{" "}
          </Button>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
};

export default Page;
