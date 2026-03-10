"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/useAuth";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { Cake } from "lucide-react";
import { User } from "lucide-react";
import { Pen } from "lucide-react";
import { Mail } from "lucide-react";
import { PawPrint } from "lucide-react";
export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id;
  const { user } = useAuth(clerkId ?? "");
  const router = useRouter();
  const { openSignIn } = useClerk();
  const { isSignedIn } = useUser();

  const handleSubmit = async () => {
    setError(null);

    if (!email || !firstName || !lastName || !birthdate) {
      toast.error("Бүх талбарыг бөглөнө үү");
      return;
    }

    const res = await fetch("/api/signUp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        birthdate: new Date(birthdate).toISOString(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error);
    } else {
      toast.success("Амжилттай бүртгэгдлээ");
      openSignIn();
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      router.push("/help-animal");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 px-4 py-8 relative overflow-hidden">
      <div className="absolute top-10 left-10 text-6xl opacity-10">🐾</div>
      <div className="absolute bottom-20 right-20 text-6xl opacity-10">🐾</div>
      <div className="absolute top-1/3 right-10 text-4xl opacity-10">🐶</div>
      <div className="absolute bottom-1/3 left-10 text-4xl opacity-10">🐱</div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6 border-2 border-orange-200 relative z-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Бүртгүүлэх
          </h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Mail className="h-4 w-4" />
              <span>Имэйл</span>
            </label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-orange-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <User className="h-4 w-4" />
              <span>Овог</span>
            </label>
            <Input
              placeholder="Овог"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="rounded-xl border-orange-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Pen className="h-4 w-4" />
              <span>Нэр</span>
            </label>
            <Input
              placeholder="Нэр"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="rounded-xl border-orange-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Cake className="h-4 w-4" />
              <span>Төрсөн өдөр</span>
            </label>
            <Input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="rounded-xl border-orange-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          className="w-full text-base font-bold px-6 py-4 rounded-xl bg-linear-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:scale-[1.02] transition-all duration-300"
        >
          <span className="flex items-center justify-center gap-2">
            <PawPrint />
            <span>Бүртгүүлэх</span>
          </span>
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500">эсвэл</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Бүртгэлтэй хэрэглэгч үү?{" "}
            <SignInButton mode="modal">
              <span className="text-orange-600 font-semibold cursor-pointer hover:text-orange-700 hover:underline transition">
                Нэвтрэх
              </span>
            </SignInButton>
          </p>
        </div>
      </div>
    </div>
  );
}
