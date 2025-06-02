import { db } from "@/lib/db"
import { files } from "@/lib/db/schema"
import { auth } from "@clerk/nextjs/server"
import { eq, and, sql } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryUserId = searchParams.get("userId")

    if (queryUserId && queryUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get basic file counts
    const [totalFiles] = await db
      .select({ count: sql`count(*)` })
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrashed, false)))

    const [totalSize] = await db
      .select({ size: sql`sum(${files.size})` })
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrashed, false)))

    const [starredFiles] = await db
      .select({ count: sql`count(*)` })
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isStarred, true), eq(files.isTrashed, false)))

    const [trashedFiles] = await db
      .select({ count: sql`count(*)` })
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrashed, true)))

    const [folders] = await db
      .select({ count: sql`count(*)` })
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isFolder, true), eq(files.isTrashed, false)))

    // Get file type counts
    const [images] = await db
      .select({ count: sql`count(*)` })
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.isTrashed, false),
          eq(files.isFolder, false),
          sql`${files.type} LIKE 'image/%'`,
        ),
      )

    const [videos] = await db
      .select({ count: sql`count(*)` })
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.isTrashed, false),
          eq(files.isFolder, false),
          sql`${files.type} LIKE 'video/%'`,
        ),
      )

    const [audio] = await db
      .select({ count: sql`count(*)` })
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.isTrashed, false),
          eq(files.isFolder, false),
          sql`${files.type} LIKE 'audio/%'`,
        ),
      )

    const [documents] = await db
      .select({ count: sql`count(*)` })
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.isTrashed, false),
          eq(files.isFolder, false),
          sql`${files.type} NOT LIKE 'image/%' AND ${files.type} NOT LIKE 'video/%' AND ${files.type} NOT LIKE 'audio/%'`,
        ),
      )

    const stats = {
      totalFiles: Number(totalFiles.count) || 0,
      totalSize: Number(totalSize.size) || 0,
      starredFiles: Number(starredFiles.count) || 0,
      trashedFiles: Number(trashedFiles.count) || 0,
      folders: Number(folders.count) || 0,
      images: Number(images.count) || 0,
      videos: Number(videos.count) || 0,
      audio: Number(audio.count) || 0,
      documents: Number(documents.count) || 0,
      storageUsed: Number(totalSize.size) || 0,
      storageLimit: 107374182400, // 100GB
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
