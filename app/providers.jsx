"use client"

import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs"
import { ImageKitProvider } from "imagekitio-next"

export const authenticator = async () => {
    try {
        const response = await fetch("/api/imagekit-auth")
        if (!response.ok) throw new Error("Authentication failed")
        return await response.json()
    } catch (error) {
        console.error("ImageKit auth error:", error)
        throw error
    }
}

export function Providers({ children }) {
    return (<ClerkProvider frontendApi={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
        <SignedIn>
            <SignedOut>
                 <RedirectToSignIn />
            <ImageKitProvider
                authenticator={authenticator}
                publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
                urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
                transformationPosition="path"
            >
                {children}
            </ImageKitProvider>
            </SignedOut>
        </SignedIn>
    </ClerkProvider>
    )
}
