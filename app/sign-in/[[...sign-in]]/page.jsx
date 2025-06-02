"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import SignInForm from "@/components/auth/sign-in-form";
import { useEffect } from "react";

export default function SignInPage() {
  const { userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      router.push("/dashboard");
    }
  }, [userId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  );
}