import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, size, type, fileUrl, thumbnailUrl, parentId } = body;

    if (!fileUrl || !name || !type || !size) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newFile = await prisma.file.create({
      data: {
        name,
        content: "",
        size,
        type,
        fileUrl,
        thumbnailUrl,
        userId,
        parentId,
        isFolder: false,
        isStarred: false,
        isTrashed: false,
      },
    });

    return NextResponse.json(newFile);
  } catch (error: any) {
    console.error("File upload save error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
