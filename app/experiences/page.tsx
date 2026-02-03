"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/useAuth";
import { MessageCircle, Image as ImageIcon, X, HeartIcon } from "lucide-react";

export default function Page() {
  const [posts, setPosts] = useState([]);
  const [description, setDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user: clerkUser } = useUser();

  const clerkId = clerkUser?.id;
  const user = useAuth(clerkId ?? "");

  const createExperience = async () => {
    if (!description.trim()) return;

    const response = await fetch("/api/experience-exchange/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "242424",
        description,
        images: ["aa"],
      }),
    });

    if (response.ok) {
      setDescription("");
      setIsDialogOpen(false);
      getExperiences();
    }
  };

  const getExperiences = async () => {
    const response = await fetch("/api/experience-exchange/get-all");
    const data = await response.json();
    setPosts(data);
  };

  useEffect(() => {
    getExperiences();
  }, []);
  console.log(posts);
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Experience Exchange
          </h1>
          <p className="text-gray-600">
            Share your thoughts and connect with others
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="w-full bg-gray-100 hover:bg-gray-200 rounded-full px-6 py-3 text-left text-gray-600 transition-colors duration-200 font-medium">
                What is on your mind?
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Create Post
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="What's on your mind..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-25 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="flex justify-between items-center pt-2">
                  <Input type="file" className="w-23 hover:bg-gray-200" />

                  <div className="flex gap-2">
                    <DialogClose asChild>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={createExperience}
                      disabled={!description.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {post.user.firstName?.[0]}
                    {post.user.lastName?.[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {post.user.firstName} {post.user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {post.createdAt}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-3">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>
              {post.images && post.images.length > 0 && (
                <div className="px-4 pb-3">
                  <div className="grid grid-cols-2 gap-2">
                    {post.images.map((img: string, index: number) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Post image ${index + 1}`}
                        className="w-max h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 px-4 py-2">
                <div className="flex gap-1">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-gray-600 hover:text-red-600">
                    <HeartIcon className="w-5 h-5" />
                    <span className="font-medium text-sm">Like</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-gray-600 hover:text-green-600">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium text-sm">Comment</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              Be the first to share your experience with the community!
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create First Post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
