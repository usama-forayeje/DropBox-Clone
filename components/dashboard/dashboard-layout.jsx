"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { UserButton } from "@clerk/nextjs"
import { Cloud, Search, Plus, Home, Star, Trash2, Settings, HelpCircle, Menu, X, File, Folder, HardDrive } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import UploadDialog from "./upload-dialog"
import CreateFolderDialog from "./create-folder-dialog"

const navigation = [
  { name: "My Files", href: "/dashboard", icon: Home },
  { name: "Starred", href: "/dashboard/starred", icon: Star },
  { name: "Trash", href: "/dashboard/trash", icon: Trash2 },
]

const stats = [
  { name: "Total Files", value: "1,248", change: "+12% from last month", icon: File },
  { name: "Folders", value: "48", description: "Organized collections", icon: Folder },
  { name: "Starred", value: "32", description: "Quick access files", icon: Star },
  { name: "In Trash", value: "15", description: "Can be restored", icon: Trash2 },
]

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const pathname = usePathname()

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Premium Sidebar */}
      <aside className={cn(
        "fixed z-40 inset-y-0 left-0 w-72 bg-white border-r transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full",
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-3">
            <Cloud className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">CloudBox</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-3">
            <Button
              onClick={() => {
                setUploadOpen(true)
                handleNavClick()
              }}
              className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-3 h-4 w-4" />
              Upload Files
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreateFolderOpen(true)
                handleNavClick()
              }}
              className="w-full justify-start"
            >
              <Plus className="mr-3 h-4 w-4" />
              New Folder
            </Button>
          </div>

          <Separator className="my-4" />

          <nav className="space-y-1 px-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <Separator className="my-4" />

          <div className="space-y-1 px-4">
            <Link
              href="/dashboard/settings"
              onClick={handleNavClick}
              className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>Settings</span>
            </Link>
            <Link
              href="/help"
              onClick={handleNavClick}
              className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <HelpCircle className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>Help</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Premium Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Premium Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search files and folders..."
                  className="pl-10"
                />
              </div>
            </div>

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                  rootBox: "h-10 w-10"
                }
              }}
            />
          </div>
        </header>

        {/* Premium Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* File Browser */}
            <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Premium Dialogs */}
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <CreateFolderDialog open={createFolderOpen} onOpenChange={setCreateFolderOpen} />
    </div>
  )
}