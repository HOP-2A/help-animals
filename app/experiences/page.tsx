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
import HeadBar from "../_components/headbar";

type ImageItem = { file: File | null; url: string };
type User = {
  id: string;
  profileImg: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  createdAt: string;
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
  const { push } = useRouter();

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

  const [loading, setLoading] = useState(false);

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

  const uploadImages = async (
    imgs: ImageItem[],
    setState: React.Dispatch<React.SetStateAction<ImageItem[]>>,
  ) => {
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

  console.log(USER_ID);

  const handleContact = async (postOwnerId: string) => {
    if (!USER_ID) {
      router.push("/sign-up");
      return;
    }

    if (postOwnerId === USER_ID) {
      push(`/profile/${USER_ID}`);
      return;
    } else if (postOwnerId !== USER_ID) {
      try {
        const res = await fetch("/api/conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postOwnerId, userId: USER_ID }),
        });

        const data = await res.json();
        router.push(`/chat/${data.id}`);
      } catch (err) {
        console.error(err);
      }
    }
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 text-[#4a3f35] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-10 left-10 transform rotate-12">
          <PawPrint className="w-24 h-24" />
        </div>
        <div className="absolute top-40 right-20 transform -rotate-45">
          <PawPrint className="w-32 h-32" />
        </div>
        <div className="absolute bottom-32 left-1/4 transform rotate-90">
          <PawPrint className="w-28 h-28" />
        </div>
        <div className="absolute bottom-20 right-1/3 transform -rotate-12">
          <PawPrint className="w-20 h-20" />
        </div>
        <div className="absolute top-1/2 left-10 transform rotate-45">
          <PawPrint className="w-16 h-16" />
        </div>
        <div className="absolute top-1/3 right-10 transform -rotate-90">
          <PawPrint className="w-24 h-24" />
        </div>
      </div>
      <HeadBar />
      <button
        onClick={() => router.push("/AI-Chat")}
        className="flex items-center gap-2 text-green-700 font-semibold cursor-pointer bg-linear-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 transition-all justify-center w-full text-center h-12 shadow-sm relative z-10"
      >
        <Sparkles className="w-5 h-5 text-green-600" />
        🐾 AI Туслагчаас асуух
      </button>

      <div className="max-w-2xl mx-auto p-4 py-8 relative z-10">
        <header className="mb-8 bg-linear-to-r from-orange-400 via-amber-400 to-yellow-400 rounded-[2rem] p-6 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-md transform hover:scale-110 transition-transform">
              <PawPrint className="text-orange-500 w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
                🐾 Туршлага Солилцох Булан
              </h1>
              <p className="text-white/90 text-sm mt-1 font-medium">
                Амьтдын тухай өөрийн туршлагаа хуваалцаарай
              </p>
            </div>
          </div>
        </header>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full bg-white p-5 rounded-3xl border-2 border-orange-200 mb-8 text-left shadow-md hover:border-orange-400 hover:shadow-xl transition-all flex items-center gap-4 group relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-r from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Avatar className="w-12 h-12 shrink-0 ring-2 ring-orange-100 group-hover:ring-orange-300 transition-all relative z-10">
                <AvatarImage src={user?.profileImg} />
                <AvatarFallback className="bg-linear-to-br from-orange-400 to-amber-400 text-white font-bold text-lg">
                  {myInitial}
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-400 group-hover:text-gray-600 transition-colors flex-1 font-medium relative z-10">
                {myName
                  ? `${myName}, юу бодож байна вэ? 🐶`
                  : "Юу бодож байна вэ? 🐱"}
              </span>
              <div className="flex items-center gap-2 text-orange-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all relative z-10">
                <Pen className="w-5 h-5" />
                Бичих
              </div>
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-none shadow-2xl bg-linear-to-br from-white to-orange-50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <PawPrint className="w-6 h-6 text-orange-500" />
                Нийтлэл оруулах
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-start gap-3 mb-2">
              <Avatar className="w-10 h-10 shrink-0 mt-1 ring-2 ring-orange-200">
                <AvatarImage src={user?.profileImg} />
                <AvatarFallback className="bg-linear-to-br from-orange-400 to-amber-400 text-white font-bold">
                  {myInitial}
                </AvatarFallback>
              </Avatar>
              <textarea
                placeholder="Сэтгэгдэлээ энд бичээрэй... 🐾"
                className="flex-1 min-h-25 p-4 rounded-2xl border-2 border-orange-100 focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none resize-none text-gray-700 bg-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-2xl p-4 space-y-3 border-2 border-orange-100">
              <label className="flex items-center gap-2 font-semibold text-orange-700 cursor-pointer hover:text-orange-800 transition-colors">
                <ImageIcon className="w-5 h-5" />
                📷 Зураг нэмэх
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
                        className="rounded-xl object-cover h-24 w-full shadow-md border-2 border-orange-100"
                        alt={`Upload ${idx + 1}`}
                      />
                      <button
                        onClick={() =>
                          setImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full shadow-lg p-1.5 hover:bg-red-50 border-2 border-white"
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
              className="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-2xl h-12 text-base font-bold shadow-md"
              disabled={uploading || !description.trim() || !USER_ID}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Түр хүлээнэ үү...
                </>
              ) : (
                <>
                  <PawPrint className="w-5 h-5 mr-2" />
                  Нийтлэх
                </>
              )}
            </Button>
          </DialogContent>
        </Dialog>

        <div className="space-y-6">
          {loadingPosts ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-orange-400 animate-spin" />
                <PawPrint className="w-6 h-6 text-orange-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-gray-500 font-medium">
                Постууд ачааллаж байна...
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white rounded-3xl border-2 border-dashed border-orange-200 shadow-lg">
              <div className="bg-linear-to-br from-orange-100 to-amber-100 p-6 rounded-full">
                <PawPrint className="w-20 h-20 text-orange-400" />
              </div>
              <p className="text-gray-600 text-xl font-bold">
                Одоогоор пост байхгүй байна 🐾
              </p>
              <p className="text-gray-400 text-sm">
                Эхний пост байхыг хүсч байна уу?
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-[2rem] border-2 border-orange-100 shadow-lg hover:shadow-2xl transition-all overflow-hidden hover:scale-[1.01] duration-300"
              >
                <div className="flex justify-between items-start p-6 pb-3">
                  <div
                    onClick={() => handleContact(post.user.id)}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar className="w-12 h-12 ring-2 ring-orange-100 group-hover:ring-orange-300 transition-all">
                      <AvatarImage
                        src={post.user.profileImg}
                        alt="profilepic"
                      />
                      <AvatarFallback className="bg-linear-to-br from-orange-400 to-amber-400 text-white font-bold">
                        {post.user.firstName?.[0]?.toUpperCase()}
                        {post.user.lastName?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3
                        className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors flex items-center gap-1"
                        onClick={() => handleContact(post.userId)}
                      >
                        {post.user.firstName} {post.user.lastName}
                        <PawPrint className="w-3 h-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-xs text-gray-400 font-medium">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {USER_ID && USER_ID === post.userId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-orange-50 rounded-full transition-colors">
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
                  className="block px-6 pb-4"
                >
                  <p className="leading-relaxed text-gray-700 hover:text-gray-900 transition-colors line-clamp-4">
                    {post.description}
                  </p>
                </Link>

                {post.images?.length > 0 && (
                  <div className="border-y-2 border-orange-100 mb-0">
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
                          <CarouselPrevious className="left-3 bg-white/90 hover:bg-white" />
                          <CarouselNext className="right-3 bg-white/90 hover:bg-white" />
                        </>
                      )}
                    </Carousel>
                  </div>
                )}

                <div className="flex items-center gap-2 px-5 py-4 border-t-2 border-orange-100 bg-linear-to-r from-orange-50/30 to-amber-50/30">
                  <button
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all text-sm font-bold shadow-sm ${
                      post.reactions?.some((r) => r.userId === USER_ID)
                        ? "text-red-500 bg-red-50 border-2 border-red-200"
                        : "text-gray-500 hover:bg-red-50 hover:text-red-500 border-2 border-transparent hover:border-red-200"
                    }`}
                    onClick={() => reaction(post.id)}
                    disabled={!USER_ID}
                  >
                    <Heart
                      className={`w-5 h-5 ${
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
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-gray-500 hover:bg-green-50 hover:text-green-600 transition-all text-sm font-bold border-2 border-transparent hover:border-green-200 shadow-sm"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-3xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden border-2 border-orange-200">
                      <DialogHeader className="px-6 pt-6 pb-4 border-b-2 border-orange-100 bg-linear-to-r from-orange-50 to-amber-50">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                          <MessageCircle className="w-6 h-6 text-orange-500" />
                          Сэтгэгдэлүүд
                        </DialogTitle>
                      </DialogHeader>

                      <div className="flex gap-2 px-5 py-4 border-b-2 border-orange-100 bg-linear-to-r from-orange-50/50 to-amber-50/50">
                        <Avatar className="w-9 h-9 shrink-0 ring-2 ring-orange-200">
                          <AvatarImage src={user?.profileImg} />
                          <AvatarFallback className="bg-linear-to-br from-orange-400 to-amber-400 text-white text-sm font-bold">
                            {myInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                          <Input
                            placeholder={
                              USER_ID
                                ? "Сэтгэгдэл бичих... 🐾"
                                : "Нэвтэрч орно уу..."
                            }
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={!USER_ID}
                            className="rounded-2xl border-2 border-orange-200 bg-white h-10 text-sm focus:ring-2 focus:ring-orange-300"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                comment(post.id);
                              }
                            }}
                          />
                          <Button
                            onClick={() => comment(post.id)}
                            className="bg-linear-to-r from-orange-500 to-amber-500 rounded-2xl hover:from-orange-600 hover:to-amber-600 h-10 px-4 font-bold shadow-md"
                            disabled={
                              submittingComment || !content.trim() || !USER_ID
                            }
                          >
                            {submittingComment ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Илгээх"
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3 overflow-y-auto px-5 py-4 flex-1">
                        {loadingComments ? (
                          <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                          </div>
                        ) : comments.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <div className="bg-orange-50 p-4 rounded-full mb-3">
                              <MessageCircle className="w-12 h-12 text-orange-300" />
                            </div>
                            <p className="text-sm font-bold">
                              Одоогоор сэтгэгдэл байхгүй байна 🐾
                            </p>
                          </div>
                        ) : (
                          comments.map((c) => (
                            <div key={c.id} className="space-y-2">
                              <div className="group flex gap-2.5">
                                <Avatar className="w-9 h-9 shrink-0 mt-0.5 ring-2 ring-orange-100">
                                  <AvatarImage src={c.user?.profileImg} />
                                  <AvatarFallback className="bg-linear-to-br from-orange-300 to-amber-300 text-white text-xs font-bold">
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
                                        className="bg-orange-50 rounded-xl text-sm border-2 border-orange-200"
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
                                      <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-2xl rounded-tl-sm px-3 py-2 relative border border-orange-100">
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
                                          className={`flex items-center gap-1 font-bold transition-all disabled:opacity-40 ${
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
                                          className="text-gray-400 hover:text-blue-500 font-bold transition-colors disabled:opacity-40"
                                        >
                                          Хариулах
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              {replyingTo === c.id && (
                                <div className="ml-11 space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      value={replyContent}
                                      onChange={(e) =>
                                        setReplyContent(e.target.value)
                                      }
                                      className="bg-white rounded-2xl text-sm h-10 border-2 border-orange-200"
                                      placeholder="Хариулт бичих... 🐾"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          replyComment(c.id);
                                        }
                                      }}
                                    />
                                    <Button
                                      onClick={() => replyComment(c.id)}
                                      className="bg-linear-to-r from-orange-500 to-amber-500 rounded-2xl hover:from-orange-600 hover:to-amber-600 h-10 px-4 font-bold"
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
                                    <div className="space-y-2">
                                      {reply.map((r) => (
                                        <div key={r.id} className="flex gap-2">
                                          <Avatar className="w-7 h-7 shrink-0 mt-0.5 ring-2 ring-orange-100">
                                            <AvatarImage
                                              src={r.user?.profileImg}
                                            />
                                            <AvatarFallback className="bg-linear-to-br from-orange-300 to-amber-300 text-white text-[10px] font-bold">
                                              {r.user?.firstName?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1 bg-white rounded-2xl border-2 border-orange-100 px-3 py-2">
                                            <div className="flex justify-between items-center mb-0.5">
                                              <span className="font-bold text-orange-700 text-xs">
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
                    className="ml-auto text-sm text-gray-500 hover:text-orange-600 transition-colors px-4 py-2 rounded-2xl hover:bg-orange-50 font-bold border-2 border-transparent hover:border-orange-200"
                  >
                    Дэлгэрэнгүй →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Post Dialog - Enhanced */}
        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
          <DialogContent className="rounded-3xl shadow-2xl bg-linear-to-br from-white to-orange-50 border-2 border-orange-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Pen className="w-5 h-5 text-orange-500" />
                Пост засах
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10 shrink-0 mt-1 ring-2 ring-orange-200">
                <AvatarImage src={myAvatar} />
                <AvatarFallback className="bg-linear-to-br from-orange-400 to-amber-400 text-white text-sm font-bold">
                  {myInitial}
                </AvatarFallback>
              </Avatar>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="flex-1 min-h-25 p-4 rounded-2xl border-2 border-orange-200 focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none resize-none text-gray-700 bg-white"
                placeholder="Сэтгэгдэлээ энд бичээрэй... 🐾"
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
                      className="rounded-xl h-24 w-full object-cover border-2 border-orange-100"
                      alt={`Edit ${idx + 1}`}
                    />
                    <button
                      onClick={() =>
                        setEditImages((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                      className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full shadow-lg p-1.5 hover:bg-red-50 border-2 border-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 font-bold text-orange-700 cursor-pointer bg-linear-to-r from-orange-50 to-amber-50 p-4 rounded-2xl hover:from-orange-100 hover:to-amber-100 transition-all border-2 border-orange-100">
                <ImageIcon className="w-5 h-5" />
                📷 Зураг нэмэх
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
                className="bg-linear-to-r from-orange-500 to-amber-500 rounded-2xl hover:from-orange-600 hover:to-amber-600 h-12 font-bold shadow-md"
                disabled={uploading || !newDescription.trim() || !USER_ID}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Түр хүлээнэ үү...
                  </>
                ) : (
                  <>
                    <PawPrint className="w-5 h-5 mr-2" />
                    Өөрчлөлтийг хадгалах
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
