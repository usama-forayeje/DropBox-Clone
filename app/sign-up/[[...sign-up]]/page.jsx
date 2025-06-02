import SignUpForm from "@/components/auth/sign-up-form"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function SignUpPage() {
  const { userId } = await auth()

  if (userId) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  )
}
