"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Download,
  Trash2,
  RefreshCw,
  Home,
  LogOut,
  Camera,
  Users,
  MessageCircle,
  Heart,
  Sparkles,
  ShieldCheck,
  Loader2,
  Maximize2,
} from "lucide-react";
import { PhotoPost } from "@/lib/types";
import { formatRelativeTime } from "@/lib/dateUtils";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Data states
  const [posts, setPosts] = useState<PhotoPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Check auth session on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = sessionStorage.getItem("admin_auth");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/photos?sort=newest", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to fetch admin posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isVerifying) return;

    try {
      setIsVerifying(true);
      setAuthError("");

      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("admin_auth", "true");
        }
      } else {
        setAuthError(data.error || "Hatalı şifre girdiniz.");
      }
    } catch {
      setAuthError("Bağlantı hatası oluştu.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_auth");
    }
  };

  const handleDeletePost = async (postId: string, guestName: string) => {
    const confirmDelete = window.confirm(
      `"${guestName}" tarafından paylaşılan bu gönderiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(postId);
      const res = await fetch(`/api/admin/delete-post?postId=${postId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        alert(data.error || "Silme işlemi başarısız.");
      }
    } catch {
      alert("Gönderi silinirken hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  };

  // Compute Statistics
  const totalPosts = posts.length;
  const totalPhotos = posts.reduce((acc, p) => acc + (p.photos?.length || 0), 0);
  const uniqueGuestsCount = new Set(posts.map((p) => p.guestName)).size;

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-[#FAF7F2] via-[#F4EFE6] to-[#EBE2D3]">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E5DAC8] text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#E2C78E] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#C5A059]/30">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#96763D]">
              Serdar & Betül Nişan
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#2F2923] font-normal mt-1">
              Yönetici Paneli
            </h1>
            <p className="text-xs text-[#7A6953] mt-1">
              Galeriyi yönetmek için lütfen şifrenizi girin.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-[#5C4A34] mb-1.5">
                Yönetici Şifresi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (authError) setAuthError("");
                }}
                placeholder="Şifrenizi girin..."
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#E0D3C1] focus:border-[#B28B47] focus:ring-2 focus:ring-[#B28B47]/20 outline-none text-sm text-[#2D2A26] placeholder-[#A69785]"
              />
              {authError && (
                <p className="text-xs text-rose-600 mt-1 pl-1">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying || !password.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#A58249] to-[#886731] hover:from-[#96743C] hover:to-[#765725] text-white font-medium text-sm shadow-md shadow-[#A58249]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Kontrol Ediliyor...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Giriş Yap</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#EFE7D8]">
            <Link
              href="/gallery"
              className="text-xs font-semibold text-[#96763D] hover:underline inline-flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Galerilere Dön</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E8DDCC] px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/gallery"
              className="p-2 rounded-full bg-[#FAF7F2] border border-[#E0D4C2] text-[#7A6A56] hover:text-[#382B1C] hover:bg-[#F5EFE4] transition-all"
              title="Siteye Dön"
            >
              <Home className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl text-[#2F2923] font-semibold">
                  Admin Paneli
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EADDC9] text-[#7A6444] font-bold uppercase">
                  Yönetici
                </span>
              </div>
              <p className="text-[11px] text-[#8C7A63]">Serdar & Betül Nişan Galerisi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download HD ZIP Button */}
            <a
              href="/api/admin/download-zip"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#A58249] to-[#886731] hover:from-[#96743C] hover:to-[#765725] text-white text-xs font-semibold shadow-sm shadow-[#A58249]/30 transition-all cursor-pointer"
              title="Tüm orijinal sıkıştırılmamış HD fotoğrafları konuk isimleriyle ZIP olarak indir"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Tümünü İndir (HD ZIP)</span>
            </a>

            <button
              onClick={fetchPosts}
              className="p-2 rounded-full bg-white border border-[#E0D4C2] text-[#7A6A56] hover:bg-[#F5EFE4] transition-all"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-all"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E5DAC8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F0E6D5] text-[#937543] flex items-center justify-center shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#8C7A63] font-medium">Toplam Gönderi</p>
              <h3 className="text-2xl font-serif font-bold text-[#2F2923]">
                {totalPosts}
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E5DAC8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F7EEDD] text-[#C5A059] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#8C7A63] font-medium">Toplam Fotoğraf</p>
              <h3 className="text-2xl font-serif font-bold text-[#2F2923]">
                {totalPhotos}
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E5DAC8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE8DC] text-[#6E5738] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#8C7A63] font-medium">Fotoğraf Paylaşan Konuklar</p>
              <h3 className="text-2xl font-serif font-bold text-[#2F2923]">
                {uniqueGuestsCount}
              </h3>
            </div>
          </div>
        </div>

        {/* Info banner for Admin */}
        <div className="bg-[#FAF4E8] border border-[#E5D5B8] p-4 rounded-2xl text-xs text-[#7A6444] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span>
              <strong>HD ZIP İndirme:</strong> İndirilen ZIP paketinin içindeki fotoğraflar konukların isimlerine göre klasörlenmiş ve tam orijinal HD kalitesindedir.
            </span>
          </div>
        </div>

        {/* Posts Moderation Grid */}
        <div>
          <h2 className="font-serif text-xl text-[#2F2923] font-semibold mb-4">
            Yüklenen Paylaşımlar ({posts.length})
          </h2>

          {loading && posts.length === 0 ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#8C7A63]">Gönderiler yükleniyor...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl p-8 border border-[#E5DAC8]">
              <Camera className="w-12 h-12 text-[#B8A389] mx-auto mb-3" />
              <h4 className="font-serif text-lg text-[#3E3222]">
                Henüz Paylaşım Yok
              </h4>
              <p className="text-xs text-[#7B6A56] mt-1">
                Konuklar fotoğraf yükledikçe burada listelenecektir.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-3xl p-4 border border-[#E8DDCC] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#2D2A26]">
                          {post.guestName}
                        </h3>
                        <p className="text-[11px] text-[#8C7E6F]">
                          {formatRelativeTime(post.createdAt)}
                        </p>
                      </div>

                      {/* Delete Post Button */}
                      <button
                        onClick={() => handleDeletePost(post.id, post.guestName)}
                        disabled={deletingId === post.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                        title="Bu gönderiyi sil"
                      >
                        {deletingId === post.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Sil</span>
                      </button>
                    </div>

                    {/* Photo Previews */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {post.photos.map((ph, idx) => (
                        <div
                          key={ph.id || idx}
                          className="relative aspect-square rounded-2xl overflow-hidden bg-[#EFE8DC] border border-[#E6DAC8]"
                        >
                          <Image
                            src={ph.url}
                            alt={ph.caption || post.guestName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Message */}
                    {post.message && (
                      <p className="text-xs text-[#4E4438] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EADBCA] mb-3 leading-relaxed">
                        "{post.message}"
                      </p>
                    )}
                  </div>

                  {/* Footer metadata */}
                  <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-[11px] text-[#8C7A63]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        {post.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-[#A89885]" />
                        {post.comments?.length || 0} Yorum
                      </span>
                    </div>

                    <span className="font-semibold text-[#A58249]">
                      {post.photos.length} Görsel
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
