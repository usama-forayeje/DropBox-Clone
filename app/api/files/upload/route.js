import { db } from "@/lib/db"
import { files } from "@/lib/db/schema"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import ImageKit from "imagekit"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
})

export async function POST(request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const formUserId = formData.get("userId")
    const parentId = formData.get("parentId")

    if (formUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 400 })
    }

    // Validate parent folder if provided
    if (parentId) {
      const [parentFolder] = await db
        .select()
        .from(files)
        .where(eq(files.id, parentId) && eq(files.userId, userId) && eq(files.isFolder, true))

      if (!parentFolder) {
        return NextResponse.json({ error: "Parent folder not found" }, { status: 404 })
      }
    }

    // Validate file type
    const allowedTypes = [
      "image/",
      "video/",
      "audio/",
      "application/pdf",
      "text/",
      "application/msword",
      "application/vnd.openxmlformats-officedocument",
    ]

    const isValidType = allowedTypes.some((type) => file.type.startsWith(type))
    if (!isValidType) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 100MB" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(buffer)

    // Create folder path for ImageKit
    const folderPath = parentId ? `/cloudbox/${userId}/folder/${parentId}` : `/cloudbox/${userId}`

    const uniqueFileName = `${uuidv4()}.${file.name.split(".").pop() || "file"}`

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: uniqueFileName,
      folder: folderPath,
      useUniqueFileName: false,
      tags: [userId, file.type.split("/")[0]],
    })

    // Save to database
    const fileData = {
      name: file.name,
      content: "",
      size: file.size,
      type: file.type,
      fileUrl: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || null,
      userId: userId,
      parentId: parentId || null,
      isFolder: false,
      isStarred: false,
      isTrashed: false,
    }

    const [newFile] = await db.insert(files).values(fileData).returning()

    return NextResponse.json({
      ...newFile,
      uploadResponse: {
        fileId: uploadResponse.fileId,
        name: uploadResponse.name,
        url: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl,
      },
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 })
  }
}
