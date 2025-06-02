import { db } from "@/lib/db"
import { files } from "@/lib/db/schema"
import { auth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function PATCH(request, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileId } = params
    if (!fileId) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 })
    }

    // Check if file exists and belongs to user
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId), eq(files.isTrashed, true)))

    if (!file) {
      return NextResponse.json({ error: "File not found in trash" }, { status: 404 })
    }

    // Restore from trash
    const [updatedFile] = await db
      .update(files)
      .set({
        isTrashed: false,
        updatedAt: new Date(),
      })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning()

    return NextResponse.json(updatedFile)
  } catch (error) {
    console.error("Error restoring file:", error)
    return NextResponse.json({ error: "Failed to restore file" }, { status: 500 })
  }
}
