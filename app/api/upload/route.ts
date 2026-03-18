import { NextRequest, NextResponse } from "next/server";
import { createPresignedUploadUrl } from "@/lib/s3";

export async function POST(req: NextRequest) {
  const { filename, contentType, folder = "album" } = await req.json();
  const key = `${folder}/${Date.now()}-${filename}`;
  const url = await createPresignedUploadUrl(key, contentType);
  return NextResponse.json({ url, key });
}
