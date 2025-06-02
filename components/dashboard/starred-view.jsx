"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Folder,
    File,
    ImageIcon,
    FileText,
    Video,
    Music,
    Archive,
    MoreVertical,
    Star,
    Download,
    Share,
    Edit,
    Eye,
    Trash2,
} from "lucide-react"
import { formatBytes, formatDate } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"


export default function StarredView({ userId }) {
    const [starredFiles, setStarredFiles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStarredFiles()
    }, [])

    const fetchStarredFiles = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/files/starred?userId=${userId}`)
            if (!response.ok) throw new Error("Failed to fetch starred files")

            const data = await response.json()
            setStarredFiles(data)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load starred files",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleUnstarFile = async (fileId) => {
        try {
            const response = await fetch(`/api/files/${fileId}/star`, {
                method: "PATCH",
            })
            if (!response.ok) throw new Error("Failed to unstar file")

            setStarredFiles((files) => files.filter((file) => file.id !== fileId))
            toast({
                title: "File unstarred",
                description: "The file has been removed from starred",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to unstar file",
                variant: "destructive",
            })
        }
    }

    const handleMoveToTrash = async (fileId) => {
        try {
            const response = await fetch(`/api/files/${fileId}/trash`, {
                method: "PATCH",
            })
            if (!response.ok) throw new Error("Failed to move to trash")

            setStarredFiles((files) => files.filter((file) => file.id !== fileId))
            toast({
                title: "File moved to trash",
                description: "The file has been moved to trash",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to move file to trash",
                variant: "destructive",
            })
        }
    }

    const getFileIcon = (type, isFolder) => {
        if (isFolder) return Folder
        if (type.startsWith("image/")) return ImageIcon
        if (type.startsWith("video/")) return Video
        if (type.startsWith("audio/")) return Music
        if (type.includes("pdf") || type.includes("document")) return FileText
        if (type.includes("zip") || type.includes("rar")) return Archive
        return File
    }

    const getFileTypeColor = (type, isFolder) => {
        if (isFolder) return "bg-blue-100 text-blue-800"
        if (type.startsWith("image/")) return "bg-green-100 text-green-800"
        if (type.startsWith("video/")) return "bg-purple-100 text-purple-800"
        if (type.startsWith("audio/")) return "bg-pink-100 text-pink-800"
        if (type.includes("pdf")) return "bg-red-100 text-red-800"
        return "bg-gray-100 text-gray-800"
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i} className="p-4">
                            <div className="space-y-3">
                                <div className="h-32 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-gray-900">Starred Files</h1>
                    <Badge variant="secondary">
                        {starredFiles.length} {starredFiles.length === 1 ? "item" : "items"}
                    </Badge>
                </div>
            </div>

            {/* Files Grid */}
            {starredFiles.length === 0 ? (
                <div className="text-center py-12">
                    <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No starred files</h3>
                    <p className="text-gray-500">Files you star will appear here for quick access</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {starredFiles.map((file) => {
                        const FileIcon = getFileIcon(file.type, file.isFolder)
                        return (
                            <Card key={file.id} className="group hover:shadow-md transition-shadow">
                                <div className="p-4">
                                    <div className="relative">
                                        {file.thumbnailUrl && !file.isFolder ? (
                                            <img
                                                src={file.thumbnailUrl || "/placeholder.svg"}
                                                alt={file.name}
                                                className="w-full h-32 object-cover rounded-lg mb-3"
                                            />
                                        ) : (
                                            <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                                                <FileIcon className="h-12 w-12 text-gray-400" />
                                            </div>
                                        )}

                                        <Star className="absolute top-2 right-2 h-4 w-4 text-yellow-500 fill-current" />

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                {file.isFolder ? (
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard?folder=${file.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Open
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem asChild>
                                                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </a>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem asChild>
                                                    <a href={file.fileUrl} download>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUnstarFile(file.id)}>
                                                    <Star className="mr-2 h-4 w-4" />
                                                    Unstar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Share className="mr-2 h-4 w-4" />
                                                    Share
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleMoveToTrash(file.id)} className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Move to trash
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-medium text-sm text-gray-900 truncate">{file.name}</h3>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <Badge variant="secondary" className={getFileTypeColor(file.type, file.isFolder)}>
                                                {file.isFolder ? "Folder" : file.type.split("/")[1]?.toUpperCase() || "FILE"}
                                            </Badge>
                                            {!file.isFolder && <span>{formatBytes(file.size)}</span>}
                                        </div>
                                        <p className="text-xs text-gray-500">{formatDate(file.createdAt)}</p>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
