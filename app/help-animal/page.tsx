"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { upload } from "@vercel/blob/client";
import dynamic from "next/dynamic";
import {
  Heart,
  MapPinned,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/useAuth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

import {
  PawPrint,
  MapPin,
  HeartPulse,
  Image as ImageIcon,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type HelpAnimal = {
  location: string;
  description: string;
  images: string[];
  status: string;
  userId: string;
  condition: string;
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
const SelectLocationMap = dynamic(() => import("../components/googlemap"), {
  ssr: false,
});

type ImageItem = {
  file: File;
  url: string;
};

const Page = () => {
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id;
  const { user } = useAuth(clerkId ?? "");
  const userId = user?.id;

  console.log(userId);
  const [inputValues, setInputValues] = useState({
    animalStatus: "",
    healthCondition: "",
    location: "",
    description: "",
    images: [],
    phoneNumber: "",
  });

  const [allHelpAnimals, setHelpAnimals] = useState<HelpAnimal[]>([]);
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
    toast.success("Амжилттай upload хийгдлээ!");
    setUploading(false);
  };

  const createdHelpAnimal = async () => {
    if (!location) {
      toast.error("Байршлаа сонгоно уу");
      return;
    }

    await uploadImages();

    if (!images.length) {
      toast.error("Зургуудыг оруулна уу");
      return;
    }

    const payload = {
      description: inputValues.description,
      images: images.map((img) => img.url),
      status: inputValues.animalStatus,
      userId: "1010",
      condition: inputValues.healthCondition,
      lat: location.lat,
      lng: location.lng,
      location: inputValues.location,
      phoneNumber: inputValues.phoneNumber,
    };

    try {
      const response = await fetch("/api/help-animal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
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
        helpAnimals();
      } else {
        const data = await response.json();
        toast.error(data.error || "Алдаа гарлаа");
      }
    } catch (err: any) {
      toast.error(err.message || "Алдаа гарлаа");
    }
  };

  const handleInputs = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInputValues({ ...inputValues, [name]: value });
  };

  const helpAnimals = async () => {
    const response = await fetch("/api/help-animal");
    const data = await response.json();
    if (response.ok) {
      setHelpAnimals(data);
    }
  };

  console.log(allHelpAnimals);

  useEffect(() => {
    helpAnimals();
  }, []);
  return (
    <div>
      <div className="p-6 flex justify-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="
      flex items-center gap-2 
      px-4 py-2 
      bg-linear-to-r from-purple-400 via-pink-500 to-yellow-400 
      text-white font-semibold 
      rounded-lg 
      shadow-lg 
      hover:scale-105 hover:shadow-xl 
      transition-transform duration-200
    "
            >
              <PawPrint className="w-5 h-5 text-white animate-bounce" />
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
                оруулна уу. Таны оруулсан мэдээлэл нэг амьтны амийг аварч чадна
                ❤️
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="flex  gap-10">
                <div className="flex">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <PawPrint className="w-4 h-4 text-brown-200" />
                      Амьтны байдал{" "}
                      <span className="text-red-500 font-bold">*</span>
                    </Label>

                    <Select
                      value={inputValues.animalStatus}
                      onValueChange={(value: string) =>
                        setInputValues({ ...inputValues, animalStatus: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Сонгох..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOST">Алга болсон</SelectItem>
                        <SelectItem value="HOMELESS">
                          Эзэнгүй / гудамжны
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Label className="flex items-center gap-2 mb-2">
                      <HeartPulse className="w-4 h-4 text-red-400" />
                      Эрүүл мэндийн байдал{" "}
                      <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Select
                      value={inputValues.healthCondition}
                      onValueChange={(value: string) =>
                        setInputValues({
                          ...inputValues,
                          healthCondition: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Сонгох..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HEALTHY">Эрүүл</SelectItem>
                        <SelectItem value="INJURED">Бэртсэн</SelectItem>
                        <SelectItem value="STARVING">
                          Өлссөн / сульдсан
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  Байршил <span className="text-red-500 font-bold">*</span>
                </Label>
                <Input
                  placeholder="Жишээ: Баянзүрх дүүрэг, 13-р хороолол..."
                  value={inputValues.location || ""}
                  name="location"
                  onChange={handleInputs}
                />
              </div>
              <div className="rounded-xl border p-3 space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPinned className="w-4 h-4 text-red-500" />
                  Байршлаа map дээр дарж сонгоно уу{" "}
                  <span className="text-red-500 font-bold">*</span>
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
                <Label>Утасны дугаар</Label>
                <Input
                  placeholder="Утасны дугаар оруулах"
                  value={inputValues.phoneNumber || ""}
                  name="phoneNumber"
                  onChange={handleInputs}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Тайлбар <span className="text-red-500 font-bold">*</span>
                </Label>
                <Textarea
                  placeholder="Амьтны байдал, хэр удаан тэнд байсан, ямар тусламж хэрэгтэй мэт..."
                  rows={4}
                  value={inputValues.description || ""}
                  name="description"
                  onChange={handleInputs}
                />
              </div>

              <div className="rounded-xl border p-4 space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink-500" />
                  Амьтны зураг <span className="text-red-500 font-bold">*</span>
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

              <Button className="w-full mt-4" onClick={createdHelpAnimal}>
                Тусламжийн хүсэлт илгээх
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        {allHelpAnimals.map((animal, index) => {
          return (
            <div key={index}>
              <div className="max-w-md mx-auto space-y-8">
                {allHelpAnimals.map((animal: any) => (
                  <Card
                    key={animal.id}
                    className="border-none shadow-none rounded-none"
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={animal.user.profileImg} />
                          <AvatarFallback>
                            {animal.user.firstName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">
                          {animal.user.firstName}
                        </span>
                      </div>

                      <MoreHorizontal size={18} />
                    </div>

                    <Carousel className="w-full">
                      <CarouselContent>
                        {animal.images.map((img: string, i: number) => (
                          <CarouselItem key={i}>
                            <img
                              src={img}
                              alt="Animal"
                              className="w-full aspect-square object-cover"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>

                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex gap-4">
                        <Heart className="cursor-pointer" />
                        <MessageCircle className="cursor-pointer" />
                        <Send className="cursor-pointer" />
                      </div>
                    </div>

                    <CardContent className="px-4 space-y-2">
                      <div className="flex gap-2">
                        <Badge
                          className={
                            animal.status === "LOST"
                              ? "bg-yellow-400 text-black"
                              : animal.status === "HOMELESS"
                                ? "bg-orange-400 text-white"
                                : animal.status === "IN_PROGRESS"
                                  ? "bg-blue-500 text-white"
                                  : "bg-green-500 text-white"
                          }
                        >
                          {animal.status}
                        </Badge>

                        <Badge
                          variant="outline"
                          className={
                            animal.condition === "HEALTHY"
                              ? "border-green-500 text-green-600"
                              : animal.condition === "INJURED"
                                ? "border-red-500 text-red-600"
                                : "border-orange-500 text-orange-600"
                          }
                        >
                          {animal.condition}
                        </Badge>
                      </div>

                      <p className="text-sm">
                        <span className="font-semibold mr-1">
                          {animal.user.firstName}
                        </span>
                        {animal.description}
                      </p>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        <span>{animal.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Page;
