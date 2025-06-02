"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { HardDrive, Files, Star, Trash2, TrendingUp, FolderOpen, ImageIcon, Video, Music } from "lucide-react"
import { formatBytes } from "@/lib/utils"

export default function DashboardStats({ userId }) {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    starredFiles: 0,
    trashedFiles: 0,
    folders: 0,
    images: 0,
    videos: 0,
    audio: 0,
    documents: 0,
    storageUsed: 0,
    storageLimit: 107374182400, // 100GB in bytes
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [userId])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stats?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-blue-600" />
                Storage Usage
              </CardTitle>
              <CardDescription>
                {formatBytes(stats.storageUsed)} of {formatBytes(stats.storageLimit)} used
              </CardDescription>
            </div>
            <Badge variant={storagePercentage > 80 ? "destructive" : "secondary"}>
              {storagePercentage.toFixed(1)}% used
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={storagePercentage} className="h-3" />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>0 GB</span>
            <span>100 GB</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <Files className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Folders</CardTitle>
            <FolderOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.folders}</div>
            <p className="text-xs text-muted-foreground">Organized collections</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Starred</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.starredFiles}</div>
            <p className="text-xs text-muted-foreground">Quick access files</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Trash</CardTitle>
            <Trash2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trashedFiles}</div>
            <p className="text-xs text-muted-foreground">Can be restored</p>
          </CardContent>
        </Card>
      </div>

      {/* File Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">File Types</CardTitle>
          <CardDescription>Breakdown of your files by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <ImageIcon className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">{stats.images}</p>
                <p className="text-sm text-gray-600">Images</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Video className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium">{stats.videos}</p>
                <p className="text-sm text-gray-600">Videos</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
              <Music className="h-8 w-8 text-pink-600" />
              <div>
                <p className="font-medium">{stats.audio}</p>
                <p className="text-sm text-gray-600">Audio</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Files className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">{stats.documents}</p>
                <p className="text-sm text-gray-600">Documents</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
