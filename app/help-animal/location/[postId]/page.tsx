"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  MessageCircleX,
  MessageSquareMore,
  PawPrint,
  Send,
  Heart,
  Phone,
  User,
  Clock,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AnimalMap from "@/app/components/AnimalMap";

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
  user: { firstName: string; lastName: string; email: string };
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  replies: {
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; firstName: string; lastName: string; email: string };
  }[];
  user: { id: string; firstName: string; lastName: string; email: string };
};

const statusConfig: Record<
  string,
  { label: string; gradient: string; emoji: string; light: string }
> = {
  LOST: {
    label: "Алга болсон",
    gradient: "from-red-400 to-rose-500",
    emoji: "🔴",
    light: "bg-red-50 text-red-700",
  },
  HOMELESS: {
    label: "Гудамжны",
    gradient: "from-blue-500 to-indigo-600",
    emoji: "🏠",
    light: "bg-blue-50 text-blue-700",
  },
  IN_PROGRESS: {
    label: "Аврагдаж байна",
    gradient: "from-amber-400 to-yellow-500",
    emoji: "⏳",
    light: "bg-amber-50 text-amber-700",
  },
  SAFE: {
    label: "Аюулгүй",
    gradient: "from-green-400 to-emerald-500",
    emoji: "✅",
    light: "bg-green-50 text-green-700",
  },
};

const conditionConfig: Record<
  string,
  { label: string; bg: string; text: string; emoji: string }
> = {
  HEALTHY: {
    label: "Эрүүл",
    bg: "bg-green-100",
    text: "text-green-700",
    emoji: "💚",
  },
  INJURED: {
    label: "Бэртсэн",
    bg: "bg-red-100",
    text: "text-red-700",
    emoji: "🩹",
  },
  STARVING: {
    label: "Өлссөн/сульдсан",
    bg: "bg-orange-100",
    text: "text-orange-700",
    emoji: "🍖",
  },
};

const Page = () => {
  const params = useParams();
  const postId = params.postId as string;
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id ?? null;
  const { user } = useAuth(clerkId);
  const userId = user?.id;

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editComment, setEditComment] = useState("");
  const [likes, setLikes] = useState<any[]>([]);

  const handleComment = async (postId: string) => {
    if (!comment) return toast.error("Сэтгэгдэл хоосон байж болохгүй");
    const res = await fetch("/api/help-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helpPostId: postId, content: comment, userId }),
    });
    if (res.ok) {
      setComment("");
      await getComments();
    } else {
      const d = await res.json();
      toast.error(d.error);
    }
  };

  const getComments = async () => {
    const res = await fetch("/api/help-comment/get-comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helpPostId: postId }),
    });
    if (res.ok) setComments(await res.json());
  };

  const getLike = async () => {
    const res = await fetch("/api/help-comment/like-dislike", {
      method: "GET",
    });
    if (res.ok) setLikes(await res.json());
  };

  const handleLike = async (commentId: string) => {
    await fetch("/api/help-comment/like-dislike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, commentId, type: "LIKE" }),
    });
    getLike();
  };

  const handleReplyComment = async (postId: string, parentId: string) => {
    if (!replyContent) return toast.error("Хариулт хоосон байж болохгүй");
    await fetch("/api/help-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        helpPostId: postId,
        content: replyContent,
        userId,
        parentCommentId: parentId,
      }),
    });
    setReplyContent("");
    setReplyingTo(null);
    getComments();
  };

  const commentDelete = async (commentId: string) => {
    await fetch("/api/help-comment", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, userId }),
    });
    getComments();
  };

  const commentEdit = async (commentId: string) => {
    const res = await fetch("/api/help-comment", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, userId, content: editComment }),
    });
    if (res.ok) {
      toast.success("Сэтгэгдэл амжилттай өөрчлөгдлөө");
      setEditComment("");
      getComments();
    }
  };

  useEffect(() => {
    getLike();
  }, []);
  useEffect(() => {
    getComments();
  }, [postId]);
  useEffect(() => {
    if (!postId) return;
    (async () => {
      const res = await fetch(`/api/help-animal/location/${postId}`);
      setAnimal(await res.json());
      setLoading(false);
    })();
  }, [postId]);

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg,#fef9f0,#fff7ed,#eff6ff)",
        }}
      >
        <div className="text-center space-y-4">
          <div className="text-7xl animate-bounce">🐾</div>
          <p className="text-amber-600 font-bold text-xl">Уншиж байна...</p>
        </div>
      </div>
    );

  if (!animal)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#fef9f0,#fff7ed)" }}
      >
        <div className="text-center">
          <div className="text-7xl mb-4">😿</div>
          <p className="text-gray-500 font-semibold text-xl">
            Амьтан олдсонгүй
          </p>
        </div>
      </div>
    );

  const st = statusConfig[animal.status] || {
    label: animal.status,
    gradient: "from-gray-400 to-gray-500",
    emoji: "❓",
    light: "bg-gray-50 text-gray-700",
  };
  const cd = conditionConfig[animal.condition] || {
    label: animal.condition,
    bg: "bg-gray-100",
    text: "text-gray-700",
    emoji: "❓",
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg,#fef9f0 0%,#fff7ed 40%,#eff6ff 100%)",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="p-5 lg:p-8 space-y-6 overflow-y-auto">
          <div
            className="rounded-3xl overflow-hidden shadow-xl"
            style={{ background: "linear-gradient(135deg,#1e3a5f,#1e40af)" }}
          >
            <div className="p-6 text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <PawPrint size={24} className="text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  Амьтны мэдээлэл
                </h1>
                <p className="text-blue-200 text-sm">
                  Дэлгэрэнгүй мэдээлэл ба байршил
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-lg border border-amber-100 overflow-hidden">
            <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 p-6">
              <Carousel className="w-full max-w-sm mx-auto">
                <CarouselContent>
                  {animal?.images?.map((img, i) => (
                    <CarouselItem key={i}>
                      <div className="relative h-64 rounded-2xl overflow-hidden shadow-md">
                        <Image
                          src={img}
                          alt="animal"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 bg-white/90 border-amber-200 hover:bg-amber-50" />
                <CarouselNext className="right-2 bg-white/90 border-amber-200 hover:bg-amber-50" />
              </Carousel>

              <div className="flex justify-center mt-4 gap-3">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-md bg-gradient-to-r ${st.gradient}`}
                >
                  {st.emoji} {st.label}
                </span>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold ${cd.bg} ${cd.text}`}
                >
                  {cd.emoji} {cd.label}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 bg-amber-50 rounded-2xl px-4 py-3 border border-amber-100">
                <div className="w-9 h-9 rounded-xl bg-orange-400 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-bold uppercase tracking-wide">
                    Байршил
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {animal.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={15} className="text-blue-500" />
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wide">
                      Нийтэлсэн
                    </p>
                  </div>
                  <p className="font-bold text-gray-800">
                    {animal.user.firstName} {animal.user.lastName}
                  </p>
                </div>

                {animal.phoneNumber && (
                  <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone size={15} className="text-green-500" />
                      <p className="text-xs text-green-500 font-bold uppercase tracking-wide">
                        Утас
                      </p>
                    </div>
                    <p className="font-bold text-gray-800">
                      {animal.phoneNumber}
                    </p>
                  </div>
                )}
              </div>

              <button
                className="w-full py-3.5 rounded-2xl font-extrabold text-blue-900 text-base transition-all cursor-pointer
                shadow-[0_5px_0_#92400e] hover:shadow-[0_7px_0_#92400e] hover:-translate-y-1 active:translate-y-1"
                style={{
                  background: "linear-gradient(135deg,#fbbf24,#f97316)",
                }}
              >
                📞 Холбогдох
              </button>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Тайлбар
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {animal.description}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-lg border border-amber-100 overflow-hidden">
            <div
              className="px-6 py-5 border-b border-amber-100 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg,#fef9f0,#fff7ed)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#fbbf24,#f97316)",
                }}
              >
                <Heart size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-blue-900">Сэтгэгдэл</h2>
              <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                {comments.length}
              </span>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-amber-300 shrink-0">
                  <AvatarImage src={user?.profileImg} />
                  <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="relative flex-1">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleComment(animal.id)
                    }
                    placeholder="Сэтгэгдэл үлдээх..."
                    className="rounded-2xl border-amber-200 focus-visible:ring-amber-300 pr-14 py-5 bg-amber-50/50"
                  />
                  <button
                    onClick={() => handleComment(animal.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{
                      background: "linear-gradient(135deg,#f97316,#fbbf24)",
                    }}
                  >
                    <Send size={15} className="text-white" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {comments.map((c) => {
                  const isOwn = c.user.id === userId;
                  const likeCount = likes.filter(
                    (l: any) => l.commentId === c.id && l.type === "LIKE",
                  ).length;
                  const isLiked = likes.some(
                    (l: any) =>
                      l.userId === userId &&
                      l.commentId === c.id &&
                      l.type === "LIKE",
                  );

                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-amber-100 overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg,#fef9f0,#fff)",
                      }}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              className={`w-9 h-9 border-2 ${isOwn ? "border-amber-400" : "border-blue-200"}`}
                            >
                              <AvatarFallback
                                className={`text-white text-xs font-bold ${isOwn ? "bg-amber-500" : "bg-blue-600"}`}
                              >
                                {c.user.firstName?.[0]}
                                {c.user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">
                                {c.user.firstName} {c.user.lastName}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock size={11} />{" "}
                                {new Date(c.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {isOwn && (
                            <div className="flex gap-1.5">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer">
                                    <MessageCircleX size={15} />
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="rounded-3xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-center text-xl font-black text-gray-800">
                                      Сэтгэгдлийг устгах уу?
                                    </DialogTitle>
                                    <DialogDescription className="text-center text-gray-500">
                                      Та үнэхээр энэ сэтгэгдлийг устгамаар байна
                                      уу?
                                    </DialogDescription>
                                    <div className="flex justify-end gap-3 mt-4">
                                      <DialogClose className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer font-medium">
                                        Үгүй
                                      </DialogClose>
                                      <DialogClose
                                        onClick={() => commentDelete(c.id)}
                                        className="px-4 py-2 rounded-xl text-white font-bold cursor-pointer"
                                        style={{
                                          background:
                                            "linear-gradient(135deg,#f97316,#ef4444)",
                                        }}
                                      >
                                        Устгах
                                      </DialogClose>
                                    </div>
                                  </DialogHeader>
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <button className="w-8 h-8 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-400 hover:text-orange-600 flex items-center justify-center transition-colors cursor-pointer">
                                    <MessageSquareMore size={15} />
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="rounded-3xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-center text-xl font-black text-gray-800">
                                      Сэтгэгдэл өөрчлөх
                                    </DialogTitle>
                                    <div className="space-y-3 mt-3">
                                      <Input
                                        placeholder="Шинэ сэтгэгдэл..."
                                        value={editComment}
                                        onChange={(e) =>
                                          setEditComment(e.target.value)
                                        }
                                        className="rounded-xl border-amber-200 focus-visible:ring-amber-300"
                                      />
                                      <div className="flex justify-end gap-3">
                                        <DialogClose className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer font-medium">
                                          Үгүй
                                        </DialogClose>
                                        <DialogClose
                                          onClick={() => commentEdit(c.id)}
                                          className="px-4 py-2 rounded-xl text-white font-bold cursor-pointer"
                                          style={{
                                            background:
                                              "linear-gradient(135deg,#fbbf24,#f97316)",
                                          }}
                                        >
                                          Өөрчлөх
                                        </DialogClose>
                                      </div>
                                    </div>
                                  </DialogHeader>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </div>

                        <p className="mt-3 text-gray-700 text-sm leading-relaxed">
                          {c.content}
                        </p>

                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => handleLike(c.id)}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer
                              ${isLiked ? "bg-rose-100 text-rose-500" : "bg-gray-100 text-gray-500 hover:bg-rose-50 hover:text-rose-400"}`}
                          >
                            <Heart
                              size={12}
                              className={isLiked ? "fill-rose-500" : ""}
                            />
                            {likeCount > 0 ? likeCount : ""} Таалагдлаа
                          </button>
                          <button
                            onClick={() =>
                              setReplyingTo(replyingTo === c.id ? null : c.id)
                            }
                            className="text-xs font-bold text-blue-500 hover:text-blue-700 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            ↩ Хариулах
                          </button>
                        </div>

                        {/* Replies */}
                        {c.replies.length > 0 && (
                          <div className="ml-8 mt-3 border-l-2 border-amber-200 pl-4 space-y-3">
                            {c.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="bg-white rounded-2xl p-3.5 shadow-sm border border-amber-50"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar
                                      className={`w-7 h-7 border-2 ${reply.user.id === userId ? "border-amber-400" : "border-blue-200"}`}
                                    >
                                      <AvatarFallback
                                        className={`text-white text-xs font-bold ${reply.user.id === userId ? "bg-amber-500" : "bg-blue-600"}`}
                                      >
                                        {reply.user.firstName?.[0]}
                                        {reply.user.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-bold text-gray-700 text-xs">
                                        {reply.user.firstName}{" "}
                                        {reply.user.lastName}
                                      </p>
                                      <p className="text-gray-400 text-[11px]">
                                        {new Date(
                                          reply.createdAt,
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>

                                  {reply.user.id === userId && (
                                    <div className="flex gap-1">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <button className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center cursor-pointer">
                                            <MessageCircleX size={12} />
                                          </button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-3xl">
                                          <DialogHeader>
                                            <DialogTitle className="text-center font-black">
                                              Сэтгэгдлийг устгах уу?
                                            </DialogTitle>
                                            <div className="flex justify-end gap-3 mt-4">
                                              <DialogClose className="px-4 py-2 rounded-xl text-gray-500 cursor-pointer">
                                                Үгүй
                                              </DialogClose>
                                              <DialogClose
                                                onClick={() =>
                                                  commentDelete(reply.id)
                                                }
                                                className="px-4 py-2 rounded-xl text-white font-bold cursor-pointer"
                                                style={{
                                                  background:
                                                    "linear-gradient(135deg,#f97316,#ef4444)",
                                                }}
                                              >
                                                Устгах
                                              </DialogClose>
                                            </div>
                                          </DialogHeader>
                                        </DialogContent>
                                      </Dialog>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <button className="w-6 h-6 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-400 flex items-center justify-center cursor-pointer">
                                            <MessageSquareMore size={12} />
                                          </button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-3xl">
                                          <DialogHeader>
                                            <DialogTitle className="text-center font-black">
                                              Хариулт өөрчлөх
                                            </DialogTitle>
                                            <div className="space-y-3 mt-3">
                                              <Input
                                                placeholder="Шинэ хариулт..."
                                                value={editComment}
                                                onChange={(e) =>
                                                  setEditComment(e.target.value)
                                                }
                                                className="rounded-xl border-amber-200"
                                              />
                                              <div className="flex justify-end gap-3">
                                                <DialogClose className="px-4 py-2 rounded-xl text-gray-500 cursor-pointer">
                                                  Үгүй
                                                </DialogClose>
                                                <DialogClose
                                                  onClick={() =>
                                                    commentEdit(reply.id)
                                                  }
                                                  className="px-4 py-2 rounded-xl text-white font-bold cursor-pointer"
                                                  style={{
                                                    background:
                                                      "linear-gradient(135deg,#fbbf24,#f97316)",
                                                  }}
                                                >
                                                  Өөрчлөх
                                                </DialogClose>
                                              </div>
                                            </div>
                                          </DialogHeader>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  )}
                                </div>
                                <p className="mt-2 text-gray-600 text-sm">
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {replyingTo === c.id && (
                          <div className="ml-8 mt-3 relative">
                            <Input
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                handleReplyComment(animal.id, c.id)
                              }
                              placeholder="Хариу бичих..."
                              className="rounded-2xl border-blue-200 focus-visible:ring-blue-300 pr-12 bg-blue-50/50"
                            />
                            <button
                              onClick={() =>
                                handleReplyComment(animal.id, c.id)
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer"
                              style={{
                                background:
                                  "linear-gradient(135deg,#3b82f6,#6366f1)",
                              }}
                            >
                              <Send size={13} className="text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {comments.length === 0 && (
                  <div className="text-center py-10">
                    <div className="text-5xl mb-3">💬</div>
                    <p className="text-gray-400 font-medium">
                      Сэтгэгдэл байхгүй байна. Эхний сэтгэгдлийг үлдээгээрэй!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="sticky top-0 h-screen">
            <div
              className="absolute top-0 left-0 right-0 z-10 px-5 py-4 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(30,58,95,0.85), transparent)",
              }}
            >
              <div className="flex items-center gap-2 text-white">
                <MapPin size={18} className="text-amber-300" />
                <span className="font-bold text-sm">{animal.location}</span>
                <span
                  className={`ml-auto px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${st.gradient}`}
                >
                  {st.emoji} {st.label}
                </span>
              </div>
            </div>
            <AnimalMap
              lat={animal.lat}
              lng={animal.lng}
              location={animal.location}
            />
          </div>
        </div>

        <div className="lg:hidden px-5 pb-8">
          <div className="rounded-3xl overflow-hidden shadow-lg border-2 border-amber-100 h-64">
            <AnimalMap
              lat={animal.lat}
              lng={animal.lng}
              location={animal.location}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
