import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextResponse } from "next/server";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const formUserId = formData.get("userId");
    const parentId = formData.get("parentId");

    if (formUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }

    if (parentId) {
      const [parentFolder] = await db
        .select()
        .from(files)
        .where(
          eq(files.id, parentId),
          eq(files.userId, userId),
          eq(files.isFolder, true)
        );
    } else {
      return NextResponse.json(
        { error: "Parent folder not found" },
        { status: 404 }
      );
    }

    if (
      !file.type.startsWith("image/" || file.type.startsWith("application/pdf"))
    ) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    const folderPath = parentId
      ? `/dropbox/${userId}/folder/${parentId}`
      : `/dropbox/${userId}`;
    const uniqueFileName = `${uuidv4()}.${file.name.split(".").pop() || "jpg"}`;

    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: uniqueFileName,
      folder: folderPath,
      useUniqueFileName: false,
    });

    const fileData = {
      name: file.name,
      path: uploadResponse.filePath,
      size: file.size,
      type: file.type,
      fileUrl: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || null,
      userId: userId,
      parentId: parentId,
      isFolder: false,
      isStarred: false,
      isTrashed: false,
    };

    const [newFile] = await db.insert("files").values(fileData).returning();

    return NextResponse.json(newFile);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to imagekit auth request" },
      { status: 500 }
    );
  }
}
