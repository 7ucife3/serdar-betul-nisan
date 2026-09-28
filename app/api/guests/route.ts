import { NextResponse } from "next/server";
import { registerGuest, getGuests } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const guests = await getGuests();
    return NextResponse.json({ success: true, guests });
  } catch (error) {
    console.error("Failed to fetch guests:", error);
    return NextResponse.json(
      { success: false, error: "Konuklar yüklenemedi." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, guestId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Lütfen geçerli bir isim girin." },
        { status: 400 }
      );
    }

    const guest = await registerGuest(name, guestId);
    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error("Guest registration error:", error);
    return NextResponse.json(
      { success: false, error: "Konuk kaydı oluşturulamadı." },
      { status: 500 }
    );
  }
}
