import { db } from "@/lib/db"
import { files } from "@/lib/db/schema"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { imagekit } = body

    if (!imagekit || !imagekit.url) {
      return NextResponse.json({ error: "Invalid imagekit data" }, { status: 400 })
    }

    const fileData = {
      name: imagekit.name || "Unknown",
      content: imagekit.content || "",
      size: imagekit.size || 0,
      type: imagekit.fileType || "image",
      fileUrl: imagekit.url,
      thumbnailUrl: imagekit.thumbnailUrl || imagekit.url,
      userId: userId,
      parentId: null,
      isFolder: false,
      isStarred: false,
      isTrashed: false,
    }

    const [newFile] = await db.insert(files).values(fileData).returning()

    return NextResponse.json({
      ...newFile,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 })
  }
}
