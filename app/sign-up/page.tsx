"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/useAuth";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { SignIn } from "@clerk/nextjs";

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
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
      toast.success("successfully registered");
      openSignIn();
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      router.push("/help-animal");
    }
  }, [isSignedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Create an Account
          </h1>
          <SignInButton>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition">
              Log In
            </button>
          </SignInButton>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg"
          />
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="rounded-lg"
          />
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="rounded-lg"
          />
          <Input
            type="date"
            placeholder="Birthdate"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="rounded-lg"
          />
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <Button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition"
        >
          Sign Up
        </Button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <SignInButton mode="modal">
            <span className="text-indigo-600 font-medium cursor-pointer hover:underline">
              Log In
            </span>
          </SignInButton>
        </p>
      </div>
    </div>
  );
}
