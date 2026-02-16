"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import * as React from "react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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

type Comment = {
  id: string;
  content: string;
  replies: [
    {
      id: string;
      content: string;
      createdAt: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    },
  ];

  user: {
    id: string;
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
import { MapPin, PawPrint, Send } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/useAuth";
import { toast } from "sonner";
const Page = () => {
  const params = useParams();
  const postId = params.postId as string;
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id ?? null;
  const { user, error } = useAuth(clerkId);

  const userId = user?.id;
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const getComments = async () => {
    const response = await fetch("/api/help-comment/get-comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        helpPostId: postId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setComments(data);
    } else if (!response.ok) {
      const data = await response.json();
      console.log(data);
    }
  };

  console.log(comments);
  const handleComment = async (postId: string) => {
    const response = await fetch("/api/help-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        helpPostId: postId,
        content: comment,
        userId,
      }),
    });

    if (response.ok) {
      toast.success("Comment added");
    }

    getComments();
  };

  const handleReplyComment = async (postId: string, parentId: string) => {
    const response = await fetch("/api/help-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        helpPostId: postId,
        content: replyContent,
        userId,
        parentCommentId: parentId,
      }),
    });

    getComments();
  };

  useEffect(() => {
    getComments();
  }, [postId]);
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

  console.log(comments);

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

              <div>
                <div className="border-t-2 border-t-amber-400 mt-6">
                  <h2 className="text-2xl font-bold text-blue-900 pb-4 pt-3">
                    Сэтгэгдэл
                  </h2>
                  <div>
                    <div className="flex gap-2 mb-2">
                      <div>
                        <Avatar>
                          <AvatarImage
                            src={user?.profileImg}
                            alt="img"
                            className="grayscale"
                          />
                          <AvatarFallback className="bg-blue-900 text-white">
                            {animal.user.firstName?.[0]}
                            {animal.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      {animal.user.firstName} {animal.user.lastName}
                    </div>
                  </div>
                  <div className="relative w-full">
                    <Input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Сэтгэгдэл үлдээх..."
                      className="w-full border rounded-xl py-8 border-amber-200 shadow-amber-300"
                    />

                    <button
                      onClick={() => handleComment(animal.id)}
                      className=" absolute right-3 top-4 -translate-y-1/2 
 mt-4 bg-blue-400 text-white rounded-3xl font-bold text-base sm:text-lg md:text-xl sm:px-6 
                     shadow-[0_4px_0_#27409B] hover:scale-105 hover:shadow-blue-400 active:translate-y-1 active:shadow-amber-200
                     transition-all hover:bg-blue-900 hover:text-white cursor-pointer mb-4"
                    >
                      <Send />
                    </button>
                  </div>

                  <div>
                    {comments.map((comment, index) => {
                      return (
                        <div key={index}>
                          <div className="bg-gray-100 border-2  border-blue-50 rounded-2xl p-5 mb-2 mt-2">
                            <div>
                              <div className="flex gap-2">
                                <Avatar>
                                  <AvatarImage
                                    src={user?.profileImg}
                                    alt="img"
                                    className="grayscale"
                                  />
                                  <AvatarFallback className="bg-blue-900 text-white">
                                    {animal.user.firstName?.[0]}
                                    {animal.user.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  {" "}
                                  {comment.user.firstName}{" "}
                                  {comment.user.lastName}
                                </div>
                              </div>{" "}
                            </div>
                            <div className="mt-2 ">{comment.content}</div>
                            <div className="ml-12 border-l-2 border-blue-200 pl-4 mt-3 space-y-2">
                              {comment.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="bg-white rounded-xl p-4 shadow-sm"
                                >
                                  <div className="flex gap-2 items-center">
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback>
                                        {reply.user.firstName?.[0]}
                                        {reply.user.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-sm">
                                      {reply.user.firstName}{" "}
                                      {reply.user.lastName}{" "}
                                      <div className="text-xs text-gray-500">
                                        {new Date(
                                          reply.createdAt,
                                        ).toLocaleString()}
                                      </div>
                                    </span>
                                  </div>
                                  <div className="mt-1 text-sm text-gray-700">
                                    {reply.content}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="-mt-4 flex gap-5">
                            <Button
                              onClick={() => setReplyingTo(comment.id)}
                              variant="link"
                            >
                              Хариулах
                            </Button>

                            <Button
                              onClick={() => handleComment(animal.id)}
                              variant="link"
                              className="-ml-10"
                            >
                              Таалагдлаа
                            </Button>
                          </div>
                          <div className="ml-12 mt-2">
                            {replyingTo === comment.id && (
                              <div className="relative">
                                <Input
                                  value={replyContent}
                                  onChange={(e) =>
                                    setReplyContent(e.target.value)
                                  }
                                  placeholder="Хариу бичих..."
                                  className="bg-gray-100 border-2  border-blue-50 rounded-2xl p-5 mb-2 mt-2"
                                />

                                <button
                                  onClick={() =>
                                    handleReplyComment(animal.id, comment.id)
                                  }
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 p-2 rounded-full"
                                >
                                  <Send className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
