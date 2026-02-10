"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import * as React from "react";

type Animal = {
  id: string;
  description: string;
  images: string[];
  lat: number;
  lng: number;
  location: string;
  phoneNumber: string;
  status: string;
  condition: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Badge } from "@/components/ui/badge";
const statusColors: any = {
  LOST: "bg-red-400 text-white",
  HOMELESS: "bg-blue-800 text-white",
  IN_PROGRESS: "bg-yellow-400 text-white",
  SAFE: "bg-green-800 text-white",
};

const conditionColors: any = {
  HEALTHY: "border-green-500 text-green-700 font-bold ",
  INJURED: "border-red-500 text-red-600",
  STARVING: "border-orange-500 text-orange-600",
};

import dynamic from "next/dynamic";
import AnimalMap from "@/app/components/AnimalMap";
import { Input } from "@/components/ui/input";
import { MapPin, PawPrint } from "lucide-react";
const Page = () => {
  const params = useParams();
  const postId = params.postId as string;

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    if (!postId) return;

    const fetchAnimal = async () => {
      const res = await fetch(`/api/help-animal/location/${postId}`);
      const data = await res.json();
      setAnimal(data);
      setLoading(false);
    };

    fetchAnimal();
  }, [postId]);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!animal) {
    return <div className="p-10">Not found</div>;
  }

  console.log(animal.user);

  return (
    <div>
      <div className="min-h-screen bg-linear-to-br from-sky-50 to-blue-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          <div className="p-8 lg:p-12 space-y-8 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <PawPrint className="w-10 h-10 text-stone-600" />
                <h1 className="text-4xl font-extrabold text-blue-900">
                  Амьтны мэдээлэл
                </h1>
              </div>
              <div className="flex flex-col lg:flex-row gap-6">
                <Carousel className="w-full max-w-48 sm:max-w-xs ml-10">
                  <CarouselContent className="relative w-full h-64">
                    {" "}
                    {animal.images.map((img, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <Card className="w-full h-64">
                            <CardContent className="relative w-full h-full flex items-center justify-center p-0">
                              <Image
                                src={img}
                                alt="animal"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  <CarouselPrevious className="mx-5" />
                  <CarouselNext className="mx-5" />
                </Carousel>

                <div className="flex-1 bg-slate-50 rounded-2xl p-6 space-y-4">
                  <p className="text-slate-500 font-bold text-[18px]">
                    Нийтэлсэн
                  </p>
                  <p className="font-semibold text-[18px]">
                    {animal.user.firstName} {animal.user.lastName}
                  </p>

                  <p className="text-slate-500 font-bold text-[20px]">Утас</p>
                  <p className="font-semibold text-[18px]">
                    {animal.phoneNumber}
                  </p>

                  <p className="text-slate-500 font-bold text-[20px]">Имэйл</p>
                  <p className="font-semibold text-[18px]">
                    {animal.user.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-full text-[18px] bg-yellow-100 text-gray-800 text-sm font-semibold flex gap-2">
                  <MapPin className="text-red-500" />
                  {animal.location}
                </span>
                <Badge
                  variant="outline"
                  className={`${conditionColors[animal.condition]} bg-white p-2`}
                >
                  {animal.condition}
                </Badge>
                <span
                  className={`
      px-3 py-1
      rounded-full
      text-xs font-semibold
      backdrop-blur  text-blue-950
     pt-3
      ${statusColors[animal.status]}
    `}
                >
                  {animal.status}
                </span>
              </div>
              <p className="text-xl text-gray-900 leading-relaxed">
                {animal.description}
              </p>

              <div className="border-t-2 border-t-amber-400">
                <div className="text-2xl font-bold text-blue-900 pb-4 pt-3">
                  Сэтгэгдэл
                </div>
                <textarea placeholder="Сэтгэгдэл үлдээх..."></textarea>
                <Input />
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="sticky top-0 h-screen">
              <AnimalMap
                lat={animal.lat}
                lng={animal.lng}
                location={animal.location}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
