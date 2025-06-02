import { db } from "@/lib/db"
import { files } from "@/lib/db/schema"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, parentId } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    // Validate folder name
    const folderName = name.trim()
    if (folderName.length > 255) {
      return NextResponse.json({ error: "Folder name too long" }, { status: 400 })
    }

    // Check if parent folder exists (if parentId provided)
    if (parentId) {
      const [parentFolder] = await db
        .select()
        .from(files)
        .where(
          and(eq(files.id, parentId), eq(files.userId, userId), eq(files.isFolder, true), eq(files.isTrashed, false)),
        )

      if (!parentFolder) {
        return NextResponse.json({ error: "Parent folder not found" }, { status: 404 })
      }
    }

    // Check for duplicate folder names in the same directory
    const existingFolder = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.name, folderName),
          eq(files.userId, userId),
          eq(files.isFolder, true),
          eq(files.isTrashed, false),
          parentId ? eq(files.parentId, parentId) : eq(files.parentId, null),
        ),
      )

    if (existingFolder.length > 0) {
      return NextResponse.json({ error: "A folder with this name already exists" }, { status: 409 })
    }

    const folderData = {
      name: folderName,
      content: "",
      size: 0,
      type: "folder",
      fileUrl: "",
      thumbnailUrl: null,
      userId: userId,
      parentId: parentId || null,
      isFolder: true,
      isStarred: false,
      isTrashed: false,
    }

    const [newFolder] = await db.insert(files).values(folderData).returning()

    return NextResponse.json({
      ...newFolder,
      message: "Folder created successfully",
    })
  } catch (error) {
    console.error("Error creating folder:", error)
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 })
  }
}
