"use client";

import { useState, useEffect, ChangeEvent } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
<<<<<<< HEAD
import { toast } from "sonner";
=======
import { toast, Toaster } from "sonner";
import { upload } from "@vercel/blob/client";
>>>>>>> f7755b0 (changed UI)
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
} from "lucide-react";
<<<<<<< HEAD
import { useAuth } from "@/providers/useAuth";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
=======

type ImageItem = { file: File | null; url: string };

>>>>>>> f7755b0 (changed UI)
export default function Page() {
  const [posts, setPosts] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
<<<<<<< HEAD
  const [newDescription, setNewDescription] = useState("");
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id;
  const { user } = useAuth(clerkId ?? "");
=======

>>>>>>> f7755b0 (changed UI)
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editingComment, setEditingComment] = useState<any | null>(null);

  const [newDescription, setNewDescription] = useState("");
  const [newComment, setNewComment] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [editImages, setEditImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const USER_ID = "8ZfLnsDxKKkbPezQ5ljk5";

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
    const res = await fetch("/api/experience-exchange/get-all");
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    getExperiences();
  }, []);
  console.log(user);
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
      toast.success("Амжилттай нийтлэгдлээ! 🐾");
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
  const reaction = async (experienceId: string) => {
    await fetch("/api/experience-exchange/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: USER_ID, experienceId }),
    });
    getExperiences();
  };
  const comment = async (experienceId: string) => {
    if (!content.trim()) return;
    const res = await fetch("/api/experience-exchange/comment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: USER_ID, content, experienceId }),
    });
    if (res.ok) {
      setContent("");
      getComment(experienceId);
      getExperiences();
      toast.success("Сэтгэгдэл нэмэгдлээ");
    }
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
    const res = await fetch("/api/experience-exchange/comment/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experienceId }),
    });
    const data = await res.json();
    setComments(data);
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#4a3f35]">
      <Toaster position="top-center" richColors />
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
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={
                        img.url ||
                        (img.file ? URL.createObjectURL(img.file) : "")
                      }
                      className="rounded-xl object-cover h-24 w-full shadow-sm"
                    />
                    <button
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full shadow-mddd p-1 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={createExperience}
              className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl h-12 text-lg font-bold"
              disabled={uploading}
            >
              {uploading ? "Түр хүлээнэ үү..." : "Нийтлэх"}
            </Button>
          </DialogContent>
        </Dialog>

        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-5 rounded-[2rem] border border-orange-50 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-orange-200 rounded-2xl flex items-center justify-center font-bold text-orange-700">
                    {post.user.firstName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {post.user.firstName} {post.user.lastName}
                    </h3>
                    <p className="text-xs text-gray-400">Дөнгөж сая</p>
                  </div>
                </div>
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
                      <Pen className="w-4 h-4" /> Засаx
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 text-red-500 focus:text-red-500"
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash className="w-4 h-4" /> Устгаx
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="mb-4 leading-relaxed text-gray-700">
                {post.description}
              </p>

              {post.images?.length > 0 && (
                <div className="mb-4 overflow-hidden rounded-2xl border border-orange-50">
                  <img
                    src={post.images[0]}
                    className="w-full h-auto object-cover max-h-[400px]"
                    alt="Pet"
                  />
                </div>
              )}

              <div className="flex gap-4 border-t border-orange-50 pt-3">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all"
                  onClick={() => reaction(post.id)}
                >
                  <Heart className="w-5 h-5" />
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
                  <DialogContent className="max-w-md rounded-3xl">
                    <DialogHeader>
                      <DialogTitle>Сэтгэгдэлүүд</DialogTitle>
                    </DialogHeader>

                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Сэтгэгдэл бичих..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="rounded-xl border-orange-100"
                      />
                      <Button
                        onClick={() => comment(post.id)}
                        className="bg-orange-500 rounded-xl"
                      >
                        Илгээх
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                      {comments.map((c) => (
                        <div
                          key={c.id}
                          className="group relative bg-orange-50/50 p-3 rounded-2xl border border-orange-100/50"
                        >
                          {editingComment?.id === c.id ? (
                            <div className="space-y-2">
                              <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="bg-white"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleEditComment}
                                  className="bg-green-600"
                                >
                                  Хадгалах
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingComment(null)}
                                >
                                  Цуцлах
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span className="font-bold text-sm text-orange-800">
                                  {c.user.firstName}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger>
                                    <Ellipsis className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
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
                                      className="text-red-500"
                                    >
                                      Устгах
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <p className="text-sm text-gray-700 mt-1">
                                {c.content}
                              </p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Пост засах</DialogTitle>
            </DialogHeader>
            <Input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="rounded-xl border-orange-200"
            />
            <div className="grid grid-cols-3 gap-2 mt-2">
              {editImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={
                      img.url || (img.file ? URL.createObjectURL(img.file) : "")
                    }
                    className="rounded-xl h-24 w-full object-cover"
                  />
                  <button
                    onClick={() =>
                      setEditImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Input
                type="file"
                onChange={handleEditFile}
                multiple
                className="rounded-xl"
              />
              <Button
                onClick={() => editPost(editingPost.id)}
                className="bg-orange-500 rounded-xl"
                disabled={uploading}
              >
                Өөрчлөлтийг хадгалах
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
