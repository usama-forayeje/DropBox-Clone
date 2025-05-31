"use client"

import { useSignUp } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, Lock, Mail, } from "lucide-react";
import { Separator } from "./ui/separator";
import { Card, CardFooter, CardHeader } from "./ui/card";
import { signInSchema } from "@/schemas/signInSchema";

function SignInForm() {
    const router = useRouter();
    const { isLoaded, signIn, setActive } = useSignUp();
    const [authError, setAuthError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data) => {
        if (!isLoaded) return;
        setIsSubmitting(true);
        setAuthError(null);
        try {
            const result = await signIn.create({
                identifier: data.identifier,
                password: data.password,
            });
            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push("/dashboard");
            } else {
                setAuthError("Sign in failed");
            }
        } catch (error) {
            setAuthError(error.errors[0]?.longMessage || "Sign in failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    


    return (
        <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
            <CardHeader className="flex flex-col gap-1 items-center pb-2">
                <h1 className="text-2xl font-bold text-default-900">Welcome Back</h1>
                <p className="text-default-500 text-center">
                    Sign in to access your secure cloud storage
                </p>
            </CardHeader>

            <Separator />

            <CardBody className="py-6">
                {authError && (
                    <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{authError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="identifier"
                            className="text-sm font-medium text-default-900"
                        >
                            Email
                        </label>
                        <Input
                            id="identifier"
                            type="email"
                            placeholder="your.email@example.com"
                            startContent={<Mail className="h-4 w-4 text-default-500" />}
                            isInvalid={!!errors.identifier}
                            errorMessage={errors.identifier?.message}
                            {...register("identifier")}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-default-900"
                            >
                                Password
                            </label>
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            startContent={<Lock className="h-4 w-4 text-default-500" />}
                            endContent={
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onClick={() => setShowPassword(!showPassword)}
                                    type="button"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-default-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-default-500" />
                                    )}
                                </Button>
                            }
                            isInvalid={!!errors.password}
                            errorMessage={errors.password?.message}
                            {...register("password")}
                            className="w-full"
                        />
                    </div>

                    <Button
                        type="submit"
                        color="primary"
                        className="w-full"
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
            </CardBody>

            <Separator />

            <CardFooter className="flex justify-center py-4">
                <p className="text-sm text-default-600">
                    Don't have an account?{" "}
                    <Link
                        href="/sign-up"
                        className="text-primary hover:underline font-medium"
                    >
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}

export default SignInForm