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
  MessageCircle,
  MoreHorizontal,
  Send,
  Star,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/useAuth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

import { PawPrint, MapPin, HeartPulse, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  const clerkId = clerkUser?.id ?? null;
  const { user, loading, error } = useAuth(clerkId);

  const userId = user?.id;

  const [liked, setLiked] = useState(false);

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
      userId,
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
    } catch (err) {
      toast.error("Алдаа гарлаа");
    }
  };

  const handleInputs = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInputValues({ ...inputValues, [name]: value });
  };

  const { push } = useRouter();
  const helpAnimals = async () => {
    const response = await fetch("/api/help-animal");
    const data = await response.json();
    if (response.ok) {
      setHelpAnimals(data);
    }
  };

  console.log(allHelpAnimals);

  const like = async (postId: string) => {
    const response = await fetch(`/api/help-animal-like/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.message === "liked") {
        setLiked(true);
      } else if (data.message === "remove like") {
        setLiked(false);
      }
    }
  };

  useEffect(() => {
    helpAnimals();
  }, []);

  const statusColors: any = {
    LOST: "bg-red-400 text-white",
    HOMELESS: "bg-blue-800 text-white",
    IN_PROGRESS: "bg-yellow-400 text-white",
    SAFE: "bg-green-800 text-white",
  };

  const conditionColors: any = {
    HEALTHY: "border-green-500 text-green-600",
    INJURED: "border-red-500 text-red-600",
    STARVING: "border-orange-500 text-orange-600",
  };

  const bgVariants = [
    "bg-rose-50",
    "bg-yellow-50",
    "bg-emerald-50",
    "bg-sky-50",
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <HeadBar />
      <div className="text-center py-10 space-y-3 mt-4">
        <div className="flex flex-col justify-center items-center">
          <img src="cat-cute.gif" className="w-40 h-40 -mb-8 "></img>
          <h1 className="text-4xl font-bold text-blue-900 flex justify-center items-center gap-2">
            🐾 Тусламж хэрэгтэй амьтад
          </h1>
          <p className="text-2xl text-blue-900">
            Нэг товшилт нэг амийг аварч чадна
          </p>
        </div>
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex justify-center">
                <Button
                  className="
    bg-yellow-400 text-white rounded-3xl font-bold
    text-base sm:text-lg md:text-xl
    px-5 sm:px-6 md:px-8
    py-2.5 sm:py-3 md:py-4

    shadow-[0_6px_0_#27408B]
    transition-all duration-300

    hover:bg-yellow-300
    hover:brightness-110
    hover:scale-105
    active:translate-y-1
    active:shadow-amber-200

    sun-glow sun-glow-hover
    flex items-center gap-2
    cursor-pointer

  "
                >
                  {" "}
                  <PawPrint className="text-3xl" />
                  Тусламж хэрэгтэй амьтан нэмэх
                </Button>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-lg w-[95vw] sm:rounded-2xl rounded-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <DialogHeader className="text-center space-y-2">
                <DialogTitle className="text-xl sm:text-2xl font-bold flex  justify-center items-center gap-2 text-blue-900">
                  🐾 Амьтан аврах хүсэлт
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-gray-800">
                  Тусламж хэрэгтэй байгаа амьтны мэдээллийг аль болох
                  дэлгэрэнгүй оруулна уу. Таны оруулсан мэдээлэл нэг амьтны
                  амийг аварч чадна ❤️
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="flex gap-10">
                  <div className="flex">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <PawPrint className="w-4 h-4 text-brown-200" /> Амьтны
                        байдал <span className="text-red-500 font-bold">*</span>
                      </Label>
                      <Select
                        value={inputValues.animalStatus}
                        onValueChange={(value: string) =>
                          setInputValues({
                            ...inputValues,
                            animalStatus: value,
                          })
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
                        <HeartPulse className="w-4 h-4 text-red-400" /> Эрүүл
                        мэндийн байдал{" "}
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
                    <MapPin className="w-4 h-4 text-red-600" /> Байршил{" "}
                    <span className="text-red-500 font-bold">*</span>
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
                    <MapPinned className="w-4 h-4 text-red-500" /> Байршлаа map
                    дээр дарж сонгоно уу{" "}
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
                    <ImageIcon className="w-4 h-4 text-pink-500" /> Амьтны зураг{" "}
                    <span className="text-red-500 font-bold">*</span>
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
                          src={
                            img.url ? img.url : URL.createObjectURL(img.file)
                          }
                          alt={`preview ${idx}`}
                          className="rounded-lg object-cover h-32 w-full"
                        />
                        <button
                          onClick={() =>
                            setImages((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => uploadImages()}
                    disabled={uploading}
                    className="bg-amber-500 text-white rounded-3xl font-bold text-base sm:text-lg md:text-xl px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4
                     shadow-[0_4px_0_#27409B] hover:scale-105 hover:shadow-amber-500 active:translate-y-1 active:shadow-amber-200
                     transition-all hover:bg-orange-500 hover:text-white cursor-pointer"
                  >
                    {uploading ? "Upload хийж байна..." : "Зураг оруулах"}
                  </Button>
                </div>

                <Button
                  className=" w-full bg-yellow-400 text-white rounded-3xl font-bold text-base sm:text-lg md:text-xl px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4
                     shadow-[0_4px_0_#27408B] hover:scale-105 hover:shadow-amber-500 active:translate-y-1 active:shadow-amber-200
                     transition-all hover:bg-yellow-300 hover:text-white shadow-hover:text-yellow:hover shadow-2xl cursor-pointer"
                  onClick={createdHelpAnimal}
                >
                  Тусламжийн хүсэлт илгээх
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          className="
  grid
  grid-cols-2
  sm:grid-cols-4
  lg:grid-cols-4
  gap-4
     max-w-6xl
      w-full
         mx-auto
        "
        >
          {allHelpAnimals.map((animal: HelpAnimal, index: number) => (
            <Card
              key={animal.id}
              className="
    rounded-2xl
    overflow-hidden
    bg-white
    shadow-md
    transition-all
    hover:shadow-xl
    hover:-translate-y-1
    border-2 hover:border-amber-300 
  "
            >
              <div className="relative">
                <img
                  src={animal.images?.[0] || "/placeholder.png"}
                  alt="Animal"
                  className="
      w-full
      aspect-square
      object-cover
    "
                />
                <span>
                  {" "}
                  {animal.userId === userId ? (
                    <Star className="text-yellow-400 absolute top-4 right-3 fill-amber-400 " />
                  ) : (
                    ""
                  )}
                </span>

                <span
                  className={`
      absolute top-3 left-3
      px-3 py-1
      rounded-full
      text-xs font-semibold
      backdrop-blur  text-blue-950
      ${statusColors[animal.status]}
    `}
                >
                  {animal.status}
                </span>
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`${conditionColors[animal.condition]} bg-white`}
                  >
                    {animal.condition}
                  </Badge>
                  <PawPrint className="text-gray-400" size={18} />
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin size={14} />
                  {animal.location}
                </div>

                <Button
                  className="bg-orange-400 text-white
               rounded-3xl font-bold text-base sm:text-lg 
               md:text-xl px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4
                shadow-[0_4px_0_#27408B] hover:scale-105 hover:shadow-amber-500
                 active:translate-y-1 active:shadow-amber-200 transition-all
                  hover:bg-orange-500 hover:text-white "
                  onClick={() => push(`/help-animal/location/${animal.id}`)}
                >
                  Тусламж үзүүлэх
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        {/* <img src="wave-cute.gif" className="w-40 h-40"></img> */}
        <img src="husky-shiba.gif" className="w-60 h-60"></img>
        <img src="meow-hungry.gif" className="w-40 h-40"></img>
      </div>
    </div>
  );
};

export default Page;
