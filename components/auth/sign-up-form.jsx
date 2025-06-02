"use client"

import { useSignUp } from "@clerk/nextjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema } from "@/schemas/signUpSchema"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { AlertCircle, Loader2, Cloud, Sparkles, CheckCircle } from "lucide-react"
import { toast } from "sonner"


export default function SignUpForm() {
  const router = useRouter()
  const [verifying, setVerifying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [verificationCode, setVerificationCode] = useState("")
  const { isLoaded, signUp, setActive } = useSignUp()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data) => {
    if (!isLoaded) return

    setIsSubmitting(true)
    setAuthError(null)

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      })

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      })

      setVerifying(true)
      reset()

      toast({
        title: "Verification email sent!",
        description: "Please check your email for the verification code.",
      })
    } catch (error) {
      setAuthError(error.errors[0]?.longMessage || "Sign up failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerificationSubmit = async (e) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return

    setIsSubmitting(true)
    setAuthError(null)

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        toast({
          title: "Welcome to CloudBox!",
          description: "Your account has been created successfully.",
        })
        router.push("/dashboard")
      } else {
        setAuthError("Verification failed. Please try again.")
      }
    } catch (error) {
      setAuthError(error.errors[0]?.longMessage || "Verification failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (verifying) {
    return (
      <Card className="w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="relative">
              <Cloud className="h-12 w-12 text-blue-600" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription className="text-base">
            We've sent a 6-digit verification code to your email address
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{authError}</p>
            </div>
          )}

          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="verificationCode" className="text-sm font-medium">
                Verification Code
              </Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || verificationCode.length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-blue-600 hover:text-blue-700"
                onClick={async () => {
                  if (signUp) {
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code",
                    })
                    toast({
                      title: "Code resent!",
                      description: "Please check your email again.",
                    })
                  }
                }}
              >
                Resend code
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    )
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
        <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
        <CardDescription className="text-base">Join millions who trust CloudBox with their files</CardDescription>
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
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={isSubmitting}
              {...register("email")}
              className={errors.email ? "border-red-300" : ""}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              disabled={isSubmitting}
              {...register("password")}
              className={errors.password ? "border-red-300" : ""}
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              disabled={isSubmitting}
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-red-300" : ""}
            />
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="space-y-4">
          <Separator />

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Features highlight */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-blue-900 text-sm">What you get with CloudBox:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <CheckCircle className="h-4 w-4" />
              <span>100GB free storage</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <CheckCircle className="h-4 w-4" />
              <span>Advanced file sharing</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <CheckCircle className="h-4 w-4" />
              <span>Military-grade security</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
