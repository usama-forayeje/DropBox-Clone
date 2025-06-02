import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CloudBox - Premium Cloud Storage',
  description: 'The most advanced cloud storage solution for individuals and teams',
  keywords: 'cloud storage, file sharing, backup, sync',
  authors: [{ name: 'CloudBox Team' }],
  openGraph: {
    title: 'CloudBox - Premium Cloud Storage',
    description: 'Store, sync, and share your files securely in the cloud',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}