"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/useAuth";
import { useParams } from "next/navigation";

type Pet = {
  name: string;
  breed: string;
  gender: string;
  age: string;
  petImg: string[];
  healthInfo: string;
};
const Page = () => {
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id ?? null;
  const { user } = useAuth(clerkId);
  const userId = user?.id;
  const params = useParams();
  const petId = params.petId;

  const [pet, setPet] = useState<Pet>();
  const images = pet?.petImg || [];
  const [index, setIndex] = useState(0);
  const fetchPet = async () => {
    const res = await fetch(`/api/pet/my-pet/${userId}`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        petId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setPet(data);
    }
  };

  useEffect(() => {
    fetchPet();
  }, [petId]);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-100 via-rose-100 to-sky-100 p-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center mt-35">
        <div className="relative group">
          <div className="overflow-hidden rounded-3xl shadow-2xl shadow-amber-300">
            <img
              src={images[index]}
              alt={pet?.name}
              className="w-full h-175 object-cover transition-all duration-700 group-hover:scale-105"
            />
          </div>

          <div className="absolute inset-0 rounded-3xl border border-orange-300/40 pointer-events-none"></div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === index ? "bg-orange-400 w-5" : "bg-orange-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-6xl font-extrabold tracking-tight bg-linear-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              {pet?.name}
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Тоглоомч, энхрий, үнэнч найз.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-orange-200 p-6 rounded-2xl shadow-md">
              <p className="text-lg text-orange-400">Үүлдэр</p>
              <p className="text-xl font-semibold mt-1 text-gray-800">
                {pet?.breed}
              </p>
            </div>

            <div className="bg-white border border-pink-200 p-6 rounded-2xl shadow-md">
              <p className="text-lg text-pink-400">Нас</p>
              <p className="text-xl font-semibold mt-1 text-gray-800">
                {pet?.age} настай
              </p>
            </div>
          </div>

          <div className="bg-linear-to-r from-amber-100 to-rose-100 border border-orange-200 p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-orange-500 mb-3">
              🐾 Эрүүл мэнд
            </h2>
            <p className="text-gray-800 leading-relaxed text-lg">
              {pet?.healthInfo}
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-1 right-2 -mb-10">
        <img src="/ookun.gif"></img>
      </div>
    </div>
  );
};

export default Page;
