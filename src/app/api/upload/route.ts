import { NextRequest, NextResponse } from "next/server";
import { uploadAudio, getPresignedUploadUrl } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, contentType, filename } = body as {
      action: "presigned" | "direct";
      contentType?: string;
      filename?: string;
    };

    const ext = filename?.split(".").pop() || "wav";
    const key = `uploads/${uuidv4()}.${ext}`;
    const ct = contentType || "audio/wav";

    if (action === "presigned") {
      const url = await getPresignedUploadUrl(key, ct);
      return NextResponse.json({
        success: true,
        data: { uploadUrl: url, key, contentType: ct },
      });
    }

    // Direct upload from request body
    const formData = await req.formData?.();
    if (formData) {
      const file = formData.get("file") as File | null;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const publicUrl = await uploadAudio(key, buffer, ct);
        return NextResponse.json({
          success: true,
          data: { url: publicUrl, key },
        });
      }
    }

    return NextResponse.json(
      { success: false, error: "No file provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
