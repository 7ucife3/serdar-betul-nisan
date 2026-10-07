import fs from "fs/promises";
import path from "path";
import { CommentItem, GuestRecord, PhotoPost } from "./types";
import JSZip from "jszip";
import { supabase } from "./supabaseClient";
import { r2Client, r2BucketName, r2PublicUrl } from "./r2Client";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const DATA_DIR = path.join(process.cwd(), "data");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const GUESTS_FILE = path.join(DATA_DIR, "guests.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Initial sample posts to make the celebration feel warm and lively immediately
const INITIAL_POSTS: PhotoPost[] = [
  {
    id: "post-1",
    guestName: "Zeynep & Emre",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    message: "Bir ömür boyu mutluluklar dileriz! Harika görünüyorsunuz ✨",
    isGroup: true,
    likes: 14,
    comments: [
      {
        id: "comm-1",
        author: "Ahmet Kaya",
        text: "Gerçekten rüya gibi bir nişan olmuş!",
        createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
      {
        id: "comm-2",
        author: "Zeynep Demir",
        text: "Çok teşekkür ederiz Ahmet abi!",
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        parentId: "comm-1",
      },
    ],
    photos: [
      {
        id: "p1-1",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        caption: "Nişan yüzükleri takılırken",
      },
      {
        id: "p1-2",
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
        caption: "Tebrik anı",
      },
      {
        id: "p1-3",
        url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
        caption: "Masalardan kareler",
      },
      {
        id: "p1-4",
        url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
        caption: "Kutlama pastası",
      },
      {
        id: "p1-5",
        url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
        caption: "Gülümseyen konuklar",
      },
      {
        id: "p1-6",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        caption: "Dans anı",
      },
    ],
  },
  {
    id: "post-2",
    guestName: "Murat Çelik",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    message: "Kardeşim Serdar ve güzel gelinimiz Betül, her şey kusursuz! Çok mutlu olun.",
    isGroup: false,
    likes: 22,
    comments: [
      {
        id: "comm-3",
        author: "Betül (Gelin)",
        text: "Canım Murat çok teşekkür ederiz, iyi ki varsın!",
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
    ],
    photos: [
      {
        id: "p2-1",
        url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80",
        caption: "Giriş anı",
      },
    ],
  },
  {
    id: "post-3",
    guestName: "Selin & Burak",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    message: "En tatlı çiftimiz! Sevginiz daim olsun ❤️",
    isGroup: true,
    likes: 9,
    comments: [],
    photos: [
      {
        id: "p3-1",
        url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
        caption: "Serdar & Betül sahneye çıkarken",
      },
      {
        id: "p3-2",
        url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
        caption: "Yüzük tepsisi",
      },
      {
        id: "p3-3",
        url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
        caption: "Kahkahalarla dolu anlar",
      },
    ],
  },
  {
    id: "post-4",
    guestName: "Gamze Yıldız",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    message: "Gecenin en güzel karesi ✨",
    isGroup: false,
    likes: 18,
    comments: [],
    photos: [
      {
        id: "p4-1",
        url: "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?auto=format&fit=crop&w=1000&q=80",
      },
    ],
  },
];

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export async function getPosts(): Promise<PhotoPost[]> {
  // If Supabase configured, fetch from cloud database
  if (supabase) {
    try {
      const [postsRes, commsRes] = await Promise.all([
        supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("comments")
          .select("*")
          .order("created_at", { ascending: true }),
      ]);

      if (postsRes.error) throw postsRes.error;
      if (commsRes.error) throw commsRes.error;

      const dbPosts = postsRes.data || [];
      const dbComments = commsRes.data || [];

      const mappedPosts: PhotoPost[] = dbPosts.map((p) => {
        const postComments: CommentItem[] = dbComments
          .filter((c) => c.post_id === p.id)
          .map((c) => ({
            id: c.id,
            author: c.author,
            text: c.text,
            createdAt: c.created_at,
            parentId: c.parent_id || undefined,
          }));

        return {
          id: p.id,
          guestName: p.guest_name,
          createdAt: p.created_at,
          message: p.message || undefined,
          photos: p.photos || [],
          isGroup: p.is_group ?? false,
          likes: p.likes ?? 0,
          comments: postComments,
        };
      });

      return mappedPosts;
    } catch (err) {
      console.error("Supabase getPosts error, falling back to local:", err);
    }
  }

  // Fallback to local JSON storage
  await ensureDirs();
  try {
    const data = await fs.readFile(POSTS_FILE, "utf-8");
    const posts: PhotoPost[] = JSON.parse(data);
    return posts;
  } catch {
    await fs.writeFile(POSTS_FILE, JSON.stringify(INITIAL_POSTS, null, 2), "utf-8");
    return INITIAL_POSTS;
  }
}

export async function addPosts(newPosts: PhotoPost[]): Promise<PhotoPost[]> {
  if (supabase) {
    try {
      const dbInserts = newPosts.map((p) => ({
        id: p.id,
        guest_name: p.guestName,
        created_at: p.createdAt,
        message: p.message || null,
        photos: p.photos,
        is_group: p.isGroup,
        likes: p.likes || 0,
      }));

      const { error } = await supabase.from("posts").insert(dbInserts);
      if (error) throw error;

      return await getPosts();
    } catch (err) {
      console.error("Supabase addPosts error, falling back to local:", err);
    }
  }

  // Fallback to local
  const current = await getPosts();
  const updated = [...newPosts, ...current];
  await ensureDirs();
  await fs.writeFile(POSTS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}

export async function toggleLikePost(postId: string): Promise<number | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc("increment_likes", {
        target_post_id: postId,
      });

      if (!error && typeof data === "number") {
        return data;
      }

      // If RPC doesn't exist, manual update
      const { data: post } = await supabase
        .from("posts")
        .select("likes")
        .eq("id", postId)
        .single();

      if (post) {
        const newLikes = (post.likes || 0) + 1;
        await supabase
          .from("posts")
          .update({ likes: newLikes })
          .eq("id", postId);
        return newLikes;
      }
    } catch (err) {
      console.error("Supabase toggleLikePost error:", err);
    }
  }

  // Fallback to local
  const posts = await getPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  post.likes = (post.likes || 0) + 1;
  await ensureDirs();
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), "utf-8");
  return post.likes;
}

export async function addCommentToPost(
  postId: string,
  author: string,
  text: string,
  parentId?: string
): Promise<{ comment: CommentItem; post: PhotoPost } | null> {
  const commId = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  if (supabase) {
    try {
      const { error } = await supabase.from("comments").insert({
        id: commId,
        post_id: postId,
        author: author.trim(),
        text: text.trim(),
        created_at: createdAt,
        parent_id: parentId || null,
      });

      if (error) throw error;

      const allPosts = await getPosts();
      const updatedPost = allPosts.find((p) => p.id === postId);
      if (updatedPost) {
        const newComm: CommentItem = {
          id: commId,
          author: author.trim(),
          text: text.trim(),
          createdAt,
          parentId: parentId || undefined,
        };
        return { comment: newComm, post: updatedPost };
      }
    } catch (err) {
      console.error("Supabase addCommentToPost error:", err);
    }
  }

  // Fallback to local
  const posts = await getPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  if (!post.comments) post.comments = [];

  const newComment: CommentItem = {
    id: commId,
    author: author.trim(),
    text: text.trim(),
    createdAt,
    parentId: parentId || undefined,
  };

  post.comments.push(newComment);
  await ensureDirs();
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), "utf-8");
  return { comment: newComment, post };
}

export async function saveBase64Image(
  base64Data: string,
  prefix = "photo"
): Promise<string> {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let ext = "jpg";
  let mimeType = "image/jpeg";
  let buffer: Buffer;

  if (matches && matches.length === 3) {
    mimeType = matches[1];
    if (mimeType.includes("png")) ext = "png";
    else if (mimeType.includes("webp")) ext = "webp";
    else if (mimeType.includes("gif")) ext = "gif";
    buffer = Buffer.from(matches[2], "base64");
  } else {
    buffer = Buffer.from(base64Data, "base64");
  }

  const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

  // If Cloudflare R2 client is configured, upload directly to R2 bucket
  if (r2Client && r2BucketName && r2PublicUrl) {
    try {
      const command = new PutObjectCommand({
        Bucket: r2BucketName,
        Key: filename,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: "public, max-age=31536000, immutable",
      });

      await r2Client.send(command);
      const cleanPublicUrl = r2PublicUrl.endsWith("/")
        ? r2PublicUrl.slice(0, -1)
        : r2PublicUrl;
      return `${cleanPublicUrl}/${filename}`;
    } catch (err) {
      console.error("Cloudflare R2 upload error, falling back to local:", err);
    }
  }

  // Fallback to local disk storage
  await ensureDirs();
  const filePath = path.join(UPLOADS_DIR, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}

export async function createAllPhotosZip(): Promise<Buffer> {
  await ensureDirs();
  const posts = await getPosts();
  const zip = new JSZip();

  let count = 0;
  for (const post of posts) {
    const safeGuestName = post.guestName.replace(/[^a-zA-Z0-9_\u00C0-\u017F]/g, "_");
    const folder = zip.folder(safeGuestName) || zip;

    for (let i = 0; i < post.photos.length; i++) {
      const photo = post.photos[i];
      const targetUrl = photo.originalUrl || photo.url;

      if (targetUrl.startsWith("/uploads/")) {
        // Local file
        const localPath = path.join(process.cwd(), "public", targetUrl);
        try {
          const fileData = await fs.readFile(localPath);
          const ext = path.extname(localPath) || ".jpg";
          folder.file(`foto_${i + 1}_${post.id}${ext}`, fileData);
          count++;
        } catch {
          // Skip missing
        }
      } else if (targetUrl.startsWith("http")) {
        // Remote Cloudflare R2 / Unsplash image
        try {
          const res = await fetch(targetUrl);
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const ext = targetUrl.includes(".png")
              ? ".png"
              : targetUrl.includes(".webp")
              ? ".webp"
              : ".jpg";
            folder.file(`foto_${i + 1}_${post.id}${ext}`, Buffer.from(arrayBuffer));
            count++;
          }
        } catch {
          // Skip failed download
        }
      }
    }
  }

  if (count === 0) {
    zip.file(
      "bilgi.txt",
      "Serdar & Betül Nişan Arşivi: Henüz yerel veya bulutta saklanan fotoğraf bulunmamaktadır."
    );
  }

  return await zip.generateAsync({ type: "nodebuffer" });
}

export async function getGuests(): Promise<GuestRecord[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("last_seen_at", { ascending: false });

      if (!error && data) {
        return data.map((g) => ({
          id: g.id,
          name: g.name,
          createdAt: g.created_at,
          lastSeenAt: g.last_seen_at,
        }));
      }
    } catch (err) {
      console.error("Supabase getGuests error:", err);
    }
  }

  await ensureDirs();
  try {
    const raw = await fs.readFile(GUESTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function registerGuest(
  name: string,
  guestId?: string
): Promise<GuestRecord> {
  const cleanName = name.trim();
  const id =
    guestId && guestId.trim() !== ""
      ? guestId.trim()
      : `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  if (supabase) {
    try {
      // Upsert guest in Supabase
      const { data, error } = await supabase
        .from("guests")
        .upsert(
          {
            id,
            name: cleanName,
            last_seen_at: now,
          },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          createdAt: data.created_at,
          lastSeenAt: data.last_seen_at,
        };
      }
    } catch (err) {
      console.error("Supabase registerGuest error:", err);
    }
  }

  // Local fallback
  await ensureDirs();
  let guests = await getGuests();
  const existingIndex = guests.findIndex((g) => g.id === id || g.name.toLowerCase() === cleanName.toLowerCase());

  let record: GuestRecord;

  if (existingIndex >= 0) {
    record = {
      ...guests[existingIndex],
      name: cleanName,
      lastSeenAt: now,
    };
    guests[existingIndex] = record;
  } else {
    record = {
      id,
      name: cleanName,
      createdAt: now,
      lastSeenAt: now,
    };
    guests.unshift(record);
  }

  await fs.writeFile(GUESTS_FILE, JSON.stringify(guests, null, 2), "utf-8");
  return record;
}

export async function deletePost(postId: string): Promise<boolean> {
  if (supabase) {
    try {
      // First delete comments attached to this post
      await supabase.from("comments").delete().eq("post_id", postId);
      // Then delete post itself
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase deletePost error:", err);
    }
  }

  // Local fallback
  await ensureDirs();
  try {
    const posts = await getPosts();
    const updated = posts.filter((p) => p.id !== postId);
    await fs.writeFile(POSTS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Local deletePost error:", err);
    return false;
  }
}

