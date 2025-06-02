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

import { Folder, File, ImageIcon, FileText, Video, Music, Archive, MoreVertical, Star, Trash2, Download, Share, Edit, Eye, Grid3X3, List, ArrowLeft } from 'lucide-react'
import { formatBytes, formatDate } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"





export default function FileExplorer({ userId, parentId }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchFiles()
  }, [parentId])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('userId', userId)
      if (parentId) params.set('parentId', parentId)

      const response = await fetch(`/api/files?${params}`)
      if (!response.ok) throw new Error('Failed to fetch files')
      
      const data = await response.json()
      console.log(data) 
      setFiles(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStarFile = async (fileId) => {
    try {
      const response = await fetch(`/api/files/${fileId}/star`, {
        method: 'PATCH'
      })
      if (!response.ok) throw new Error('Failed to star file')
      
      const updatedFile = await response.json()
      setFiles(files.map(file => 
        file.id === fileId ? { ...file, isStarred: updatedFile.isStarred } : file
      ))
      
      toast({
        title: updatedFile.isStarred ? "File starred" : "File unstarred",
        description: `${updatedFile.name} has been ${updatedFile.isStarred ? 'starred' : 'unstarred'}`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update file",
        variant: "destructive"
      })
    }
  }

  const handleMoveToTrash = async (fileId) => {
    try {
      const response = await fetch(`/api/files/${fileId}/trash`, {
        method: 'PATCH'
      })
      if (!response.ok) throw new Error('Failed to move to trash')
      
      setFiles(files.filter(file => file.id !== fileId))
      toast({
        title: "File moved to trash",
        description: "The file has been moved to trash"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move file to trash",
        variant: "destructive"
      })
    }
  }

  const handleDeletePermanently = async (fileId) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete file')
      
      setFiles(files.filter(file => file.id !== fileId))
      toast({
        title: "File deleted",
        description: "The file has been permanently deleted"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive"
      })
    }
  }

  const getFileIcon = (type, isFolder) => {
    if (isFolder) return Folder
    if (type.startsWith('image/')) return ImageIcon
    if (type.startsWith('video/')) return Video
    if (type.startsWith('audio/')) return Music
    if (type.includes('pdf') || type.includes('document')) return FileText
    if (type.includes('zip') || type.includes('rar')) return Archive
    return File
  }

  const getFileTypeColor = (type, isFolder) => {
    if (isFolder) return 'bg-blue-100 text-blue-800'
    if (type.startsWith('image/')) return 'bg-green-100 text-green-800'
    if (type.startsWith('video/')) return 'bg-purple-100 text-purple-800'
    if (type.startsWith('audio/')) return 'bg-pink-100 text-pink-800'
    if (type.includes('pdf')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array?.from({ length: 8 }).map((_, i) => (
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
          {parentId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {parentId ? 'Folder Contents' : 'My Files'}
          </h1>
          <Badge variant="secondary">
            {files.length} {files.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-gray-100' : ''}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-gray-100' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Files Grid/List */}
      {files.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
          <p className="text-gray-500">Upload your first file to get started</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => {
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
                    
                    {file.isStarred && (
                      <Star className="absolute top-2 right-2 h-4 w-4 text-yellow-500 fill-current" />
                    )}

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
                        <DropdownMenuItem onClick={() => handleStarFile(file.id)}>
                          <Star className="mr-2 h-4 w-4" />
                          {file.isStarred ? 'Unstar' : 'Star'}
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
                        <DropdownMenuItem 
                          onClick={() => handleMoveToTrash(file.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Move to trash
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {file.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <Badge 
                        variant="secondary" 
                        className={getFileTypeColor(file.type, file.isFolder)}
                      >
                        {file.isFolder ? 'Folder' : file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                      {!file.isFolder && (
                        <span>{formatBytes(file.size)}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(file.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-gray-700">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Modified</div>
          </div>
          {files.map((file) => {
            const FileIcon = getFileIcon(file.type, file.isFolder)
            return (
              <div key={file.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 group">
                <div className="col-span-6 flex items-center space-x-3">
                  <FileIcon className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900 truncate">{file.name}</span>
                  {file.isStarred && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <div className="col-span-2 flex items-center">
                  <Badge 
                    variant="secondary" 
                    className={getFileTypeColor(file.type, file.isFolder)}
                  >
                    {file.isFolder ? 'Folder' : file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Badge>
                </div>
                <div className="col-span-2 flex items-center text-sm text-gray-500">
                  {file.isFolder ? '—' : formatBytes(file.size)}
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">{formatDate(file.createdAt)}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                      <DropdownMenuItem onClick={() => handleStarFile(file.id)}>
                        <Star className="mr-2 h-4 w-4" />
                        {file.isStarred ? 'Unstar' : 'Star'}
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
                      <DropdownMenuItem 
                        onClick={() => handleMoveToTrash(file.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Move to trash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file.
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
