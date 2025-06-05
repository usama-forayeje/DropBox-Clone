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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Folder,
    File,
    ImageIcon,
    FileText,
    Video,
    Music,
    Archive,
    MoreVertical,
    RotateCcw,
    Trash2,
    AlertTriangle,
} from "lucide-react"
import { formatBytes, formatDate } from "@/lib/utils"
import toast from "react-hot-toast"



export default function TrashView({ userId }) {
    const [trashedFiles, setTrashedFiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [fileToDelete, setFileToDelete] = useState(null)
    const [emptyTrashDialogOpen, setEmptyTrashDialogOpen] = useState(false)

    useEffect(() => {
        fetchTrashedFiles()
    }, [])

    const fetchTrashedFiles = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/files/trash?userId=${userId}`)
            if (!response.ok) throw new Error("Failed to fetch trashed files")

            const data = await response.json()
            setTrashedFiles(data)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load trashed files",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleRestoreFile = async (fileId) => {
        try {
            const response = await fetch(`/api/files/${fileId}/restore`, {
                method: "PATCH",
            })
            if (!response.ok) throw new Error("Failed to restore file")

            setTrashedFiles((files) => files.filter((file) => file.id !== fileId))
            toast({
                title: "File restored",
                description: "The file has been restored to its original location",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to restore file",
                variant: "destructive",
            })
        }
    }

    const handleDeletePermanently = async (fileId) => {
        try {
            const response = await fetch(`/api/files/${fileId}`, {
                method: "DELETE",
            })
            if (!response.ok) throw new Error("Failed to delete file")

            setTrashedFiles((files) => files.filter((file) => file.id !== fileId))
            toast({
                title: "File deleted",
                description: "The file has been permanently deleted",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete file",
                variant: "destructive",
            })
        }
    }

    const handleEmptyTrash = async () => {
        try {
            const response = await fetch(`/api/files/trash/empty`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            })
            if (!response.ok) throw new Error("Failed to empty trash")

            setTrashedFiles([])
            toast({
                title: "Trash emptied",
                description: "All files have been permanently deleted",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to empty trash",
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
                    <h1 className="text-2xl font-bold text-gray-900">Trash</h1>
                    <Badge variant="secondary">
                        {trashedFiles.length} {trashedFiles.length === 1 ? "item" : "items"}
                    </Badge>
                </div>

                {trashedFiles.length > 0 && (
                    <Button variant="destructive" onClick={() => setEmptyTrashDialogOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Empty Trash
                    </Button>
                )}
            </div>

            {/* Warning message */}
            {trashedFiles.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">
                                Files in trash will be automatically deleted after 30 days
                            </h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                You can restore files or delete them permanently from here.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Files Grid */}
            {trashedFiles.length === 0 ? (
                <div className="text-center py-12">
                    <Trash2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Trash is empty</h3>
                    <p className="text-gray-500">Files you delete will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {trashedFiles.map((file) => {
                        const FileIcon = getFileIcon(file.type, file.isFolder)
                        return (
                            <Card key={file.id} className="group hover:shadow-md transition-shadow opacity-75">
                                <div className="p-4">
                                    <div className="relative">
                                        {file.thumbnailUrl && !file.isFolder ? (
                                            <img
                                                src={file.thumbnailUrl || "/placeholder.svg"}
                                                alt={file.name}
                                                className="w-full h-32 object-cover rounded-lg mb-3 grayscale"
                                            />
                                        ) : (
                                            <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                                                <FileIcon className="h-12 w-12 text-gray-400" />
                                            </div>
                                        )}

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleRestoreFile(file.id)}>
                                                    <RotateCcw className="mr-2 h-4 w-4" />
                                                    Restore
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setFileToDelete(file.id)
                                                        setDeleteDialogOpen(true)
                                                    }}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete permanently
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
                                        <p className="text-xs text-gray-500">Deleted {formatDate(file.updatedAt)}</p>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Delete confirmation dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the file from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (fileToDelete) {
                                    handleDeletePermanently(fileToDelete)
                                    setFileToDelete(null)
                                }
                                setDeleteDialogOpen(false)
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Empty trash confirmation dialog */}
            <AlertDialog open={emptyTrashDialogOpen} onOpenChange={setEmptyTrashDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Empty trash?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete all {trashedFiles.length} files in trash. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                handleEmptyTrash()
                                setEmptyTrashDialogOpen(false)
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Empty trash
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
