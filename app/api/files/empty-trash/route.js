import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(request, params) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { fileId } = await params;
    if (!fileId) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }
  } catch (error) {}
}
