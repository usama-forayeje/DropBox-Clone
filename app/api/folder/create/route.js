import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";


export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name , parentId} = body;

        if (!name || name.trim() === "") {
            return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
        }

       
        if (parentId) {
            const [parentFolder] = await db.select()
            .from(files)
            .where(
                and(
                eq(files.id, parentId),
                eq(files.userId, userId),
                eq(files.isFolder, true)
            ))
            if (!parentFolder) {
                return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
            }
        }

        const folderData = {
            id: uuidv4(),
            name: name.trim(),
            path: `/folders/${userId}/${uuidv4()}`,
            size: 0,
            type: "folder",
            fileUrl: "",
            thumbnailUrl: null,
            userId: userId,
            parentId: parentId,
            isFolder: true,
            isStarred: false,
            isTrashed: false
        }

        const [newFolder] = await db.insert(files).values(folderData).returning();
        

        return NextResponse.json({ message: "Folder created successfully",success: true, folder: newFolder });
    } catch (error) {
        return NextResponse.json({ error: error.message || "Failed to create folder" }, { status: 500 });
    }
}