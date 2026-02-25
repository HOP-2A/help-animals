"use client";

import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/useAuth";
import HeadBar from "../../_components/headbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Settings, SquareX, Star } from "lucide-react";
import { useState, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PawPrint, MapPin, HeartPulse, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { upload } from "@vercel/blob/client";
import { Label } from "@/components/ui/label";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import { DialogClose } from "@radix-ui/react-dialog";
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImg: string;
  phoneNumber: string;
};

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

type Pet = {
  id: string;
  name: string;
  breed: string;
  age: string;
  healthInfo: string;
  petImg: string[];
  ownerId: string;
  gender: string;
};
type ImageItem = {
  file: File;
  url: string;
};
type AnimalStatus = "LOST" | "HOMELESS" | "IN_PROGRESS" | "RESCUED";

type AnimalCondition = "HEALTHY" | "INJURED" | "STARVING";

const Page = () => {
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id ?? null;
  const { user, loading, error } = useAuth(clerkId);
  const [helpAnimals, setHelpAnimals] = useState<HelpAnimal[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("RESCUED");
  const [pet, setPet] = useState<Pet[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<string>("HEALTHY");

  const [reUser, setReUser] = useState<User | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [inputValues, setInputValues] = useState({
    name: "",
    breed: "",
    age: "",
    healthInfo: "",
    gender: "",
    images: [],
  });
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const userId = user?.id;

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).map((file) => ({ file, url: "" }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
  };
  const handleInputs = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInputValues({ ...inputValues, [name]: value });
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
  const { push } = useRouter();

  const myRescueAnimals = async () => {
    const res = await fetch(`/api/my-rescue-animals/${userId}`);
    const data = await res.json();
    setHelpAnimals(data);
  };

  const editRescueAnimals = async (postId: string) => {
    const res = await fetch(`/api/my-rescue-animals/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId,
        userId,
        status: selectedStatus,
        condition: selectedCondition,
      }),
    });
    if (res.ok) {
      toast.success("Амжилттай өөрчиллөө");
      myRescueAnimals();
    }
  };

  const createdPet = async () => {
    const res = await fetch("/api/pet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: inputValues.name,
        breed: inputValues.breed,
        age: inputValues.age,
        healthInfo: inputValues.healthInfo,
        images: images.map((img) => img.url),
        ownerId: userId,
        gender: inputValues.gender,
      }),
    });

    if (res.ok) {
      toast.success("Тэжээвэр амьтан амжилттай бүртгэгдлээ!");
      setInputValues({
        name: "",
        breed: "",
        age: "",
        healthInfo: "",
        gender: "",
        images: [],
      });

      fetchPet();
    }
  };

  const fetchPet = async () => {
    const res = await fetch(`/api/pet/my-pet/${userId}`);
    const data = await res.json();
    setPet(data);
  };

  useEffect(() => {
    if (!userId) return;
    myRescueAnimals();
    fetchPet();
  }, [userId]);

  const deletePet = async (petId: string) => {
    const res = await fetch(`/api/pet/my-pet/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        petId,
        userId,
      }),
    });

    if (res.ok) {
      toast.success("Амжилттай устгагдлаа!");
      fetchPet();
    }
  };

  const deleteHelpAnimal = async (postId: string) => {
    const res = await fetch(`/api/help-animal`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        postId,
      }),
    });
    if (res.ok) {
      toast.success("Амжилттай устгагдлаа!");
      myRescueAnimals();
    }
  };

  const fetchUser = async () => {
    const res = await fetch(`/api/edit-profileImg`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setReUser(data);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchUser();
  }, [userId]);

  const handleSavedProfileImg = async () => {
    try {
      if (!imgFile) {
        toast.error("Нүүр зураг сонгоно уу.");
        return;
      }

      setUploading(true);

      const uploaded = await upload(imgFile.name, imgFile, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      const newImageUrl = uploaded.url;

      const res = await fetch(`/api/edit-profileImg`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          imageUrl: newImageUrl,
        }),
      });

      if (res.ok) {
        setImageUrl(newImageUrl);
        toast.success("Нүүр зураг амжилттай шинэчлэгдлээ!");
        fetchUser();
      }
    } catch (err) {
      toast.error("Нүүр зураг байршуулж чадсангүй. Дахин оролдоно уу.");
    } finally {
      setUploading(false);
    }
  };

  const statusColors: Record<AnimalStatus, string> = {
    LOST: "bg-red-400 text-white",
    HOMELESS: "bg-blue-800 text-white",
    IN_PROGRESS: "bg-yellow-400 text-white",
    RESCUED: "bg-green-600 text-white",
  };

  const conditionColors: Record<AnimalCondition, string> = {
    HEALTHY: "border-green-500 text-green-600",
    INJURED: "border-red-500 text-red-600",
    STARVING: "border-orange-500 text-orange-600",
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-amber-50">
      <HeadBar />
      <div className="flex  md:flex-row items-center md:items-end gap-6">
        <div className="relative ">
          <Avatar className="w-32 h-32 border-4 border-yellow-400 shadow-xl mt-10 ml-20">
            <AvatarImage
              src={reUser?.profileImg}
              alt="profile"
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-600 text-white text-3xl">
              {reUser?.firstName?.[0]}
              {reUser?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="absolute bottom-2 right-2 bg-amber-500 p-1 rounded-full shadow-md hover:scale-110 transition">
            <Dialog>
              <DialogTrigger>
                <Camera className="w-6 h-6 text-white " />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-center">
                    Нүүр зураг сонгох
                  </DialogTitle>
                  <DialogDescription></DialogDescription>
                  <Input
                    type="file"
                    onChange={handleFile}
                    accept="image/*"
                    className="mt-2 text-center"
                  />

                  <Button
                    onClick={handleSavedProfileImg}
                    disabled={uploading}
                    type="button"
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-5 py-2 font-semibold shadow-md transition"
                  >
                    {uploading
                      ? "Нүүр зураг байршуулж байна..."
                      : "Нүүр зураг байршуулах"}
                  </Button>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-tight -mt-25">
              {reUser?.firstName} {reUser?.lastName}
            </h1>
            <p className="text-gray-500 mt-1">{reUser?.email}</p>
          </div>
        </div>
        <div>
          <div>
            <img
              src="/cute-dog.gif"
              className="w-40 h-30 absolute top-35 right-20"
            ></img>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-6 py-3 font-semibold shadow-md transition absolute top-63 right-18 cursor-pointer">
                  Тэжээвэр амьтан нэмэх
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-2xl rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">
                    Тэжээвэр амьтнаа нэмэх
                  </DialogTitle>
                  <DialogDescription className="text-center text-lg text-gray-700 mt-1">
                    Тэжээвэр амьтныхаа мэдээллийг бүрэн бөглөж, зургийг оруулна
                    уу.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Нэр <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Жишээ: Buddy"
                        value={inputValues.name || ""}
                        name="name"
                        onChange={handleInputs}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Үүлдэр <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Жишээ: Golden Retriever"
                        value={inputValues.breed}
                        name="breed"
                        onChange={handleInputs}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Нас <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Жишээ: 2 настай"
                        value={inputValues.age}
                        name="age"
                        type="number"
                        onChange={handleInputs}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Хүйс <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        name="gender"
                        value={inputValues.gender}
                        onValueChange={(value) =>
                          setInputValues((prev) => ({
                            ...prev,
                            gender: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-45">
                          <SelectValue placeholder="Хүйс сонгох" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="MALE">Эр</SelectItem>
                            <SelectItem value="FEMALE">Эм</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Эрүүл мэндийн мэдээлэл{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      placeholder="Жишээ: Вакцин хийлгэсэн, харшилгүй..."
                      value={inputValues.healthInfo}
                      name="healthInfo"
                      onChange={handleInputs}
                      className="w-full border rounded-xl p-3 min-h-25"
                    />
                  </div>

                  <div className="rounded-2xl border p-5 space-y-4 bg-gray-50">
                    <Label className="flex items-center gap-2 font-medium">
                      <ImageIcon className="w-4 h-4 text-pink-500" />
                      Амьтны зураг <span className="text-red-500">*</span>
                    </Label>

                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFiles}
                      className="cursor-pointer rounded-xl"
                    />

                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={
                                img.url
                                  ? img.url
                                  : URL.createObjectURL(img.file)
                              }
                              alt={`preview ${idx}`}
                              className="rounded-xl object-cover h-32 w-full"
                            />
                            <button
                              onClick={() =>
                                setImages((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                )
                              }
                              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      onClick={() => uploadImages()}
                      disabled={uploading}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-5 py-2 font-semibold shadow-md transition"
                    >
                      {uploading
                        ? "Зураг байршуулж байна..."
                        : "Зураг байршуулах"}
                    </Button>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" className="rounded-xl">
                      Цуцлах
                    </Button>

                    <Button
                      className="bg-amber-600 hover:bg-amber-400 cursor-pointer  text-white rounded-xl px-6"
                      onClick={createdPet}
                    >
                      Нэмэх
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      {helpAnimals.length > 0 && (
        <h2 className="text-3xl font-bold ml-20 mt-10">
          Миний оруулсан тусламж хэрэгтэй амьтад
        </h2>
      )}
      <div className="flex justify-start">
        <div
          className="
  grid
  grid-cols-2
  sm:grid-cols-4
  lg:grid-cols-4
  gap-4
  max-w-6xl
  w-full
  ml-20 mt-10
  
"
        >
          {helpAnimals.map((animal: HelpAnimal, index: number) => (
            <Card
              key={animal.id}
              className="
    rounded-2xl
    overflow-hidden
    bg-white
    shadow-md
    transition-all
    hover:shadow-xl
 hover:-translate-y-2 duration-300
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

                <Dialog>
                  <DialogTrigger>
                    {" "}
                    <span>
                      {" "}
                      {animal.userId === userId ? (
                        <Star
                          className="text-yellow-400 absolute top-4 right-3 fill-amber-400 cursor-pointer"
                          onClick={() =>
                            console.log(
                              "Star clicked for animal ID:",
                              animal.id,
                            )
                          }
                        />
                      ) : (
                        ""
                      )}
                    </span>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-center text-xl font-bold">
                        Амьтны мэдээлэл шинэчлэх
                      </DialogTitle>
                      <DialogDescription className="text-center text-gray-500 mt-1">
                        Амьтны одоогийн нөхцөл болон статусыг шинэчилнэ үү.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-6">
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Одоогийн статус
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColors[animal.status]}`}
                          >
                            {animal.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Одоогийн биеийн байдал
                          </span>
                          <Badge
                            variant="outline"
                            className={`${conditionColors[animal.condition]} bg-white`}
                          >
                            {animal.condition}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Шинэ статус
                        </label>
                        <select
                          className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-400 outline-none"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                          <option value="RESCUED">
                            Эзэнтэй болсон (Rescued)
                          </option>
                          <option value="HOMELESS">Эзэнгүй / гудамжны</option>
                          <option value="LOST">Төөрсөн</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Биеийн байдал
                        </label>
                        <select
                          className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-400 outline-none"
                          value={selectedCondition}
                          onChange={(e) => setSelectedCondition(e.target.value)}
                        >
                          <option value="HEALTHY">Эрүүл</option>
                          <option value="STARVING">Өлссөн / сульдсан</option>
                          <option value="INJURED">Гэмтсэн</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <DialogClose className="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-100 transition">
                          {" "}
                          Цуцлах
                        </DialogClose>
                        <button
                          onClick={() => editRescueAnimals(animal.id)}
                          className="px-5 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition shadow-md"
                        >
                          Шинэчлэх
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

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
                <div className="flex justify-between">
                  {" "}
                  <div></div>
                  <Dialog>
                    <DialogTrigger>
                      {" "}
                      <SquareX className="text-red-400 hover:text-red-600 cursor-pointer" />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold">
                          Та устгахдаа итгэлтэй байна уу?
                        </DialogTitle>
                        <DialogDescription className="text-center text-gray-900 mt-1 text-lg">
                          Устгасан амьтны мэдээллийг дахин сэргээх боломжгүй тул
                          анхааралтай уншаад шийдвэрээ гаргана уу.
                        </DialogDescription>
                        <div className="flex justify-end gap-3">
                          <DialogClose className="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-100 transition">
                            {" "}
                            Цуцлах
                          </DialogClose>
                          <Button
                            className="px-4 py-5 rounded-xl border text-white bg-red-400  hover:bg-red-500"
                            onClick={() => deleteHelpAnimal(animal.id)}
                          >
                            Устгах
                          </Button>
                        </div>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
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
      <div>
        {pet.length > 0 && (
          <div className="flex flex-col ml-20 mt-10">
            <img
              src="/bird-blue.gif"
              className="w-16 h-16 -mb-5 ml-83"
              alt="bird"
            />
            <div className="text-3xl font-bold">Миний тэжээвэр амьтан</div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl px-6 mb-10 ml-15 mt-10">
        {pet.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all  overflow-hidden group"
          >
            <div className="relative">
              <img
                src={p.petImg?.[0] || "/placeholder.png"}
                alt={p.name}
                className="w-full h-60 object-cover  transition-transform duration-300"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />

              <Badge className="absolute bottom-4 left-4 text-white text-xl font-bold bg-yellow-500">
                {p.name}
              </Badge>

              <span className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">
                {p.gender === "FEMALE" ? "Эм" : "Эр"}
              </span>
            </div>

            <div className="p-6 space-y-3">
              <div className="text-gray-900">
                <span className="font-medium text-gray-900">Үүлдэр:</span>{" "}
                {p.breed}
              </div>

              <div className="text-gray-900">
                <span className="font-medium text-gray-900">Нас:</span> {p.age}
              </div>

              <div className="text-sm text-gray-900 line-clamp-2">
                {p.healthInfo}
              </div>
              <Button
                className="bg-yellow-400 text-white
               rounded-3xl font-bold text-base sm:text-lg 
               md:text-xl px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4
                shadow-[0_4px_0_#27408B] hover:scale-105 hover:shadow-amber-400
                 active:translate-y-1 active:shadow-amber-200 transition-all
                  hover:bg-amber-200 hover:text-white "
                onClick={() => push(`/my-pet/${p.id}`)}
              >
                Дэлгэрэнгүй харах
              </Button>
            </div>
            <div className="flex justify-end gap-3 mb-4 mr-4">
              <div></div>
              <Dialog>
                <DialogTrigger>
                  {" "}
                  <SquareX className="text-red-400 hover:text-red-600 cursor-pointer ml-10" />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">
                      Та устгахдаа итгэлтэй байна уу?
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-900 mt-1 text-lg">
                      Устгасан амьтны мэдээллийг дахин сэргээх боломжгүй тул
                      анхааралтай уншаад шийдвэрээ гаргана уу.
                    </DialogDescription>
                    <div className="flex justify-end gap-3">
                      <DialogClose className="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-100 transition">
                        {" "}
                        Цуцлах
                      </DialogClose>
                      <Button
                        className="px-4 py-5 rounded-xl border text-white bg-red-400  hover:bg-red-500"
                        onClick={() => deletePet(p.id)}
                      >
                        Устгах
                      </Button>
                    </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
