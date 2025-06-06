"use client"

import { useEffect, useState } from 'react'
import { useAuth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import FileExplorer from "@/components/dashboard/file-explorer"

export default function DashboardPage({ searchParams }) {
  const [mounted, setMounted] = useState(false)
  const { userId, isLoaded } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isLoaded || !mounted) return null

  if (!userId) {
    redirect("/sign-in")
  }

  const folderId = searchParams?.folder || null

  return (
    <DashboardLayout>
      <FileExplorer userId={userId} parentId={folderId} />
    </DashboardLayout>
  )
}
