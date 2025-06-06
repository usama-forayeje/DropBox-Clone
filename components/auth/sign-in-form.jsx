"use client"

import { useSignIn } from "@clerk/nextjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signInSchema } from "@/schemas/signInSchema"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { AlertCircle, Loader2, Cloud, Sparkles, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"


export default function SignInForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const { isLoaded, signIn, setActive } = useSignIn()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data) => {
    if (!isLoaded || !signIn || !setActive) return

    setIsSubmitting(true)
    setAuthError(null)

    try {
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        })
        router.push("/dashboard")
      } else {
        setAuthError("Sign in failed. Please check your credentials.")
      }
    } catch (error) {
      // Safely access error messages
      setAuthError(
        error?.errors?.[0]?.longMessage || error?.message || "Sign in failed"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-4 pb-8">
        <div className="flex justify-center">
          <div className="relative">
            <Cloud className="h-12 w-12 text-blue-600" />
            <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription className="text-base">
          Sign in to access your secure cloud storage
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="identifier"
              type="email"
              placeholder="your.email@example.com"
              disabled={isSubmitting}
              {...register("identifier")}
              className={errors.identifier ? "border-red-300" : ""}
            />
            {errors.identifier && (
              <p className="text-sm text-red-600">{errors.identifier.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                disabled={isSubmitting}
                {...register("password")}
                className={errors.password ? "border-red-300 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="space-y-4">
          <Separator />

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
