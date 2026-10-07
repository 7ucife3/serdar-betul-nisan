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
  const [isRevealed, setIsRevealed] = useState(false);

  const navigateToGallery = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/gallery";
    }
  };

  const handleReveal = () => {
    if (isRevealed) return;
    setIsRevealed(true);
    setTimeout(() => {
      navigateToGallery();
    }, 400);
  };

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center px-4 py-4 sm:py-6 overflow-hidden bg-gradient-to-b from-[#F6F1E6] via-[#FAF7F2] to-[#F1E8DB] touch-manipulation">
      {/* Decorative ambient background elements */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#EBDDC8]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-[#DFCEB2]/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-[#EADCC7]/40 blur-3xl pointer-events-none" />

      {/* Top Header Spacer (Invisible to preserve layout height) */}
      <div className="z-10 h-8 opacity-0 pointer-events-none" />

      {/* Center Interactive Postcard Container */}
      <div className="relative z-10 w-full max-w-[420px] h-[80vh] sm:h-[82vh] min-h-[540px] max-h-[720px] my-auto flex flex-col items-center">
        {/* Main Frame with overflow-hidden */}
        <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-2xl border-2 border-[#EADBCA]">
          {/* Back Layer Loading State */}
          <div className="absolute inset-0 z-10 bg-[#FAF8F5] p-6 sm:p-8 flex flex-col justify-center items-center text-center overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#E2C78E] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#C5A059]/25 animate-pulse mb-4">
              <Heart className="w-8 h-8 fill-white" />
            </div>
            <div className="flex items-center gap-2 text-xs text-[#7A6444] font-medium bg-white px-5 py-2.5 rounded-full border border-[#E5DAC8] shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
              <span>Galeriye yönlendiriliyorsunuz...</span>
            </div>
          </div>

          {/* FRONT LAYER: The Full Vertical Postcard */}
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

      {/* Bottom Hint Spacer */}
      <div className="z-10 h-4 opacity-0 pointer-events-none" />
    </main>
  );
}
