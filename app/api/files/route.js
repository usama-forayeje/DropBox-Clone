import { db } from "@/lib/db"
import { files } from "@/lib/db/schema"
import { auth } from "@clerk/nextjs/server"
import { and, eq, isNull, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryUserId = searchParams.get("userId")
    const parentId = searchParams.get("parentId")
    const starred = searchParams.get("starred")
    const trashed = searchParams.get("trashed")

    if (queryUserId && queryUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const whereConditions = [eq(files.userId, userId)]

    // Add parent folder condition
    if (parentId) {
      whereConditions.push(eq(files.parentId, parentId))
    } else {
      whereConditions.push(isNull(files.parentId))
    }

    // Add starred filter
    if (starred === "true") {
      whereConditions.push(eq(files.isStarred, true))
    }

    // Add trash filter
    if (trashed === "true") {
      whereConditions.push(eq(files.isTrashed, true))
    } else {
      whereConditions.push(eq(files.isTrashed, false))
    }

    const userFiles = await db
      .select()
      .from(files)
      .where(and(...whereConditions))
      .orderBy(desc(files.isFolder), desc(files.updatedAt))

    return NextResponse.json(userFiles)
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch files" }, { status: 500 })
  }
}
