"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/useAuth";
import {
  Ellipsis,
  Heart,
  MessageCircle,
  Pen,
  Trash,
  ImageIcon,
  X,
  Loader2,
  PawPrint,
  ArrowLeft,
  Send,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { upload } from "@vercel/blob/client";

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
  const [post, setPost] = useState<Post | null>(null);
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id;
  const { user } = useAuth(clerkId ?? "");
  const [loadingPost, setLoadingPost] = useState(true);
  const { postId } = useParams();
  const router = useRouter();

  const USER_ID = user?.id;

  const myAvatar = clerkUser?.imageUrl;
  const myInitial = clerkUser?.firstName?.[0]?.toUpperCase() ?? "?";

  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [reply, setReply] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState<{
    [key: string]: boolean;
  }>({});
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [newComment, setNewComment] = useState("");

  const [editingPost, setEditingPost] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [editImages, setEditImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const getExperience = async () => {
    try {
      const res = await fetch("/api/experience-exchange/get-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId }),
      });
      const data = await res.json();
      setPost(Array.isArray(data) ? data[0] : data);
    } catch {
      toast.error("Постууд ачаалахад алдаа гарлаа");
    } finally {
      setLoadingPost(false);
    }
  };

  const getComment = async (id?: string) => {
    const expId = id ?? post?.id;
    if (!expId) return;
    setLoadingComments(true);
    try {
      const res = await fetch("/api/experience-exchange/comment/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experienceId: expId }),
      });
      const data = await res.json();
      setComments(data);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    getExperience();
  }, []);

  useEffect(() => {
    if (post?.id) getComment(post.id);
  }, [post?.id]);

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

  const handleEditFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setEditImages((prev) => [
      ...prev,
      ...Array.from(files).map((file) => ({ file, url: "" })),
    ]);
  };

  const editPost = async () => {
    if (!post || !USER_ID) return;
    const uploaded = await uploadImages(editImages, setEditImages);
    const res = await fetch("/api/experience-exchange/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: newDescription,
        id: post.id,
        images: uploaded.map((img) => img.url),
      }),
    });
    if (res.ok) {
      toast.success("Пост шинэчлэгдлээ");
      setEditingPost(false);
      setEditImages([]);
      getExperience();
    }
  };

  const deletePost = async () => {
    if (!post || !USER_ID) return;
    const res = await fetch("/api/experience-exchange/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, userId: USER_ID }),
    });
    if (res.ok) {
      toast.success("Пост устгагдлаа");
      router.back();
    }
  };

  const reaction = async () => {
    if (!post || !USER_ID) return;
    await fetch("/api/experience-exchange/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        experienceId: post.id,
        type: "LIKE",
      }),
    });
    getExperience();
  };

  const comment = async () => {
    if (!content.trim() || !post || !USER_ID) return;
    setSubmittingComment(true);
    try {
      const res = await fetch("/api/experience-exchange/comment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: USER_ID,
          content,
          experienceId: post.id,
        }),
      });
      if (res.ok) {
        setContent("");
        await getComment();
        getExperience();
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
        getExperience();
      }
    } finally {
      setSubmittingReply(false);
    }
  };

  const likeComment = async (commentId: string) => {
    if (!USER_ID) return;
    await fetch("/api/experience-exchange/comment/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: USER_ID, commentId, type: "LIKE" }),
    });
    getComment();
  };

  const handleEditComment = async () => {
    if (!newComment.trim() || !editingComment || !USER_ID) return;
    const res = await fetch("/api/experience-exchange/comment/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment, id: editingComment.id }),
    });
    if (res.ok) {
      toast.success("Сэтгэгдэл засагдлаа");
      setEditingComment(null);
      getComment();
      getExperience();
    }
  };

  const deleteComment = async (id: string) => {
    if (!USER_ID) return;
    const res = await fetch("/api/experience-exchange/comment/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, userId: USER_ID }),
    });
    if (res.ok) {
      toast.success("Сэтгэгдэл устлаа");
      getComment();
      getExperience();
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
      <div className="max-w-3xl mx-auto p-4 py-8">
        <header className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-orange-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-orange-500" />
          </button>
          <div className="bg-orange-400 p-2 rounded-2xl shadow-sm">
            <PawPrint className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Туршлага Солилцох Булан
          </h1>
        </header>
        {loadingPost ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-12 h-12 text-orange-400 animate-spin" />
            <p className="text-gray-500 text-lg">Пост ачааллаж байна...</p>
          </div>
        ) : !post ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-3xl border-2 border-dashed border-orange-200">
            <PawPrint className="w-20 h-20 text-orange-200" />
            <p className="text-gray-500 text-xl font-medium">Пост олдсонгүй</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-[2rem] border border-orange-50 shadow-sm overflow-hidden mb-6">
              <div className="flex justify-between items-start p-6 pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 ring-2 ring-orange-100">
                    <AvatarImage src={post.user?.profileImg} alt="profilepic" />
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-lg font-bold">
                      {post.user?.firstName?.[0]?.toUpperCase()}
                      {post.user?.lastName?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {post.user?.firstName} {post.user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {USER_ID && USER_ID === post.userId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                      <Ellipsis className="w-5 h-5 text-gray-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => {
                          setEditingPost(true);
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
                        onClick={deletePost}
                      >
                        <Trash className="w-4 h-4" /> Устгах
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="px-6 pb-5">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {post.description}
                </p>
              </div>
              {post.images?.length > 0 && (
                <div className="border-y border-orange-50">
                  <Carousel>
                    <CarouselContent>
                      {post.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <img
                            src={image}
                            className="w-full object-cover max-h-[520px]"
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

              <div className="flex items-center gap-3 px-6 py-4 border-t border-orange-50">
                <button
                  onClick={reaction}
                  disabled={!USER_ID}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold transition-all text-sm disabled:opacity-50 ${
                    post.reactions?.some((r) => r.userId === USER_ID)
                      ? "bg-red-50 text-red-500"
                      : "bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      post.reactions?.some((r) => r.userId === USER_ID)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                  {post.reactions?.length || 0} Таалагдлаа
                </button>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-50 text-gray-500 text-sm font-semibold">
                  <MessageCircle className="w-5 h-5" />
                  {post.comments?.length || 0} Сэтгэгдэл
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-orange-50 shadow-sm p-6">
              <h2 className="font-extrabold text-xl mb-5 text-gray-800 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-orange-400" />
                Сэтгэгдэлүүд
              </h2>

              <div className="flex gap-3 mb-7">
                <Avatar className="w-9 h-9 shrink-0 mt-1">
                  <AvatarImage src={user?.profileImg} />
                  <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-bold">
                    {myInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder={
                      USER_ID ? "Сэтгэгдэл бичих..." : "Нэвтэрч орно уу..."
                    }
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={!USER_ID}
                    className="rounded-2xl border-orange-100 bg-orange-50/40 focus-visible:ring-orange-300 h-11 disabled:opacity-60"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        comment();
                      }
                    }}
                  />
                  <Button
                    onClick={comment}
                    className="bg-orange-500 hover:bg-orange-600 rounded-2xl h-11 px-4"
                    disabled={submittingComment || !content.trim() || !USER_ID}
                  >
                    {submittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {loadingComments ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <MessageCircle className="w-14 h-14 mb-3 opacity-20" />
                  <p className="text-base font-medium">
                    Одоогоор сэтгэгдэл байхгүй байна
                  </p>
                  <p className="text-sm mt-1 opacity-70">
                    Эхний сэтгэгдэлийг үлдээгээрэй!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.id} className="space-y-2">
                      <div className="group flex gap-3">
                        <Avatar className="w-9 h-9 shrink-0 mt-0.5">
                          <AvatarImage src={c.user?.profileImg} />
                          <AvatarFallback className="bg-orange-200 text-orange-700 text-xs font-bold">
                            {c.user?.firstName?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          {editingComment?.id === c.id ? (
                            <div className="space-y-2">
                              <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="rounded-xl bg-orange-50"
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
                              <div className="bg-orange-50/60 rounded-2xl rounded-tl-sm px-4 py-3">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-sm text-orange-800">
                                    {c.user?.firstName}
                                  </span>
                                  {USER_ID && USER_ID === c.userId && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Ellipsis className="w-4 h-4 text-gray-400 hover:text-gray-600" />
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
                                          onClick={() => deleteComment(c.id)}
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

                              <div className="flex items-center gap-3 mt-1.5 ml-2 text-xs">
                                <button
                                  onClick={() => likeComment(c.id)}
                                  disabled={!USER_ID}
                                  className={`flex items-center gap-1 transition-all font-medium disabled:opacity-40 ${
                                    c.reactions?.some(
                                      (r) => r.userId === USER_ID,
                                    )
                                      ? "text-red-500"
                                      : "text-gray-400 hover:text-red-400"
                                  }`}
                                >
                                  <Heart
                                    className={`w-3.5 h-3.5 ${
                                      c.reactions?.some(
                                        (r) => r.userId === USER_ID,
                                      )
                                        ? "fill-red-500"
                                        : ""
                                    }`}
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
                        <div className="ml-12 space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="rounded-2xl bg-orange-50/40 border-orange-100 text-sm h-10"
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
                              className="bg-orange-500 hover:bg-orange-600 rounded-2xl h-10 px-3"
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
                                <Send className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>

                          {loadingReplies[c.id] ? (
                            <div className="flex items-center justify-center py-3">
                              <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                            </div>
                          ) : reply.length > 0 ? (
                            <div className="space-y-2">
                              {reply.map((r) => (
                                <div key={r.id} className="flex gap-2.5">
                                  <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                                    <AvatarImage src={r.user?.profileImg} />
                                    <AvatarFallback className="bg-orange-200 text-orange-700 text-[10px] font-bold">
                                      {r.user?.firstName?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-white rounded-2xl rounded-tl-sm border border-orange-100 px-3 py-2">
                                      <div className="flex justify-between items-center mb-0.5">
                                        <span className="font-semibold text-xs text-orange-700">
                                          {r.user?.firstName}
                                        </span>
                                        <button
                                          onClick={() => likeComment(r.id)}
                                          disabled={!USER_ID}
                                          className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-40 ${
                                            r.reactions?.some(
                                              (rx) => rx.userId === USER_ID,
                                            )
                                              ? "text-red-500"
                                              : "text-gray-400 hover:text-red-400"
                                          }`}
                                        >
                                          <Heart
                                            className={`w-3 h-3 ${
                                              r.reactions?.some(
                                                (rx) => rx.userId === USER_ID,
                                              )
                                                ? "fill-red-500"
                                                : ""
                                            }`}
                                          />
                                          {r.reactions?.length || 0}
                                        </button>
                                      </div>
                                      <p className="text-xs text-gray-700">
                                        {r.content}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        <Dialog open={editingPost} onOpenChange={() => setEditingPost(false)}>
          <DialogContent className="rounded-3xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Пост засах
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-start gap-3">
              <Avatar className="w-9 h-9 shrink-0 mt-1">
                <AvatarImage src={user?.profileImg} />
                <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-bold">
                  {myInitial}
                </AvatarFallback>
              </Avatar>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="flex-1 min-h-[120px] p-4 rounded-xl border-orange-100 focus:ring-2 focus:ring-orange-300 border-2 outline-none resize-none text-base text-gray-700"
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
                onClick={editPost}
                className="bg-orange-500 rounded-xl hover:bg-orange-600 h-11 font-bold"
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
