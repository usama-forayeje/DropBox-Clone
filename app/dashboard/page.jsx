import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import FileExplorer from "@/components/dashboard/file-explorer"
import DashboardStats from "@/components/dashboard/dashboard-stats"

export default async function DashboardPage({ searchParams }) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const folderId = searchParams?.folder || null

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {!folderId && <DashboardStats userId={userId} />}
        <FileExplorer userId={userId} parentId={folderId} />
      </div>
    </DashboardLayout>
  )
}
