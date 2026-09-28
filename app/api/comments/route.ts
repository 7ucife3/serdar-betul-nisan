import { NextResponse } from "next/server";
import { addCommentToPost } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, author, text, parentId } = body;

    if (!postId || !author || !text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "Tüm alanlar gereklidir." },
        { status: 400 }
      );
    }

    const result = await addCommentToPost(postId, author, text, parentId);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Gönderi bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      comment: result.comment,
      comments: result.post.comments,
    });
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json(
      { success: false, error: "Yorum kaydedilemedi." },
      { status: 500 }
    );
  }
}
