import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import SignInForm from "@/components/auth/sign-in-form"

export default async function SignInPage() {
  const { userId } = await auth()

  if (userId) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  )
}
