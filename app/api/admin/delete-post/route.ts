import { NextResponse } from "next/server";
import { deletePost } from "@/lib/storage";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Post ID eksik." },
        { status: 400 }
      );
    }

    const success = await deletePost(postId);
    if (success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Silme işlemi başarısız oldu." },
      { status: 500 }
    );
  } catch (error) {
    console.error("Admin delete-post error:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
