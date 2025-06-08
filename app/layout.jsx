
"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "sonner" 
import { ThemeProvider } from "@/components/theme/theme-provider"

const inter = Inter({ subsets: ["latin"] })

const metadata = {
  title: "CloudBox - Premium Cloud Storage",
  description: "The most advanced cloud storage solution",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <Providers>
              {children}
              <Toaster position="top-right" richColors />
            </Providers>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}