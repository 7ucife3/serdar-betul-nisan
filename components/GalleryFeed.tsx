"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowUpDown,
  Filter,
  User,
  Sparkles,
  Camera,
  RefreshCw,
  Edit3,
  Home,
  Download,
} from "lucide-react";
import { PhotoPost, SortOption } from "@/lib/types";
import PhotoCard from "./PhotoCard";
import GroupPhotoCard from "./GroupPhotoCard";
import LightboxModal from "./LightboxModal";
import UploadWizardModal from "./UploadWizardModal";
import CommentsModal from "./CommentsModal";

interface GalleryFeedProps {
  guestName: string;
  onChangeGuestName: () => void;
  onRequestOpenNameModal: () => void;
}

export default function GalleryFeed({
  guestName,
  onChangeGuestName,
  onRequestOpenNameModal,
}: GalleryFeedProps) {
  const [posts, setPosts] = useState<PhotoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedGuestFilter, setSelectedGuestFilter] = useState<string>("all");

  // Lightbox state
  const [lightboxPost, setLightboxPost] = useState<PhotoPost | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Comments modal state
  const [commentsPost, setCommentsPost] = useState<PhotoPost | null>(null);

  // Upload wizard state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/photos", window.location.origin);
      url.searchParams.set("sort", sortOption);
      if (selectedGuestFilter !== "all") {
        url.searchParams.set("guest", selectedGuestFilter);
      }

      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sortOption, selectedGuestFilter]);

  // Extract unique guest names for filtering
  const allGuestNames = Array.from(
    new Set(posts.map((p) => p.guestName))
  ).sort((a, b) => a.localeCompare(b, "tr"));

  const handleOpenLightbox = (post: PhotoPost, index: number) => {
    setLightboxPost(post);
    setLightboxIndex(index);
  };

  const handleLike = async (postId: string) => {
    try {
      await fetch("/api/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
    } catch (err) {
      console.error("Failed to like:", err);
    }
  };

  const handlePlusClick = () => {
    if (!guestName || guestName.trim().length === 0) {
      onRequestOpenNameModal();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      setIsWizardOpen(true);
    }
    // Reset input so same files can be re-selected if cancelled
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="w-full min-h-screen bg-[#FAF7F2] pb-32">
      {/* Hidden file input for triggering device camera/gallery */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*"
        className="hidden"
      />

      {/* Top Sticky Bar */}
      <div className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DDCC] px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="p-2 rounded-full bg-white border border-[#E0D4C2] text-[#7A6A56] hover:text-[#382B1C] hover:bg-[#F5EFE4] transition-all"
              title="Açılış Ekranına Dön"
            >
              <Home className="w-4 h-4" />
            </Link>
            <div>
              <span className="font-serif text-lg sm:text-2xl text-[#2F2923] font-semibold tracking-wide">
                Serdar & Betül
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EADDC9] text-[#7A6444] font-medium hidden sm:inline-block ml-2">
                Nişan Galerisi
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {guestName ? (
              <button
                onClick={onChangeGuestName}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E0D4C2] text-xs font-medium text-[#483B2A] hover:bg-[#F5EFE4] transition-all shadow-xs"
                title="İsminizi Değiştirin"
              >
                <User className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="max-w-[120px] sm:max-w-[180px] truncate">
                  {guestName}
                </span>
                <Edit3 className="w-3 h-3 text-[#A08F79]" />
              </button>
            ) : (
              <button
                onClick={onRequestOpenNameModal}
                className="px-3 py-1.5 rounded-full bg-[#A58249] text-white text-xs font-medium hover:bg-[#8F6F3A] transition-colors"
              >
                Giriş Yap
              </button>
            )}

            <button
              onClick={fetchPosts}
              className="p-2 rounded-full bg-white border border-[#E0D4C2] text-[#7A6A56] hover:text-[#382B1C] hover:bg-[#F5EFE4] transition-all"
              title="Yenile"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Controls & Filter Section */}
        <div className="space-y-4 mb-6">
          {/* Guest Name Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-[#8C7A63] shrink-0 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Konuklar:
            </span>

            <button
              onClick={() => setSelectedGuestFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                selectedGuestFilter === "all"
                  ? "bg-[#332A1E] text-white shadow-xs"
                  : "bg-white border border-[#E5DAC8] text-[#6A5A46] hover:bg-[#F3EBE0]"
              }`}
            >
              Tümü ({posts.length})
            </button>

            {allGuestNames.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedGuestFilter(name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                  selectedGuestFilter === name
                    ? "bg-[#C5A059] text-white shadow-xs"
                    : "bg-white border border-[#E5DAC8] text-[#6A5A46] hover:bg-[#F3EBE0]"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Sort Controls Bar */}
          <div className="flex items-center justify-between bg-white/70 backdrop-blur-xs p-2.5 rounded-2xl border border-[#EADBCA]">
            <div className="flex items-center gap-1.5 text-xs text-[#6F5F4C]">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span className="font-medium">
                {posts.length} Paylaşım Görüntüleniyor
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-[#8C7A63]">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sıralama:</span>
              </div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-white border border-[#E0D3C1] text-xs text-[#3E3222] font-medium rounded-xl px-2.5 py-1.5 outline-none focus:border-[#C5A059] cursor-pointer"
              >
                <option value="newest">En Yeni Fotoğraflar</option>
                <option value="oldest">En Eski Fotoğraflar</option>
                <option value="name_asc">İsme Göre (A - Z)</option>
                <option value="name_desc">İsme Göre (Z - A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gallery Feed Grid */}
        {loading && posts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-full border-3 border-[#C5A059] border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#8C7A63]">Fotoğraflar yükleniyor...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-3xl p-8 max-w-md mx-auto">
            <Camera className="w-12 h-12 text-[#B8A389] mx-auto mb-3" />
            <h4 className="font-serif text-lg text-[#3E3222]">
              Henüz Fotoğraf Paylaşılmadı
            </h4>
            <p className="text-xs text-[#7B6A56] mt-1 mb-4 leading-relaxed">
              İlk fotoğrafı siz paylaşarak Serdar & Betül&apos;ün nişan hatırasını
              başlatın!
            </p>
            <button
              onClick={handlePlusClick}
              className="py-2.5 px-5 rounded-2xl bg-[#A58249] text-white text-xs font-medium shadow-md shadow-[#A58249]/20"
            >
              Fotoğraf Yükle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) =>
              post.isGroup || post.photos.length > 1 ? (
                <GroupPhotoCard
                  key={post.id}
                  post={post}
                  onOpenLightbox={handleOpenLightbox}
                  onOpenComments={(p) => setCommentsPost(p)}
                  onLike={handleLike}
                />
              ) : (
                <PhotoCard
                  key={post.id}
                  post={post}
                  onOpenLightbox={handleOpenLightbox}
                  onOpenComments={(p) => setCommentsPost(p)}
                  onLike={handleLike}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (+ Fotoğraf Ekle) */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
        <button
          onClick={handlePlusClick}
          className="pointer-events-auto group relative flex items-center gap-2.5 py-3.5 px-6 rounded-full bg-gradient-to-r from-[#B48F50] via-[#C9A662] to-[#9E7A3D] text-white font-medium text-sm shadow-xl shadow-[#A58249]/35 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
        >
          {/* Subtle glowing ring pulse */}
          <span className="absolute -inset-1 rounded-full bg-[#C9A662]/30 animate-ping pointer-events-none" />

          <div className="p-1 rounded-full bg-white/20">
            <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <span className="tracking-wide font-semibold text-xs sm:text-sm">
            Fotoğraf Ekle
          </span>
        </button>
      </div>

      {/* Lightbox Modal */}
      {lightboxPost && (
        <LightboxModal
          isOpen={Boolean(lightboxPost)}
          photos={lightboxPost.photos}
          initialIndex={lightboxIndex}
          guestName={lightboxPost.guestName}
          groupMessage={lightboxPost.message}
          onClose={() => setLightboxPost(null)}
        />
      )}

      {/* Comments Popup Modal */}
      {commentsPost && (
        <CommentsModal
          isOpen={Boolean(commentsPost)}
          postId={commentsPost.id}
          guestName={guestName}
          postAuthor={commentsPost.guestName}
          initialComments={commentsPost.comments || []}
          onClose={() => setCommentsPost(null)}
          onCommentsUpdated={(postId, updatedComments) => {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === postId ? { ...p, comments: updatedComments } : p
              )
            );
            if (commentsPost && commentsPost.id === postId) {
              setCommentsPost((prev) =>
                prev ? { ...prev, comments: updatedComments } : null
              );
            }
          }}
          onRequestGuestName={onRequestOpenNameModal}
        />
      )}

      {/* Upload Wizard Modal */}
      {isWizardOpen && (
        <UploadWizardModal
          isOpen={isWizardOpen}
          guestName={guestName}
          files={selectedFiles}
          onClose={() => setIsWizardOpen(false)}
          onSuccess={() => {
            fetchPosts();
          }}
        />
      )}
    </section>
  );
}
