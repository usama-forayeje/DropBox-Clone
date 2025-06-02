import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");

    if (queryUserId && queryUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const starredFiles = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.isStarred, true),
          eq(files.isTrashed, false)
        )
      )
      .orderBy(files.updatedAt);

    return NextResponse.json(starredFiles);
  } catch (error) {
    console.error("Error fetching starred files:", error);
    return NextResponse.json(
      { error: "Failed to fetch starred files" },
      { status: 500 }
    );
  }
}
