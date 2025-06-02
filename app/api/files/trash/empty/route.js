import { db } from "@/lib/db"
import { files } from "@/lib/db/schema"
import { auth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import ImageKit from "imagekit"

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
})

export async function DELETE(request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId: bodyUserId } = body

    if (bodyUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all trashed files for the user
    const trashedFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrashed, true)))

    // Delete files from ImageKit
    for (const file of trashedFiles) {
      if (!file.isFolder && file.fileUrl) {
        try {
          const urlParts = file.fileUrl.split("/")
          const imagekitFileId = urlParts[urlParts.length - 1].split(".")[0]
          await imagekit.deleteFile(imagekitFileId)
        } catch (imagekitError) {
          console.error(`Error deleting file ${file.id} from ImageKit:`, imagekitError)
          // Continue with other files
        }
      }
    }

    // Delete all trashed files from database
    await db.delete(files).where(and(eq(files.userId, userId), eq(files.isTrashed, true)))

    return NextResponse.json({
      message: "Trash emptied successfully",
      deletedCount: trashedFiles.length,
    })
  } catch (error) {
    console.error("Error emptying trash:", error)
    return NextResponse.json({ error: "Failed to empty trash" }, { status: 500 })
  }
}
