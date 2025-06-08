"use client"

import { ClerkProvider, ClerkLoading, ClerkLoaded } from "@clerk/nextjs"
import { ImageKitProvider } from "imagekitio-next"
import { useEffect, useState } from 'react'

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ClerkProvider>
      <ImageKitProvider
        authenticator={authenticator}
        publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
        urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
      >
        {children}
      </ImageKitProvider>
    </ClerkProvider>
  )
}