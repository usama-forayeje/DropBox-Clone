import { getAuth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { files } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"

const CreateFolderSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().nullable().optional(),
})

export async function POST(req) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = CreateFolderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, parentId } = validation.data

    // Validate parent folder if provided
    if (parentId) {
      const [parentFolder] = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.id, parentId),
            eq(files.userId, userId),
            eq(files.isFolder, true),
            eq(files.isTrashed, false)
          )
        )

      if (!parentFolder) {
        return NextResponse.json(
          { error: "Parent folder not found or no permission" },
          { status: 404 }
        )
      }
    }

    // Check for duplicate
    const [existingFolder] = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.name, name.trim()),
          eq(files.userId, userId),
          eq(files.isFolder, true),
          eq(files.isTrashed, false),
          parentId ? eq(files.parentId, parentId) : eq(files.parentId, null)
        )
      )

    if (existingFolder) {
      return NextResponse.json(
        { error: "A folder with this name already exists here" },
        { status: 409 }
      )
    }

    // Insert
    const [newFolder] = await db
      .insert(files)
      .values({
        name: name.trim(),
        content: "",
        size: 0,
        type: "folder",
        fileUrl: "",
        userId,
        parentId: parentId || null,
        isFolder: true,
        isTrashed: false,
        isStarred: false,
      })
      .returning()

    return NextResponse.json({
      success: true,
      folder: newFolder,
      message: "Folder created successfully",
    })
  } catch (error) {
    console.error("[FOLDER_CREATION_ERROR]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
