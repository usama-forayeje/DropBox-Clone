import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import StarredView from "@/components/dashboard/starred-view"

export default async function StarredPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <DashboardLayout>
      <StarredView userId={userId} />
    </DashboardLayout>
  )
}
