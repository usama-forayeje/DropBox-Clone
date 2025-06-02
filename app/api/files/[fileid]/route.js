import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = params;
    if (!fileId) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 });
    }

    // Get file details before deletion
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete from ImageKit if it's not a folder
    if (!file.isFolder && file.fileUrl) {
      try {
        // Extract file ID from ImageKit URL
        const urlParts = file.fileUrl.split("/");
        const imagekitFileId = urlParts[urlParts.length - 1].split(".")[0];
        await imagekit.deleteFile(imagekitFileId);
      } catch (imagekitError) {
        console.error("Error deleting from ImageKit:", imagekitError);
        // Continue with database deletion even if ImageKit deletion fails
      }
    }

    // Delete from database
    await db
      .delete(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
