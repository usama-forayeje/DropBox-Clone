"use client";

import { useSignUp } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/schemas/signUpSchema";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail, User, UserPlus2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import PasswordInput from "./ui/password-input";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Card, CardHeader } from "./ui/card";


function SignUpForm() {
    const router = useRouter();

    const [verifying, setVerifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [verificationError, setVerificationError] = useState(null);
    const [verificationCode, setVerificationCode] = useState("");

    const { isLoaded, signUp, setActive } = useSignUp();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data) => {
        if (!isLoaded) return;

        setIsSubmitting(true);
        setAuthError(null);
        try {
            await signUp.create({
                emailAddress: data.email,
                password: data.password
            });
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            }),
                setVerifying(true);
            reset();
        } catch (error) {
            setAuthError(error.errors[0]?.longMessage || "Sign up failed");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        if (!isLoaded || !signUp) return;
        setIsSubmitting(true);
        setAuthError(null);

        try {
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode
            });
            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push("/dashboard");
            } else {
                console.log('verification is not complete', result);
                setVerificationError("Verification failed");
            }
        } catch (error) {
            setVerificationError(error.errors[0]?.longMessage || "Verification failed");
        } finally {
            setIsSubmitting(false);
        }

    }


    if (verifying) {
        return (
            <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
                <CardHeader className="flex flex-col gap-1 items-center pb-2">
                    <h1 className="text-2xl font-bold text-default-900">
                        Verify Your Email
                    </h1>
                    <p className="text-default-500 text-center">
                        We've sent a verification code to your email
                    </p>
                </CardHeader>

                <Separator />

                <CardBody className="py-6">
                    {verificationError && (
                        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p>{verificationError}</p>
                        </div>
                    )}

                    <form onSubmit={handleVerificationSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="verificationCode"
                                className="text-sm font-medium text-default-900"
                            >
                                Verification Code
                            </label>
                            <Input
                                id="verificationCode"
                                type="text"
                                placeholder="Enter the 6-digit code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="w-full"
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            color="primary"
                            className="w-full"
                            isLoading={isSubmitting}
                        >
                            {isSubmitting ? "Verifying..." : "Verify Email"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-default-500">
                            Didn't receive a code?{" "}
                            <Button
                                onClick={async () => {
                                    if (signUp) {
                                        await signUp.prepareEmailAddressVerification({
                                            strategy: "email_code",
                                        });
                                    }
                                }}
                                className="text-primary hover:underline font-medium"
                            >
                                Resend code
                            </Button>
                        </p>
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6 px-4 sm:px-0">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Create your account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Welcome! Please fill out the information to get started.
                </p>
            </div>

            <div className="rounded-2xl border bg-background p-6 shadow-md dark:border-neutral-800">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="block text-sm font-medium text-foreground">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            disabled={isSubmitting}
                            {...register("email")}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600 dark:text-red-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="block text-sm font-medium text-foreground">
                            Password
                        </Label>
                        <Input
                            id="password"
                            placeholder="Choose a strong password"
                            disabled={isSubmitting}
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600 dark:text-red-500">
                                {errors.password.message}
                            </p>
                        )}

                        <Label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                            Confirm Password
                        </Label>
                        <Input
                            id="confirmPassword"
                            placeholder="Confirm your password"
                            disabled={isSubmitting}
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-600 dark:text-red-500">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>


                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Continue
                    </Button>

                    {authError && (
                        <p className="text-sm text-red-600 dark:text-red-500">
                            {authError}
                        </p>
                    )}
                </form>


                <Separator className="my-6" />

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium underline underline-offset-4 hover:text-primary"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )


}

export default SignUpForm