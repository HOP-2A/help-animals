"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Image from "next/image";

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
import dynamic from "next/dynamic";
import AnimalMap from "@/app/components/AnimalMap";
const Page = () => {
  const params = useParams();
  const postId = params.postId as string;

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT: INFO + IMAGES */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Амьтны мэдээлэл</h1>

        <p className="text-gray-700">{animal.description}</p>

        <div className="grid grid-cols-2 gap-4">
          {animal.images.map((img, i) => (
            <div
              key={i}
              className="relative w-full h-60 rounded-xl overflow-hidden"
            >
              <Image src={img} alt="animal" fill className="object-cover" />
            </div>
          ))}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <b>Байршил:</b> {animal.location}
          </p>
          <p>
            <b>Нөхцөл:</b> {animal.condition}
          </p>
          <p>
            <b>Статус:</b> {animal.status}
          </p>
          <p>
            <b>Утас:</b> {animal.phoneNumber}
          </p>
          <p>
            <b>Нийтэлсэн:</b> {animal.user.firstName} {animal.user.lastName}
          </p>
        </div>
      </div>

      {/* RIGHT: MAP */}
      <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-lg">
        <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-lg">
          <AnimalMap
            lat={animal.lat}
            lng={animal.lng}
            location={animal.location}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
