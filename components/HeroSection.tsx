"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ChevronUp, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onSwipeUp: () => void;
}

export default function HeroSection({ onSwipeUp }: HeroSectionProps) {
  const touchStartY = useRef<number | null>(null);
  const [hasSwiped, setHasSwiped] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    // Upward swipe of more than 40px
    if (diff > 40 && !hasSwiped) {
      setHasSwiped(true);
      onSwipeUp();
    }
    touchStartY.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 20 && !hasSwiped) {
      setHasSwiped(true);
      onSwipeUp();
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center px-4 py-8 select-none overflow-hidden bg-gradient-to-b from-[#F7F2E8] via-[#FAF7F2] to-[#F3ECE0]"
    >
      {/* Decorative ambient background elements */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#EBDDC8]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-[#DFCEB2]/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-[#EADCC7]/40 blur-3xl pointer-events-none" />

      {/* Top Header Tag */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-[#E5DAC8] shadow-xs text-xs tracking-widest text-[#876F4B] uppercase font-medium mt-2"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
        <span>Nişan Hatırası</span>
        <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
      </motion.div>

      {/* Central Couple Vignette & Typography */}
      <div className="z-10 flex flex-col items-center text-center max-w-md w-full my-auto py-4">
        {/* Aesthetic Framed Couple Placeholder Photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="relative w-56 h-72 sm:w-64 sm:h-80 mb-6 rounded-3xl p-2.5 bg-gradient-to-b from-white via-white/80 to-[#EFE7D8] shadow-2xl border border-[#E8DDCC]/80 group"
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner">
            <Image
              src="/couple-placeholder.jpg"
              alt="Serdar & Betül"
              fill
              priority
              sizes="(max-width: 640px) 240px, 300px"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            {/* Subtle romantic inner gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-light tracking-wider">
                <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                S & B
              </span>
            </div>
          </div>
        </motion.div>

        {/* Couple Names */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-serif text-4xl sm:text-5xl font-normal text-[#2D2823] tracking-wide mb-2"
        >
          Serdar & Betül
        </motion.h1>

        {/* Welcome Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-sm sm:text-base font-serif italic text-[#8B7861] mb-3"
        >
          Hoş Geldiniz
        </motion.p>

        {/* Short Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xs sm:text-sm text-[#63574A] leading-relaxed max-w-sm px-4"
        >
          Bu özel günümüzde yanımızda olduğunuz için teşekkür ederiz.
        </motion.p>
      </div>

      {/* Swipe Up Interaction Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="z-10 flex flex-col items-center cursor-pointer mb-2"
        onClick={() => {
          setHasSwiped(true);
          onSwipeUp();
        }}
      >
        <div className="flex flex-col items-center gap-1 py-3 px-6 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-md border border-[#E5DAC8] shadow-md transition-all active:scale-95 group">
          <div className="flex flex-col items-center -space-y-2 animate-float">
            <ChevronUp className="w-5 h-5 text-[#A58249]" />
            <ChevronUp className="w-5 h-5 text-[#886934]" />
          </div>
          <span className="text-xs font-semibold text-[#5C492C] tracking-wide">
            Yukarı Kaydırın
          </span>
          <span className="text-[10px] text-[#8C7A63]">
            Galeriyi Keşfet & Fotoğraf Yükle
          </span>
        </div>
      </motion.div>
    </div>
  );
}
