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
import { toast } from "sonner";
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
} from "lucide-react";
import { useAuth } from "@/providers/useAuth";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
export default function Page() {
  const [posts, setPosts] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id;
  const { user } = useAuth(clerkId ?? "");
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<any | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file) => ({ file, url: "" }));
    setImages((prev) => [...prev, ...newImages]);
  };
  const uploadImages = async () => {
    setUploading(true);

    const updatedImages = await Promise.all(
      images.map(async (img) => {
        if (img.url) return img;
        const uploaded = await upload(img.file.name, img.file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        return { ...img, url: uploaded.url };
      }),
    );

    setImages(updatedImages);
    setUploading(false);
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

    await fetch("/api/experience-exchange/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "393939",
        description,
        images: images.map((img) => img.url),
      }),
    });

    setDescription("");
    setIsDialogOpen(false);
    getExperiences();
  };

  const editPost = async (id: string) => {
    await fetch("/api/experience-exchange/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: newDescription,
        id,
      }),
    });
    getExperiences();
  };
  const deletePost = async (id: string) => {
    await fetch("/api/experience-exchange/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        userId: "393939",
      }),
    });
    getExperiences();
  };
  const reaction = async (experienceId: string, type: string) => {
    await fetch("/api/experience-exchange/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "393939",
        type,
        experienceId,
      }),
    });

    getExperiences();
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

  const comment = async (experienceId: string) => {
    if (!content.trim()) return;

    await fetch("/api/experience-exchange/comment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "393939",
        content,
        experienceId,
      }),
    });

    setContent("");
    getComment(experienceId);
    getExperiences();
  };
  const editComment = async (id: string) => {
    await fetch("/api/experience-exchange/comment/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newComment,
        id,
      }),
    });
    getComment();
  };
  const deleteComment = async (id: string) => {
    await fetch("/api/experience-exchange/comment/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        userId: "393939",
      }),
    });
    getComment();
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Туршлага Солилцох </h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full bg-white p-4 rounded-xl border mb-6 text-left text-gray-500">
              What is on your mind?
            </button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Post</DialogTitle>
            </DialogHeader>

            <Input
              placeholder="What's on your mind?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={createExperience}>Post</Button>
            </div>
            <div className="rounded-xl border p-4 space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-pink-500" />
                Амьтны зураг
              </Label>

              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFile}
                className="cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-2 mt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={img.url ? img.url : URL.createObjectURL(img.file)}
                      alt={`preview ${idx}`}
                      className="rounded-lg object-cover h-32 w-full"
                    />
                    <button
                      onClick={() => {
                        setImages((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <Button
                onClick={(updatedImages) => uploadImages()}
                disabled={uploading}
                className="w-full"
                variant="secondary"
              >
                {uploading ? "Upload хийж байна..." : "Зураг оруулах"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-xl border">
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Ellipsis className="cursor-pointer" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingPost(post);
                        setNewDescription(post.description);
                      }}
                      className="cursor-pointer"
                    >
                      Засаx <Pen />
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => deletePost(post.id)}
                    >
                      Устгаx <Trash />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Dialog
                open={!!editingPost}
                onOpenChange={() => setEditingPost(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                  </DialogHeader>

                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingPost(null)}
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={() => {
                        editPost(post.id);
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="font-semibold">
                {post.user.firstName} {post.user.lastName}
              </div>
              <p className="my-3">{post.description}</p>
              <img src={post.images} className="rounded-2xl" />
              <div className="flex gap-2 border-t pt-2">
                <div className="relative flex-1">
                  <button
                    onClick={() => reaction(post.id, "LIKE")}
                    className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-red-600"
                  >
                    <Heart className="w-5 h-5" />
                    {post.reactions.length}
                  </button>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => getComment(post.id)}
                      className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:text-green-600"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {post.comments.length}
                    </button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Сэтгэгдэлүүд</DialogTitle>
                    </DialogHeader>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Leave a comment..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                      <Button onClick={() => comment(post.id)}>Send</Button>
                    </div>

                    <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                      {comments.length === 0 && (
                        <p className="text-sm text-gray-500 text-center">
                          No comments yet
                        </p>
                      )}

                      {comments.map((c) => (
                        <div key={c.id} className="bg-gray-100 rounded-lg p-3">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Ellipsis className="cursor-pointer" />
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingComment(c);
                                    setNewDescription(c.description);
                                  }}
                                  className="cursor-pointer"
                                >
                                  Засаx <Pen />
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => deleteComment(c.id)}
                                >
                                  Устгаx <Trash />
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Dialog
                              open={!!editingComment}
                              onOpenChange={() => setEditingComment(null)}
                            >
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Comment</DialogTitle>
                                </DialogHeader>

                                <Input
                                  value={newComment}
                                  onChange={(e) =>
                                    setNewComment(e.target.value)
                                  }
                                />

                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingPost(null)}
                                  >
                                    Cancel
                                  </Button>

                                  <Button
                                    onClick={() => {
                                      editComment(c.id);
                                    }}
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <div className="font-semibold text-sm">
                            {c.user.firstName} {c.user.lastName}
                          </div>
                          <p className="text-sm">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
