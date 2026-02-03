"use client";

import { ChangeEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { upload } from "@vercel/blob/client";
import dynamic from "next/dynamic";
import { MapPinned } from "lucide-react";

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

import { PawPrint, MapPin, HeartPulse, Image as ImageIcon } from "lucide-react";

const SelectLocationMap = dynamic(() => import("../components/googlemap"), {
  ssr: false,
});

type ImageItem = {
  file: File;
  url: string;
};

const Page = () => {
  const [inputValues, setInputValues] = useState({
    animalStatus: "",
    healthCondition: "",
    location: "",
    description: "",
    images: [],
  });
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({ lat, lng });
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
    setUploading(false);
  };

  const createdHelpAnimal = async () => {
    const response = await fetch("/api/help-animal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: location,
        description: inputValues.description,
        images: images.map((img) => img.url),
        status: inputValues.animalStatus,
        userId: "some-user-id",
        condition: inputValues.healthCondition,
      }),
    });
  };

  const handleInputs = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInputValues({ ...inputValues, [name]: value });
  };

  console.log(inputValues.animalStatus, "qwe");
  return (
    <div className="p-6">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="
      flex items-center gap-2 
      px-4 py-2 
      bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400 
      text-white font-semibold 
      rounded-lg 
      shadow-lg 
      hover:scale-105 hover:shadow-xl 
      transition-transform duration-200
    "
          >
            {/* Хэрэв хэрэглэгч идэвхтэй бол */}
            <PawPrint className="w-5 h-5 text-white animate-bounce" />
            {/* Хэрэв унтаж байгаа мэт дүрслэх бол */}
            {/* <SleepyCat className="w-5 h-5 text-white animate-pulse" /> */}
            Тусламж хэрэгтэй амьтан нэмэх
          </Button>
        </DialogTrigger>

        <DialogContent
          className="
    max-w-lg 
    w-[95vw] 
    sm:rounded-2xl 
    rounded-xl 
    p-4 
    sm:p-6
    max-h-[90vh] 
    overflow-y-auto
"
        >
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-xl sm:text-2xl font-bold flex justify-center items-center gap-2">
              🐾 Амьтан аврах хүсэлт
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-800">
              Тусламж хэрэгтэй байгаа амьтны мэдээллийг аль болох дэлгэрэнгүй
              оруулна уу. Таны оруулсан мэдээлэл нэг амьтны амийг аварч чадна ❤️
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="flex  gap-10">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-brown-200" />
                  Амьтны байдал
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Сонгох..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">Алга болсон</SelectItem>
                    <SelectItem value="homeless">Эзэнгүй / гудамжны</SelectItem>
                    <SelectItem value="abandoned"> Хаягдсан</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <HeartPulse className="w-4 h-4 text-red-400" />
                  Эрүүл мэндийн байдал
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Сонгох..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy"> Эрүүл</SelectItem>
                    <SelectItem value="injured"> Бэртсэн</SelectItem>
                    <SelectItem value="starving">Өлссөн / сульдсан</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                Байршил
              </Label>
              <Input placeholder="Жишээ: Баянзүрх дүүрэг, 13-р хороолол..." />
            </div>
            <div className="rounded-xl border p-3 space-y-2">
              <Label className="flex items-center gap-2">
                <MapPinned className="w-4 h-4 text-red-500" />
                Байршлаа map дээр дарж сонгоно уу
              </Label>

              <div className="overflow-hidden rounded-xl border">
                <SelectLocationMap onSelect={handleLocationSelect} />
              </div>

              {location && (
                <p className="text-xs text-muted-foreground">
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Тайлбар</Label>
              <Textarea
                placeholder="Амьтны байдал, хэр удаан тэнд байсан, ямар тусламж хэрэгтэй мэт..."
                rows={4}
              />
            </div>

            <div className="rounded-xl border p-4 space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-pink-500" />
                Амьтны зураг
              </Label>

              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFile}
                className="cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-2 mt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={img.url ? img.url : URL.createObjectURL(img.file)}
                      alt={`preview ${idx}`}
                      className="rounded-lg object-cover h-32 w-full"
                    />
                    <button
                      onClick={() => {
                        setImages((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <Button
                onClick={(updatedImages) => uploadImages()}
                disabled={uploading}
                className="w-full"
                variant="secondary"
              >
                {uploading ? "Upload хийж байна..." : "Зураг оруулах"}
              </Button>
            </div>

            <Button className="w-full mt-4">Тусламжийн хүсэлт илгээх</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
