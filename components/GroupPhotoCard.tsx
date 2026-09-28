"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, Layers, MessageCircle, Share2, Maximize2 } from "lucide-react";
import { PhotoPost } from "@/lib/types";
import { formatRelativeTime } from "@/lib/dateUtils";

interface GroupPhotoCardProps {
  post: PhotoPost;
  onOpenLightbox: (post: PhotoPost, index: number) => void;
  onOpenComments: (post: PhotoPost) => void;
  onLike: (postId: string) => void;
}

export default function GroupPhotoCard({
  post,
  onOpenLightbox,
  onOpenComments,
  onLike,
}: GroupPhotoCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const photos = post.photos;
  const totalCount = photos.length;
  const extraCount = totalCount > 4 ? totalCount - 4 : 0;
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
          title: "Serdar & Betül Nişan Fotoğrafları",
          text: post.message || `${post.guestName}'in paylaştığı ${totalCount} fotoğraf`,
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
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9B7B3E] to-[#C5A059] text-white flex items-center justify-center font-semibold text-xs shadow-xs">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-semibold text-[#2D2A26] leading-tight">
                {post.guestName}
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#F4EFE6] text-[#8C7A63] text-[10px] font-medium border border-[#E8DFC9]">
                <Layers className="w-2.5 h-2.5" />
                {totalCount}
              </span>
            </div>
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

      {/* Group Media: 2x2 Grid fitting standard single photo card dimensions */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#EFE8DC] p-1">
        {totalCount === 2 ? (
          <div className="grid grid-cols-2 gap-1 w-full h-full">
            {photos.slice(0, 2).map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => onOpenLightbox(post, idx)}
                className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
              >
                <Image
                  src={item.url}
                  alt={item.caption || `Fotoğraf ${idx + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : totalCount === 3 ? (
          <div className="grid grid-cols-2 gap-1 w-full h-full">
            <div
              onClick={() => onOpenLightbox(post, 0)}
              className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
            >
              <Image
                src={photos[0].url}
                alt={photos[0].caption || "Fotoğraf 1"}
                fill
                sizes="200px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="grid grid-rows-2 gap-1 w-full h-full">
              {photos.slice(1, 3).map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => onOpenLightbox(post, idx + 1)}
                  className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
                >
                  <Image
                    src={item.url}
                    alt={item.caption || `Fotoğraf ${idx + 2}`}
                    fill
                    sizes="150px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
            {photos.slice(0, 4).map((item, idx) => {
              const isFourth = idx === 3;
              const hasMore = isFourth && extraCount > 0;

              return (
                <div
                  key={item.id || idx}
                  onClick={() => onOpenLightbox(post, idx)}
                  className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
                >
                  <Image
                    src={item.url}
                    alt={item.caption || `Fotoğraf ${idx + 1}`}
                    fill
                    sizes="200px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {hasMore && (
                    <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-colors group-hover:bg-black/75">
                      <span className="text-xl sm:text-2xl font-bold tracking-tight">
                        +{extraCount}
                      </span>
                      <span className="text-[10px] tracking-widest uppercase font-medium text-white/80">
                        Fotoğraf
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Caption or Message */}
      {post.message && (
        <div className="mt-3 px-1">
          <p className="text-xs sm:text-sm text-[#4E4438] leading-relaxed">
            <span className="font-medium text-[#2D2A26] mr-1.5">
              {post.guestName}:
            </span>
            {post.message}
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
          <span>Tümünü Gör ({totalCount})</span>
        </button>
      </div>
    </article>
  );
}
