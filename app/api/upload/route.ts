import { NextResponse } from "next/server";
import { addPosts, saveBase64Image } from "@/lib/storage";
import { PhotoItem, PhotoPost } from "@/lib/types";

export const dynamic = "force-dynamic";

interface UploadPhotoInput {
  dataUrl: string;
  originalDataUrl?: string;
  caption?: string;
}

interface UploadPostInput {
  photos: UploadPhotoInput[];
  message?: string;
  isGroup: boolean;
  isHd?: boolean;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestName, items } = body as {
      guestName: string;
      items: UploadPostInput[];
    };

    if (!guestName || !guestName.trim()) {
      return NextResponse.json(
        { success: false, error: "Lütfen isminizi belirtin." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Yüklenecek fotoğraf bulunamadı." },
        { status: 400 }
      );
    }

    const createdPosts: PhotoPost[] = [];

    for (const item of items) {
      if (!item.photos || item.photos.length === 0) continue;

      const savedPhotos: PhotoItem[] = [];

      for (const p of item.photos) {
        if (!p.dataUrl) continue;

        // Save compressed web version
        const thumbUrl = await saveBase64Image(p.dataUrl, "thumb");

        // If HD original is provided, save raw version as well
        let originalUrl = thumbUrl;
        let isHd = false;

        if (p.originalDataUrl && p.originalDataUrl.trim() !== "") {
          originalUrl = await saveBase64Image(p.originalDataUrl, "orig");
          isHd = true;
        }

        savedPhotos.push({
          id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          url: thumbUrl,
          originalUrl: originalUrl,
          caption: p.caption?.trim() || undefined,
          isHd: isHd,
        });
      }

      if (savedPhotos.length > 0) {
        const newPost: PhotoPost = {
          id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          guestName: guestName.trim(),
          createdAt: new Date().toISOString(),
          message: item.message?.trim() || undefined,
          photos: savedPhotos,
          isGroup: item.isGroup,
          likes: 0,
        };
        createdPosts.push(newPost);
      }
    }

    if (createdPosts.length === 0) {
      return NextResponse.json(
        { success: false, error: "Hiçbir fotoğraf kaydedilemedi." },
        { status: 400 }
      );
    }

    await addPosts(createdPosts);

    return NextResponse.json({ success: true, posts: createdPosts });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Fotoğraflar kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
