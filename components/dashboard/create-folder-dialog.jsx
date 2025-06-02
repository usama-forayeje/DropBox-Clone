"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@clerk/nextjs"
import { Folder } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { toast } from "sonner"


export default function CreateFolderDialog({ open, onOpenChange, parentId }) {
    const [folderName, setFolderName] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const { userId } = useAuth()

    const handleCreateFolder = async () => {
        if (!folderName.trim() || !userId) return

        setIsCreating(true)
        try {
            const response = await fetch("/api/folders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: folderName.trim(),
                    userId,
                    parentId: parentId || null,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to create folder")
            }

            toast({
                title: "Folder created",
                description: `"${folderName}" has been created successfully`,
            })

            setFolderName("")
            onOpenChange(false)

            // Refresh the page to show the new folder
            window.location.reload()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create folder",
                variant: "destructive",
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleCreateFolder()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Folder className="h-5 w-5 text-blue-600" />
                        <span>Create New Folder</span>
                    </DialogTitle>
                    <DialogDescription>Enter a name for your new folder</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="folder-name">Folder Name</Label>
                        <Input
                            id="folder-name"
                            placeholder="Enter folder name..."
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            onKeyPress={handleKeyPress}
                            autoFocus
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateFolder} disabled={!folderName.trim() || isCreating}>
                        {isCreating ? "Creating..." : "Create Folder"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
