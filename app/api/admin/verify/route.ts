import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || "serdarbetul2026";

    if (password && password.trim() === adminPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Geçersiz yönetici şifresi." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Admin verify error:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
