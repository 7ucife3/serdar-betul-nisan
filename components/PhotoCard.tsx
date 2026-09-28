"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Maximize2, Share2 } from "lucide-react";
import { PhotoPost } from "@/lib/types";
import { formatRelativeTime } from "@/lib/dateUtils";

interface PhotoCardProps {
  post: PhotoPost;
  onOpenLightbox: (post: PhotoPost, index: number) => void;
  onOpenComments: (post: PhotoPost) => void;
  onLike: (postId: string) => void;
}

export default function PhotoCard({
  post,
  onOpenLightbox,
  onOpenComments,
  onLike,
}: PhotoCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const photo = post.photos[0];
  const commentsCount = post.comments?.length || 0;

  const handleLike = () => {
    setIsLiked(true);
    setLikesCount((prev) => prev + 1);
    onLike(post.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Serdar & Betül Nişan Fotoğrafı",
          text: post.message || `${post.guestName}'in paylaştığı fotoğraf`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    }
  };

  const initials = post.guestName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="glass-card rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-[#EBE3D5] flex flex-col justify-between">
      {/* Author Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#E2C78E] text-white flex items-center justify-center font-semibold text-xs shadow-xs">
            {initials}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#2D2A26] leading-tight">
              {post.guestName}
            </h3>
            <p className="text-[11px] text-[#8C7E6F]">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="p-1.5 rounded-full text-[#8C7E6F] hover:text-[#5B4323] hover:bg-black/5 transition-colors"
          title="Paylaş"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Single Photo */}
      <div
        onClick={() => onOpenLightbox(post, 0)}
        className="relative w-full aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-[#EFE8DC]"
      >
        <Image
          src={photo.url}
          alt={photo.caption || `${post.guestName} fotoğrafı`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="object-cover transition-transform duration-500 group-hover:scale-103"
        />

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="p-2.5 rounded-full bg-white/80 backdrop-blur-md text-[#2D2A26] shadow-lg">
            <Maximize2 className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Caption or Message */}
      {(post.message || photo.caption) && (
        <div className="mt-3 px-1">
          <p className="text-xs sm:text-sm text-[#4E4438] leading-relaxed">
            <span className="font-medium text-[#2D2A26] mr-1.5">
              {post.guestName}:
            </span>
            {post.message || photo.caption}
          </p>
        </div>
      )}

      {/* Footer / Interaction Bar */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F0EBE1] px-1">
        <div className="flex items-center gap-3">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-medium transition-all active:scale-125 ${
              isLiked
                ? "text-rose-600"
                : "text-[#7B6E5F] hover:text-rose-500"
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
              }`}
            />
            <span>{likesCount}</span>
          </button>

          {/* Comments Button (Opens Popup) */}
          <button
            onClick={() => onOpenComments(post)}
            className="flex items-center gap-1 text-xs text-[#7B6E5F] hover:text-[#3D301F] transition-colors"
            title="Yorumları Gör ve Yanıtla"
          >
            <MessageCircle className="w-4 h-4 text-[#A89885]" />
            <span>{commentsCount > 0 ? commentsCount : "Yorum"}</span>
          </button>
        </div>

        <button
          onClick={() => onOpenLightbox(post, 0)}
          className="flex items-center gap-1 text-[11px] text-[#9A8D7E] hover:text-[#5B4323] transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Büyüt</span>
        </button>
      </div>
    </article>
  );
}
