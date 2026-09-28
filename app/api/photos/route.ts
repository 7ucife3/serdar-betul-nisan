import { NextResponse } from "next/server";
import { getPosts, toggleLikePost } from "@/lib/storage";
import { SortOption } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = (searchParams.get("sort") as SortOption) || "newest";
    const guest = searchParams.get("guest");

    let posts = await getPosts();

    // Filter by guest if requested
    if (guest && guest.trim() !== "" && guest !== "all") {
      posts = posts.filter(
        (p) => p.guestName.toLowerCase().trim() === guest.toLowerCase().trim()
      );
    }

    // Sort
    if (sort === "newest") {
      posts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sort === "oldest") {
      posts.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sort === "name_asc") {
      posts.sort((a, b) => a.guestName.localeCompare(b.guestName, "tr"));
    } else if (sort === "name_desc") {
      posts.sort((a, b) => b.guestName.localeCompare(a.guestName, "tr"));
    }

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("Failed to get posts:", error);
    return NextResponse.json(
      { success: false, error: "Fotoğraflar yüklenemedi" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Post ID gerekli" },
        { status: 400 }
      );
    }

    const likes = await toggleLikePost(postId);
    return NextResponse.json({ success: true, likes });
  } catch (error) {
    console.error("Failed to like post:", error);
    return NextResponse.json(
      { success: false, error: "Beğeni kaydedilemedi" },
      { status: 500 }
    );
  }
}
