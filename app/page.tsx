"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronUp,
  Heart,
  Sparkles,
  User,
  ArrowRight,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { saveAndRegisterGuest } from "@/lib/guestAuth";

const STORAGE_GUEST_KEY = "nisan_guest_name";

export default function WelcomePage() {
  const [guestName, setGuestName] = useState("");
  const [inputName, setInputName] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GUEST_KEY);
      if (saved && saved.trim()) {
        setGuestName(saved.trim());
        setInputName(saved.trim());
      }
    } catch {
      // LocalStorage fallback
    }
  }, []);

  const navigateToGallery = () => {
    setIsRedirecting(true);
    if (typeof window !== "undefined") {
      window.location.href = "/gallery";
    }
  };

  const handleReveal = () => {
    if (isRevealed) return;
    setIsRevealed(true);

    // If returning guest with saved name, automatically route to gallery
    if (guestName && guestName.trim().length > 0) {
      setTimeout(() => {
        navigateToGallery();
      }, 1000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed || trimmed.length < 2) {
      setError("Lütfen geçerli bir isim-soyisim girin.");
      return;
    }
    setError("");
    saveAndRegisterGuest(trimmed);
    navigateToGallery();
  };

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center px-4 py-4 sm:py-6 overflow-hidden bg-gradient-to-b from-[#F6F1E6] via-[#FAF7F2] to-[#F1E8DB] touch-manipulation">
      {/* Decorative ambient background elements */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#EBDDC8]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-[#DFCEB2]/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-[#EADCC7]/40 blur-3xl pointer-events-none" />

      {/* Top Header Tag */}
      <div className="z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#E5DAC8] shadow-xs text-[11px] tracking-widest text-[#876F4B] uppercase font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
        <span>Serdar & Betül Nişan Davetiyesi</span>
        <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
      </div>

      {/* Center Interactive Postcard Container */}
      <div className="relative z-10 w-full max-w-[420px] h-[80vh] sm:h-[82vh] min-h-[540px] max-h-[720px] my-auto flex flex-col items-center">
        {/* Main Frame with overflow-hidden */}
        <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-2xl border-2 border-[#EADBCA]">
          {/* ========================================================
              BACK LAYER: Positioned directly BEHIND the postcard (z-10)
              Smoothly reveals from soft focus when postcard slides up
              ======================================================== */}
          <motion.div
            initial={false}
            animate={{
              opacity: isRevealed ? 1 : 0,
              scale: isRevealed ? 1 : 0.94,
              filter: isRevealed ? "blur(0px)" : "blur(8px)",
              pointerEvents: isRevealed ? "auto" : "none",
            }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
              delay: isRevealed ? 0.1 : 0,
            }}
            className="absolute inset-0 z-10 bg-[#FAF8F5] p-6 sm:p-8 flex flex-col justify-between items-center text-center overflow-hidden"
          >
            {/* Subtle vintage postcard border */}
            <div className="absolute inset-3 rounded-[24px] border border-dashed border-[#DCCBB4]/80 pointer-events-none" />

            <div className="z-10 pt-1">
              <span className="font-serif italic text-xs text-[#9B8973] tracking-widest">
                S & B • 2026
              </span>
            </div>

            {guestName ? (
              /* Returning guest view */
              <div className="my-auto space-y-4 px-2 z-10 w-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#E2C78E] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#C5A059]/25 animate-pulse">
                  <Heart className="w-8 h-8 fill-white" />
                </div>

                <div>
                  <span className="text-xs uppercase tracking-widest text-[#8C7A63] font-semibold">
                    Tekrar Hoş Geldiniz
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-[#2F2923] font-normal mt-1">
                    {guestName}
                  </h2>
                </div>

                <div className="pt-3 flex flex-col items-center gap-2.5">
                  <div className="flex items-center gap-2 text-xs text-[#7A6444] font-medium bg-white px-5 py-2.5 rounded-full border border-[#E5DAC8] shadow-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                    <span>Galeriye yönlendiriliyorsunuz...</span>
                  </div>

                  <button
                    type="button"
                    onClick={navigateToGallery}
                    className="text-xs font-semibold text-[#A58249] hover:underline pt-2 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Beklemeden Devam Et</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* New guest onboarding form */
              <div className="w-full my-auto z-10 space-y-5 px-1">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#F0E6D5] text-[#937543] flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#2F2923] font-normal">
                    Aramıza Hoş Geldiniz!
                  </h2>
                  <p className="text-xs text-[#736350] mt-1.5 leading-relaxed max-w-xs mx-auto">
                    Fotoğraflarınızı ve tebrik mesajlarınızı sizin adınızla
                    paylaşabilmemiz için lütfen adınızı yazın.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
                  <div>
                    <label
                      htmlFor="guest-name-behind"
                      className="block text-[11px] font-bold text-[#6B573F] uppercase tracking-wider mb-1"
                    >
                      İsim & Soyisim
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9E8E7A]">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="guest-name-behind"
                        type="text"
                        value={inputName}
                        onChange={(e) => {
                          setInputName(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="Örn: Ayşe Yılmaz"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#E0D3C1] focus:border-[#B28B47] focus:ring-2 focus:ring-[#B28B47]/20 outline-none text-base text-[#2D2A26] placeholder-[#A69785] transition-all shadow-xs"
                      />
                    </div>
                    {error && (
                      <p className="text-xs text-rose-600 mt-1 pl-1">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#A58249] to-[#8A6732] hover:from-[#94743E] hover:to-[#785827] text-white font-medium text-sm shadow-md shadow-[#A58249]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Galeriyi Aç</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Back button to close card */}
            <button
              type="button"
              onClick={() => setIsRevealed(false)}
              className="text-[11px] text-[#A08E78] hover:text-[#5B4323] flex items-center gap-1 z-10 transition-colors pb-1 cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Kartpostalı Kapat</span>
            </button>
          </motion.div>

          {/* ========================================================
              FRONT LAYER: The Full Vertical Postcard (z-30)
              Native touch dragging (drag="y") and tap support
              ======================================================== */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.25}
            onDragEnd={(e, info) => {
              if (info.offset.y < -25 || info.velocity.y < -250) {
                handleReveal();
              }
            }}
            initial={false}
            animate={
              isRevealed
                ? {
                    y: "-110%",
                    opacity: 0,
                    scale: 0.95,
                    pointerEvents: "none",
                  }
                : {
                    y: "0%",
                    opacity: 1,
                    scale: 1,
                    pointerEvents: "auto",
                  }
            }
            transition={{
              type: "spring",
              damping: 24,
              stiffness: 220,
            }}
            onClick={handleReveal}
            className="absolute inset-0 z-30 bg-white p-3 sm:p-3.5 flex flex-col justify-between items-center text-center cursor-pointer group touch-manipulation"
          >
            {/* Postcard Body: Vertical Photo */}
            <div className="relative w-full flex-1 rounded-[24px] overflow-hidden shadow-md bg-[#EFE8DC]">
              <Image
                src="/couple-placeholder.jpg"
                alt="Serdar & Betül"
                fill
                priority
                sizes="(max-width: 640px) 380px, 420px"
                className="object-cover object-center pointer-events-none"
              />

              {/* Gradient shading over photo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30 pointer-events-none" />

              {/* Top Postcard Badge */}
              <div className="absolute top-3.5 left-0 right-0 flex justify-center pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-light tracking-widest uppercase border border-white/20">
                  <Sparkles className="w-3 h-3 text-[#E2C78E]" />
                  Serdar & Betül
                  <Sparkles className="w-3 h-3 text-[#E2C78E]" />
                </span>
              </div>

              {/* Bottom Caption on Photo */}
              <div className="absolute bottom-4 left-4 right-4 text-white text-center space-y-1 pointer-events-none">
                <p className="font-serif text-3xl sm:text-4xl font-normal drop-shadow-md tracking-wide">
                  Serdar & Betül
                </p>
                <p className="text-xs sm:text-sm font-serif italic text-white/90 drop-shadow-xs">
                  Nişan Törenimize Hoş Geldiniz
                </p>
                <p className="text-[11px] text-white/80 max-w-xs mx-auto pt-1 leading-relaxed">
                  Bu mutlu günümüzde yanımızda olduğunuz için teşekkür ederiz.
                </p>
              </div>
            </div>

            {/* Bottom Card Footer / Swipe-Up Button */}
            <div className="w-full pt-2.5 pb-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReveal();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#FAF6EE] hover:bg-[#F2E8D8] active:scale-95 transition-all text-[#6E5738] text-xs font-bold border border-[#E9DEC9] shadow-xs cursor-pointer touch-manipulation"
              >
                <div className="animate-float">
                  <ChevronUp className="w-4 h-4 text-[#A58249]" />
                </div>
                <span>Yukarı Kaydırın veya Dokunun</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="z-10 text-center">
        <p className="text-[11px] text-[#A69785]">
          {isRevealed
            ? "Aşağı kaydırarak kartpostalı kapatabilirsiniz"
            : "Kartpostalı yukarı kaydırarak galeriyi açın"}
        </p>
      </div>
    </main>
  );
}
