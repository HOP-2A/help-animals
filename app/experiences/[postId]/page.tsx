"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/useAuth";
import { Ellipsis } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
export default function Page() {
  const [post, setPost] = useState<Post[]>([]);
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id;
  const { user } = useAuth(clerkId ?? "");
  const [loadingPost, setLoadingPost] = useState(true);
  const { postId } = useParams();
  const USER_ID = user?.id;

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
  const getExperience = async () => {
    try {
      const res = await fetch("/api/experience-exchange/get-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: postId }),
      });
      const data = await res.json();
      setPost(data);
    } catch (error) {
      toast.error("Постууд ачаалахад алдаа гарлаа");
    } finally {
      setLoadingPost(false);
    }
  };
  useEffect(() => {
    getExperience();
  }, []);
  console.log(post[0]);
  return (
    <div>
      <div>{post[0]?.description}</div>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-bold text-gray-800">
              {post[0]?.user?.firstName} {post[0]?.user?.lastName}
            </h3>
            <p className="text-xs text-gray-400">{post[0]?.createdAt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
