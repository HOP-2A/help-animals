"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Ellipsis,
  Pen,
  Trash,
  ImageIcon,
  PawPrint,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/providers/useAuth";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type ImageItem = { file: File | null; url: string };
type User = {
  id: string;
  profileImg: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  createdAt: string;
};
type Post = {
  id: string;
  images: string[];
  description: string;
  user: User;
  createdAt: string;
  userId: string;
  reactions: Reaction[];
  comments: Comment[];
};
type Reaction = {
  id: string;
  type: string;
  userId: string;
  user: User;
};
type Comment = {
  content: string;
  id: string;
  userId: string;
  experienceId: string;
  user: User;
  reactions: Reaction[];
};

export default function Page() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id;
  const { user } = useAuth(clerkId ?? "");
  const USER_ID = user?.id;

  const myAvatar = clerkUser?.imageUrl;
  const myInitial = clerkUser?.firstName?.[0]?.toUpperCase() ?? "?";
  const myName = clerkUser?.firstName ?? "";

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [reply, setReply] = useState<Comment[]>([]);
  const [newDescription, setNewDescription] = useState("");
  const [newComment, setNewComment] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [editImages, setEditImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState<{
    [key: string]: boolean;
  }>({});
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const router = useRouter();

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setImages((prev) => [
      ...prev,
      ...Array.from(files).map((f) => ({ file: f, url: "" })),
    ]);
  };

  const handleEditFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setEditImages((prev) => [
      ...prev,
      ...Array.from(files).map((f) => ({ file: f, url: "" })),
    ]);
  };

  const uploadImages = async (imgs: ImageItem[], setState: Function) => {
    setUploading(true);
    try {
      const updated = await Promise.all(
        imgs.map(async (img) => {
          if (img.url && !img.file) return img;
          const uploaded = await upload(img.file!.name, img.file!, {
            access: "public",
            handleUploadUrl: "/api/upload",
          });
          return { ...img, url: uploaded.url, file: null };
        }),
      );
      setState(updated);
      return updated;
    } catch {
      toast.error("Зураг оруулахад алдаа гарлаа");
      return imgs;
    } finally {
      setUploading(false);
    }
  };

  const getExperiences = async () => {
    try {
      const res = await fetch("/api/experience-exchange/get-all");
      const data = await res.json();
      setPosts(data);
    } catch {
      toast.error("Постууд ачаалахад алдаа гарлаа");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    getExperiences();
  }, []);

  const getComment = async (experienceId: string) => {
    setLoadingComments(true);
    try {
      const res = await fetch("/api/experience-exchange/comment/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experienceId }),
      });
      const data = await res.json();
      setComments(data);
    } finally {
      setLoadingComments(false);
    }
  };

  const getReply = async (parentCommentId: string) => {
    setLoadingReplies((prev) => ({ ...prev, [parentCommentId]: true }));
    try {
      const res = await fetch("/api/experience-exchange/comment/get-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentCommentId }),
      });
      const data = await res.json();
      setReply(data);
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [parentCommentId]: false }));
    }
  };

  // ── Write actions — all guarded with !USER_ID ────────────────────────────────
  const createExperience = async () => {
    if (!description.trim() || !USER_ID) return;
    const uploaded = await uploadImages(images, setImages);
    const res = await fetch("/api/experience-exchange/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        description,
        images: uploaded.map((img) => img.url),
      }),
    });
    if (res.ok) {
      toast.success("Амжилттай нийтлэгдлээ!");
      setDescription("");
      setImages([]);
      setIsDialogOpen(false);
      getExperiences();
    }
  };

  const editPost = async (id: string) => {
    if (!USER_ID) return;
    const uploaded = await uploadImages(editImages, setEditImages);
    const res = await fetch("/api/experience-exchange/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: newDescription,
        id,
        images: uploaded.map((img) => img.url),
      }),
    });
    if (res.ok) {
      toast.success("Пост шинэчлэгдлээ");
      setEditingPost(null);
      setEditImages([]);
      getExperiences();
    }
  };

  const deletePost = async (id: string) => {
    if (!USER_ID) return;
    const res = await fetch("/api/experience-exchange/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, userId: USER_ID }),
    });
    if (res.ok) {
      toast.success("Пост устгагдлаа");
      getExperiences();
    }
  };

  const reaction = async (experienceId: string) => {
    if (!USER_ID) return;
    await fetch("/api/experience-exchange/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: USER_ID, experienceId, type: "LIKE" }),
    });
    getExperiences();
  };

  const comment = async (experienceId: string) => {
    if (!content.trim() || !USER_ID) return;
    setSubmittingComment(true);
    try {
      const res = await fetch("/api/experience-exchange/comment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, content, experienceId }),
      });
      if (res.ok) {
        setContent("");
        await getComment(experienceId);
        getExperiences();
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const replyComment = async (parentCommentId: string) => {
    if (!replyContent.trim() || !USER_ID) return;
    setSubmittingReply(true);
    try {
      const res = await fetch("/api/experience-exchange/comment/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: USER_ID,
          content: replyContent,
          parentCommentId,
        }),
      });
      if (res.ok) {
        setReplyContent("");
        await getReply(parentCommentId);
        getExperiences();
      }
    } finally {
      setSubmittingReply(false);
    }
  };

  const likeComment = async (commentId: string, experienceId: string) => {
    if (!USER_ID) return;
    await fetch("/api/experience-exchange/comment/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: USER_ID, commentId, type: "LIKE" }),
    });
    getComment(experienceId);
  };

  const handleEditComment = async (experienceId: string) => {
    if (!newComment.trim() || !editingComment || !USER_ID) return;
    const res = await fetch("/api/experience-exchange/comment/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment, id: editingComment.id }),
    });
    if (res.ok) {
      toast.success("Сэтгэгдэл засагдлаа");
      setEditingComment(null);
      getComment(experienceId);
      getExperiences();
    }
  };

  const deleteComment = async (id: string, expId: string) => {
    if (!USER_ID) return;
    const res = await fetch("/api/experience-exchange/comment/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, userId: USER_ID }),
    });
    if (res.ok) {
      toast.success("Сэтгэгдэл устлаа");
      getComment(expId);
      getExperiences();
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#4a3f35]">
      <button
        onClick={() => router.push("/AI-Chat")}
        className="flex items-center gap-2 text-green-700 font-medium cursor-pointer bg-green-100 hover:bg-green-200 transition-colors justify-center w-full text-center h-9"
      >
        <Sparkles className="w-4 h-4 text-green-600" />
        AI-аас асуух
      </button>

      <div className="max-w-2xl mx-auto p-4 py-8">
        <header className="flex items-center gap-3 mb-8">
          <div className="bg-orange-400 p-2 rounded-2xl shadow-sm">
            <PawPrint className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Туршлага Солилцоо
          </h1>
        </header>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full bg-white p-4 rounded-2xl border-2 border-orange-100 mb-8 text-left shadow-sm hover:border-orange-300 hover:shadow-md transition-all flex items-center gap-3 group">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage src={myAvatar} />
                <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                  {myInitial}
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-400 group-hover:text-gray-500 transition-colors flex-1">
                {myName
                  ? `${myName}, юу бодож байна вэ?`
                  : "Юу бодож байна вэ?"}
              </span>
              <div className="flex items-center gap-1.5 text-orange-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <Pen className="w-4 h-4" />
                Бичих
              </div>
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Нийтлэл оруулах
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-start gap-3 mb-2">
              <Avatar className="w-10 h-10 shrink-0 mt-1">
                <AvatarImage src={myAvatar} />
                <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                  {myInitial}
                </AvatarFallback>
              </Avatar>
              <textarea
                placeholder="Сэтгэгдэлээ энд бичээрэй..."
                className="flex-1 min-h-[100px] p-3 rounded-xl border-orange-100 focus:ring-2 focus:ring-orange-300 border-2 outline-none resize-none text-gray-700"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 space-y-3">
              <label className="flex items-center gap-2 font-medium text-orange-700 cursor-pointer hover:text-orange-800 transition-colors">
                <ImageIcon className="w-5 h-5" />
                Зураг нэмэх
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleFile}
                />
              </label>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={
                          img.url ||
                          (img.file ? URL.createObjectURL(img.file) : "")
                        }
                        className="rounded-xl object-cover h-24 w-full shadow-sm"
                        alt={`Upload ${idx + 1}`}
                      />
                      <button
                        onClick={() =>
                          setImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full shadow-md p-1 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={createExperience}
              className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl h-12 text-base font-bold"
              disabled={uploading || !description.trim() || !USER_ID}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Түр хүлээнэ үү...
                </>
              ) : (
                "Нийтлэх"
              )}
            </Button>
          </DialogContent>
        </Dialog>

        <div className="space-y-5">
          {loadingPosts ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
              <p className="text-gray-500">Постууд ачааллаж байна...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-white rounded-3xl border-2 border-dashed border-orange-200">
              <PawPrint className="w-16 h-16 text-orange-200" />
              <p className="text-gray-500 text-lg font-medium">
                Одоогоор пост байхгүй байна
              </p>
              <p className="text-gray-400 text-sm">
                Эхний пост байхыг хүсч байна уу?
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-[2rem] border border-orange-50 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="flex justify-between items-start p-5 pb-3">
                  <Link
                    href={`/experiences/${post.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar className="w-11 h-11 ring-2 ring-transparent group-hover:ring-orange-200 transition-all">
                      <AvatarImage
                        src={post.user.profileImg}
                        alt="profilepic"
                      />
                      <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                        {post.user.firstName?.[0]?.toUpperCase()}
                        {post.user.lastName?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                        {post.user.firstName} {post.user.lastName}
                      </h3>
                      <p className="text-xs text-gray-400">{post.createdAt}</p>
                    </div>
                  </Link>
                  {USER_ID && USER_ID === post.userId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                        <Ellipsis className="w-5 h-5 text-gray-400" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => {
                            setEditingPost(post);
                            setNewDescription(post.description);
                            setEditImages(
                              post.images.map((url) => ({ file: null, url })),
                            );
                          }}
                        >
                          <Pen className="w-4 h-4" /> Засах
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-red-500 focus:text-red-500"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash className="w-4 h-4" /> Устгах
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <Link
                  href={`/experiences/${post.id}`}
                  className="block px-5 pb-4"
                >
                  <p className="leading-relaxed text-gray-700 hover:text-gray-900 transition-colors line-clamp-4">
                    {post.description}
                  </p>
                </Link>

                {post.images?.length > 0 && (
                  <div className="border-y border-orange-50 mb-0">
                    <Carousel>
                      <CarouselContent>
                        {post.images.map((image, index) => (
                          <CarouselItem key={index}>
                            <img
                              src={image}
                              className="w-full h-auto object-cover max-h-[380px]"
                              alt={`Pet ${index}`}
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {post.images.length > 1 && (
                        <>
                          <CarouselPrevious className="left-3" />
                          <CarouselNext className="right-3" />
                        </>
                      )}
                    </Carousel>
                  </div>
                )}

                <div className="flex items-center gap-1 px-4 py-3 border-t border-orange-50">
                  <button
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                      post.reactions?.some((r) => r.userId === USER_ID)
                        ? "text-red-500 bg-red-50"
                        : "text-gray-500 hover:bg-red-50 hover:text-red-500"
                    }`}
                    onClick={() => reaction(post.id)}
                    disabled={!USER_ID}
                  >
                    <Heart
                      className={`w-4.5 h-4.5 w-5 h-5 ${
                        post.reactions?.some((r) => r.userId === USER_ID)
                          ? "fill-red-500"
                          : ""
                      }`}
                    />
                    <span>{post.reactions?.length || 0}</span>
                  </button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          getComment(post.id);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-gray-500 hover:bg-green-50 hover:text-green-600 transition-all text-sm font-medium"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-3xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
                      <DialogHeader className="px-5 pt-5 pb-3 border-b border-orange-50">
                        <DialogTitle className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-orange-400" />
                          Сэтгэгдэлүүд
                        </DialogTitle>
                      </DialogHeader>

                      <div className="flex gap-2 px-4 py-3 border-b border-orange-50 bg-orange-50/30">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage src={myAvatar} />
                          <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                            {myInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                          <Input
                            placeholder={
                              USER_ID
                                ? "Сэтгэгдэл бичих..."
                                : "Нэвтэрч орно уу..."
                            }
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={!USER_ID}
                            className="rounded-xl border-orange-100 bg-white h-9 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                comment(post.id);
                              }
                            }}
                          />
                          <Button
                            onClick={() => comment(post.id)}
                            className="bg-orange-500 rounded-xl hover:bg-orange-600 h-9 px-3"
                            disabled={
                              submittingComment || !content.trim() || !USER_ID
                            }
                          >
                            {submittingComment ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              "Илгээх"
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3 overflow-y-auto px-4 py-3 flex-1">
                        {loadingComments ? (
                          <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                          </div>
                        ) : comments.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <MessageCircle className="w-12 h-12 mb-2 opacity-20" />
                            <p className="text-sm font-medium">
                              Одоогоор сэтгэгдэл байхгүй байна
                            </p>
                          </div>
                        ) : (
                          comments.map((c) => (
                            <div key={c.id} className="space-y-2">
                              <div className="group flex gap-2.5">
                                <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                                  <AvatarImage src={c.user?.profileImg} />
                                  <AvatarFallback className="bg-orange-200 text-orange-700 text-xs">
                                    {c.user?.firstName?.[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  {editingComment?.id === c.id ? (
                                    <div className="space-y-2">
                                      <Input
                                        value={newComment}
                                        onChange={(e) =>
                                          setNewComment(e.target.value)
                                        }
                                        className="bg-orange-50 rounded-xl text-sm"
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleEditComment(post.id)
                                          }
                                          className="bg-green-600 rounded-lg text-xs h-7"
                                        >
                                          Хадгалах
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            setEditingComment(null)
                                          }
                                          className="rounded-lg text-xs h-7"
                                        >
                                          Цуцлах
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="bg-orange-50/70 rounded-2xl rounded-tl-sm px-3 py-2 relative">
                                        <div className="flex justify-between items-center mb-0.5">
                                          <span className="font-bold text-xs text-orange-800">
                                            {c.user?.firstName}
                                          </span>
                                          {USER_ID && USER_ID === c.userId && (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Ellipsis className="w-3.5 h-3.5 text-gray-400" />
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent className="rounded-xl">
                                                <DropdownMenuItem
                                                  onClick={() => {
                                                    setEditingComment(c);
                                                    setNewComment(c.content);
                                                  }}
                                                >
                                                  Засах
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                  onClick={() =>
                                                    deleteComment(c.id, post.id)
                                                  }
                                                  className="text-red-500 focus:text-red-500"
                                                >
                                                  Устгах
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-700">
                                          {c.content}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-3 mt-1 ml-2 text-xs">
                                        <button
                                          onClick={() =>
                                            likeComment(c.id, post.id)
                                          }
                                          disabled={!USER_ID}
                                          className={`flex items-center gap-1 font-medium transition-all disabled:opacity-40 ${
                                            c.reactions?.some(
                                              (r) => r.userId === USER_ID,
                                            )
                                              ? "text-red-500"
                                              : "text-gray-400 hover:text-red-400"
                                          }`}
                                        >
                                          <Heart
                                            className={`w-3.5 h-3.5 ${c.reactions?.some((r) => r.userId === USER_ID) ? "fill-red-500" : ""}`}
                                          />
                                          {c.reactions?.length || 0}
                                        </button>
                                        <button
                                          disabled={!USER_ID}
                                          onClick={() => {
                                            if (replyingTo === c.id) {
                                              setReplyingTo(null);
                                              setReply([]);
                                            } else {
                                              setReplyingTo(c.id);
                                              getReply(c.id);
                                            }
                                          }}
                                          className="text-gray-400 hover:text-blue-500 font-medium transition-colors disabled:opacity-40"
                                        >
                                          Хариулах
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              {replyingTo === c.id && (
                                <div className="ml-10 space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      value={replyContent}
                                      onChange={(e) =>
                                        setReplyContent(e.target.value)
                                      }
                                      className="bg-white rounded-xl text-sm h-9 border-orange-100"
                                      placeholder="Хариулт бичих..."
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          replyComment(c.id);
                                        }
                                      }}
                                    />
                                    <Button
                                      onClick={() => replyComment(c.id)}
                                      className="bg-orange-500 rounded-xl hover:bg-orange-600 h-9 px-3"
                                      size="sm"
                                      disabled={
                                        submittingReply ||
                                        !replyContent.trim() ||
                                        !USER_ID
                                      }
                                    >
                                      {submittingReply ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        "Илгээх"
                                      )}
                                    </Button>
                                  </div>

                                  {loadingReplies[c.id] ? (
                                    <div className="flex items-center justify-center py-3">
                                      <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                                    </div>
                                  ) : reply.length > 0 ? (
                                    <div className="space-y-1.5">
                                      {reply.map((r) => (
                                        <div key={r.id} className="flex gap-2">
                                          <Avatar className="w-6 h-6 shrink-0 mt-0.5">
                                            <AvatarImage
                                              src={r.user?.profileImg}
                                            />
                                            <AvatarFallback className="bg-orange-200 text-orange-700 text-[10px]">
                                              {r.user?.firstName?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1 bg-white rounded-xl border border-orange-100 px-3 py-1.5">
                                            <div className="flex justify-between items-center mb-0.5">
                                              <span className="font-semibold text-orange-700 text-xs">
                                                {r.user?.firstName}
                                              </span>
                                              <button
                                                onClick={() =>
                                                  likeComment(r.id, post.id)
                                                }
                                                disabled={!USER_ID}
                                                className={`flex items-center gap-0.5 text-xs transition-colors disabled:opacity-40 ${
                                                  r.reactions?.some(
                                                    (rx) =>
                                                      rx.userId === USER_ID,
                                                  )
                                                    ? "text-red-500"
                                                    : "text-gray-400 hover:text-red-400"
                                                }`}
                                              >
                                                <Heart
                                                  className={`w-3 h-3 ${r.reactions?.some((rx) => rx.userId === USER_ID) ? "fill-red-500" : ""}`}
                                                />
                                                {r.reactions?.length || 0}
                                              </button>
                                            </div>
                                            <p className="text-xs text-gray-700">
                                              {r.content}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Link
                    href={`/experiences/${post.id}`}
                    className="ml-auto text-xs text-gray-400 hover:text-orange-500 transition-colors px-3 py-2 rounded-xl hover:bg-orange-50"
                  >
                    Дэлгэрэнгүй →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
          <DialogContent className="rounded-3xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Пост засах
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-start gap-3">
              <Avatar className="w-9 h-9 shrink-0 mt-1">
                <AvatarImage src={myAvatar} />
                <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                  {myInitial}
                </AvatarFallback>
              </Avatar>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="flex-1 min-h-[100px] p-3 rounded-xl border-orange-100 focus:ring-2 focus:ring-orange-300 border-2 outline-none resize-none text-gray-700"
                placeholder="Сэтгэгдэлээ энд бичээрэй..."
              />
            </div>
            {editImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {editImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={
                        img.url ||
                        (img.file ? URL.createObjectURL(img.file) : "")
                      }
                      className="rounded-xl h-24 w-full object-cover"
                      alt={`Edit ${idx + 1}`}
                    />
                    <button
                      onClick={() =>
                        setEditImages((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                      className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full shadow-md p-1 hover:bg-red-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 font-medium text-orange-700 cursor-pointer bg-orange-50 p-3 rounded-xl hover:bg-orange-100 transition-colors">
                <ImageIcon className="w-5 h-5" />
                Зураг нэмэх
                <input
                  type="file"
                  hidden
                  onChange={handleEditFile}
                  multiple
                  accept="image/*"
                />
              </label>
              <Button
                onClick={() => editPost(editingPost!.id)}
                className="bg-orange-500 rounded-xl hover:bg-orange-600 h-11"
                disabled={uploading || !newDescription.trim() || !USER_ID}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Түр хүлээнэ үү...
                  </>
                ) : (
                  "Өөрчлөлтийг хадгалах"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
