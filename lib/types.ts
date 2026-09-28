export interface PhotoItem {
  id: string;
  url: string; // Web-optimized image URL
  originalUrl?: string; // High-res original image URL (if uploaded with HD on)
  caption?: string;
  isHd?: boolean;
}

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  parentId?: string; // Set when replying to an existing comment
}

export interface PhotoPost {
  id: string;
  guestName: string;
  createdAt: string;
  message?: string;
  photos: PhotoItem[];
  isGroup: boolean;
  likes: number;
  comments?: CommentItem[];
}

export type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

export interface GuestRecord {
  id: string;
  name: string;
  createdAt: string;
  lastSeenAt: string;
}
