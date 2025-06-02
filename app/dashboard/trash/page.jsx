import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import TrashView from "@/components/dashboard/trash-view"

export default async function TrashPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <DashboardLayout>
      <TrashView userId={userId} />
    </DashboardLayout>
  )
}
