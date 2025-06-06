"use client"

import { SignIn } from "@clerk/nextjs"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()

  if (!isLoaded) return null
  if (userId) router.push("/dashboard")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              card: "shadow-none bg-transparent",
              socialButtonsBlockButton: "border border-gray-200 hover:bg-gray-50",
            }
          }}
          signUpUrl="/sign-up"
          routing="path"
          path="/sign-in"
        />
      </div>
    </div>
  )
}