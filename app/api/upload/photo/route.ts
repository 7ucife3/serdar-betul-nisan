import { NextResponse } from "next/server";
import { saveBase64Image } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dataUrl, isHd } = body as { dataUrl: string; isHd?: boolean };

    if (!dataUrl) {
      return NextResponse.json(
        { success: false, error: "Görsel verisi eksik." },
        { status: 400 }
      );
    }

    const prefix = isHd ? "orig" : "thumb";
    const fileUrl = await saveBase64Image(dataUrl, prefix);

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Single file upload error:", error);
    return NextResponse.json(
      { success: false, error: "Fotoğraf yüklenemedi." },
      { status: 500 }
    );
  }
}
