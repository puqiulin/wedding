import { NextRequest, NextResponse } from "next/server";
import { savePublicAsset } from "@/lib/public-assets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  try {
    const asset = await savePublicAsset(file, formData.get("folder"));
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unsupported upload folder") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
