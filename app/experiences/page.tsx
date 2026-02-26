"use client";

import { useState, useEffect, ChangeEvent } from "react";
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
  reactions: Reaction;
  comments: Comment;
};
type Reaction = {
  id: string;
  type: string;
  userId: string;
  user: User;
  comments: Comment;
};
type Comment = {
  content: string;
  id: string;
  userId: string;
  experienceId: string;
  user: User;
  reactions: Reaction;
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

  const USER_ID = user?.id;
  console.log(USER_ID);
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImgs = Array.from(files).map((file) => ({ file, url: "" }));
    setImages((prev) => [...prev, ...newImgs]);
  };

  const handleEditFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImgs = Array.from(files).map((file) => ({ file, url: "" }));
    setEditImages((prev) => [...prev, ...newImgs]);
  };

  const uploadImages = async (imgs: ImageItem[], setState: Function) => {
    setUploading(true);
    try {
      const updatedImages = await Promise.all(
        imgs.map(async (img) => {
          if (img.url && !img.file) return img;
          const uploaded = await upload(img.file!.name, img.file!, {
            access: "public",
            handleUploadUrl: "/api/upload",
          });
          return { ...img, url: uploaded.url, file: null };
        }),
      );
      setState(updatedImages);
      return updatedImages;
    } catch (error) {
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
    } catch (error) {
      toast.error("Постууд ачаалахад алдаа гарлаа");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    getExperiences();
  }, []);

  const createExperience = async () => {
    if (!description.trim()) return;
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

  const reaction = async (experienceId: string, type: string) => {
    await fetch("/api/experience-exchange/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: USER_ID, experienceId, type: "LIKE" }),
    });
    getExperiences();
  };

  const comment = async (experienceId: string) => {
    if (!content.trim()) return;
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
    if (!replyContent.trim()) return;
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

  const likeComment = async (commentId: string) => {
    await fetch("/api/experience-exchange/comment/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: USER_ID, commentId, type: "LIKE" }),
    });
    getComment(comments[0]?.experienceId);
  };

  const handleEditComment = async () => {
    if (!newComment.trim() || !editingComment) return;
    const res = await fetch("/api/experience-exchange/comment/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment, id: editingComment.id }),
    });
    if (res.ok) {
      toast.success("Сэтгэгдэл засагдлаа");
      setEditingComment(null);
      getComment(comments[0]?.experienceId);
      getExperiences();
    }
  };

  const deleteComment = async (id: string, expId: string) => {
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

  const getComment = async (experienceId: string) => {
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

  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#4a3f35]">
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
            <button className="w-full bg-white p-5 rounded-2xl border-2 border-orange-100 mb-8 text-left text-gray-400 shadow-sm hover:border-orange-200 transition-all flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Pen className="w-5 h-5 text-orange-400" />
              </div>
              Юу бодож байна вэ?
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-none">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Нийтлэл оруулах
              </DialogTitle>
            </DialogHeader>
            <textarea
              placeholder="Сэтгэгдэлээ энд бичээрэй..."
              className="w-full min-h-[120px] p-3 rounded-xl border-orange-100 focus:ring-orange-400 border-2 outline-none resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="bg-orange-50 rounded-2xl p-4 space-y-3">
              <label className="flex items-center gap-2 font-medium text-orange-700 cursor-pointer">
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
              className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl h-12 text-lg font-bold"
              disabled={uploading || !description.trim()}
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

        <div className="space-y-6">
          {loadingPosts ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
              <p className="text-gray-500">Постууд ачааллаж байна...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-white rounded-2xl border-2 border-dashed border-orange-200">
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
                className="bg-white p-5 rounded-[2rem] border border-orange-50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={post.user.profileImg}
                        alt="profilepic"
                      />
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {post.user.firstName?.[0]?.toUpperCase()}
                        {post.user.lastName?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {post.user.firstName} {post.user.lastName}
                      </h3>
                      <p className="text-xs text-gray-400">{post.createdAt}</p>
                    </div>
                  </div>
                  {USER_ID === post.userId && (
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
                              post.images.map((url: string) => ({
                                file: null,
                                url,
                              })),
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

                <p className="mb-4 leading-relaxed text-gray-700">
                  {post.description}
                </p>

                {post.images?.length > 0 && (
                  <div className="mb-4 overflow-hidden rounded-2xl border border-orange-50">
                    <Carousel>
                      <CarouselContent>
                        {post.images.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <img
                                src={image}
                                className="w-full h-auto object-cover max-h-[400px]"
                                alt={`Pet ${index}`}
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>

                      {post.images.length > 1 && (
                        <>
                          <CarouselPrevious />
                          <CarouselNext />
                        </>
                      )}
                    </Carousel>
                  </div>
                )}

                <div className="flex gap-4 border-t border-orange-50 pt-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all"
                    onClick={() => reaction(post.id, "LIKE")}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        post.reactions?.some((r: any) => r.userId === USER_ID)
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                    <span className="font-medium">
                      {post.reactions?.length || 0}
                    </span>
                  </button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        onClick={() => getComment(post.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-green-50 text-gray-500 hover:text-green-600 transition-all"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">
                          {post.comments?.length || 0}
                        </span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-3xl max-h-[80vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Сэтгэгдэлүүд</DialogTitle>
                      </DialogHeader>

                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="Сэтгэгдэл бичих..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="rounded-xl border-orange-100"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              comment(post.id);
                            }
                          }}
                        />
                        <Button
                          onClick={() => comment(post.id)}
                          className="bg-orange-500 rounded-xl hover:bg-orange-600"
                          disabled={submittingComment || !content.trim()}
                        >
                          {submittingComment ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Илгээх"
                          )}
                        </Button>
                      </div>

                      <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                        {loadingComments ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                          </div>
                        ) : comments.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <MessageCircle className="w-12 h-12 mb-2 opacity-30" />
                            <p className="text-sm">
                              Одоогоор сэтгэгдэл байхгүй байна
                            </p>
                          </div>
                        ) : (
                          comments.map((c) => (
                            <div key={c.id} className="space-y-2">
                              <div className="group relative bg-orange-50/50 p-3 rounded-2xl border border-orange-100/50">
                                {editingComment?.id === c.id ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={newComment}
                                      onChange={(e) =>
                                        setNewComment(e.target.value)
                                      }
                                      className="bg-white rounded-xl"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={handleEditComment}
                                        className="bg-green-600 rounded-lg"
                                      >
                                        Хадгалах
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingComment(null)}
                                        className="rounded-lg"
                                      >
                                        Цуцлах
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2">
                                        <Avatar className="w-7 h-7">
                                          <AvatarImage
                                            src={c.user?.profileImg}
                                          />
                                          <AvatarFallback className="bg-orange-200 text-orange-700 text-xs">
                                            {c.user?.firstName?.[0]?.toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="font-bold text-sm text-orange-800">
                                          {c.user.firstName}
                                        </span>
                                      </div>
                                      {USER_ID === c.userId && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Ellipsis className="w-4 h-4 cursor-pointer hover:bg-orange-200 rounded-full p-0.5" />
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
                                    <p className="text-sm text-gray-700 mb-2">
                                      {c.content}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs">
                                      <button
                                        onClick={() => likeComment(c.id)}
                                        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                                          c.reactions?.some(
                                            (r: any) => r.userId === USER_ID,
                                          )
                                            ? "bg-red-100 text-red-600"
                                            : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                                        }`}
                                      >
                                        <Heart
                                          className={`w-3.5 h-3.5 transition-all ${
                                            c.reactions?.some(
                                              (r: any) => r.userId === USER_ID,
                                            )
                                              ? "fill-red-500 text-red-500"
                                              : ""
                                          }`}
                                        />
                                        <span>{c.reactions?.length || 0}</span>
                                        <span>Таалагдлаа</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          if (replyingTo === c.id) {
                                            setReplyingTo(null);
                                            setReply([]);
                                          } else {
                                            setReplyingTo(c.id);
                                            getReply(c.id);
                                          }
                                        }}
                                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>Хариулах</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>

                              {replyingTo === c.id && (
                                <div className="ml-6 space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      value={replyContent}
                                      onChange={(e) =>
                                        setReplyContent(e.target.value)
                                      }
                                      className="bg-white rounded-xl text-sm"
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
                                      className="bg-orange-500 rounded-xl hover:bg-orange-600"
                                      size="sm"
                                      disabled={
                                        submittingReply || !replyContent.trim()
                                      }
                                    >
                                      {submittingReply ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        "Илгээх"
                                      )}
                                    </Button>
                                  </div>

                                  {loadingReplies[c.id] ? (
                                    <div className="flex items-center justify-center py-4">
                                      <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                                    </div>
                                  ) : reply.length > 0 ? (
                                    <div className="space-y-2">
                                      {reply.map((r) => (
                                        <div
                                          key={r.id}
                                          className="bg-white p-2.5 rounded-xl border border-orange-100 text-sm"
                                        >
                                          <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-1.5">
                                              <Avatar className="w-5 h-5">
                                                <AvatarImage
                                                  src={r.user?.profileImg}
                                                />
                                                <AvatarFallback className="bg-orange-200 text-orange-700 text-[10px]">
                                                  {r.user?.firstName?.[0]?.toUpperCase()}
                                                </AvatarFallback>
                                              </Avatar>
                                              <span className="font-semibold text-orange-700 text-xs">
                                                {r.user?.firstName}
                                              </span>
                                            </div>
                                            <button
                                              className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                                              onClick={() => likeComment(r.id)}
                                            >
                                              <Heart
                                                className={`w-3 h-3 ${
                                                  r.reactions?.some(
                                                    (reaction: any) =>
                                                      reaction.userId ===
                                                      USER_ID,
                                                  )
                                                    ? "fill-red-500 text-red-500"
                                                    : ""
                                                }`}
                                              />
                                              <span className="text-xs">
                                                {r.reactions?.length || 0}
                                              </span>
                                            </button>
                                          </div>
                                          <p className="text-gray-700 text-xs ml-6">
                                            {r.content}
                                          </p>
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
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Пост засах</DialogTitle>
            </DialogHeader>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full min-h-[120px] p-3 rounded-xl border-orange-100 focus:ring-orange-400 border-2 outline-none resize-none"
              placeholder="Сэтгэгдэлээ энд бичээрэй..."
            />
            {editImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
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
              <label className="flex items-center gap-2 font-medium text-orange-700 cursor-pointer bg-orange-50 p-3 rounded-xl">
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
                onClick={() => editPost(editingPost.id)}
                className="bg-orange-500 rounded-xl hover:bg-orange-600"
                disabled={uploading || !newDescription.trim()}
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
