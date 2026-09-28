import { NextResponse } from "next/server";
import { createAllPhotosZip } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const zipBuffer = await createAllPhotosZip();

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="Serdar_Betul_Nisan_Fotograflari_${new Date().toISOString().slice(0, 10)}.zip"`,
      },
    });
  } catch (error) {
    console.error("ZIP download error:", error);
    return NextResponse.json(
      { success: false, error: "ZIP arşivi oluşturulamadı." },
      { status: 500 }
    );
  }
}
