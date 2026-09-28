"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  User,
  MessageSquare,
} from "lucide-react";
import { PhotoItem } from "@/lib/types";

interface LightboxModalProps {
  isOpen: boolean;
  photos: PhotoItem[];
  initialIndex?: number;
  guestName: string;
  groupMessage?: string;
  onClose: () => void;
}

export default function LightboxModal({
  isOpen,
  photos,
  initialIndex = 0,
  guestName,
  groupMessage,
  onClose,
}: LightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setDirection(0);
  }, [initialIndex, isOpen]);

  // Lock background scroll when lightbox is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    const originalPosition = document.body.style.position;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.style.position = originalPosition;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, photos.length]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  const handleNext = () => {
    if (photos.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    if (photos.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleSelectIndex = (idx: number) => {
    if (idx === currentIndex) return;
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const handleDownload = () => {
    const targetUrl = currentPhoto.originalUrl || currentPhoto.url;
    const link = document.createElement("a");
    link.href = targetUrl;
    link.download = `serdar_betul_nisan_${Date.now()}.jpg`;
    link.target = "_blank";
    link.click();
  };

  // Smooth slide variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "40%" : dir < 0 ? "-40%" : 0,
      opacity: 0,
      scale: 0.94,
    }),
    center: {
      x: "0%",
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 320, damping: 32 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "40%" : "-40%",
      opacity: 0,
      scale: 0.94,
      transition: {
        x: { type: "spring" as const, stiffness: 320, damping: 32 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      },
    }),
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md select-none overscroll-none touch-none overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="z-20 flex items-center justify-between px-4 py-3 sm:px-6 text-white/90 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium border border-white/15">
              <User className="w-4 h-4 text-[#D8C5A4]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium tracking-wide">
                {guestName}
              </p>
              {photos.length > 1 && (
                <p className="text-[11px] text-white/60">
                  {currentIndex + 1} / {photos.length}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Fotoğrafı İndir"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Kapat"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Main Photo Stage with Smooth Slide Animation & Gesture Swiping */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden touch-none overscroll-none">
          {/* Previous Arrow Button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/80 active:scale-90 text-white/90 border border-white/15 transition-all backdrop-blur-sm cursor-pointer hidden sm:flex items-center justify-center"
              aria-label="Önceki"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Animated Slide Frame with drag gestures */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentPhoto.id || currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag={photos.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(e, { offset, velocity }) => {
                  if (offset.x < -35 || velocity.x < -250) {
                    handleNext();
                  } else if (offset.x > 35 || velocity.x > 250) {
                    handlePrev();
                  }
                }}
                className="absolute inset-0 flex items-center justify-center p-2 sm:p-6 touch-none select-none cursor-grab active:cursor-grabbing"
              >
                <div className="relative w-full h-full max-w-4xl max-h-[72vh] flex items-center justify-center">
                  <Image
                    src={currentPhoto.url}
                    alt={currentPhoto.caption || "Serdar & Betül Nişan"}
                    fill
                    className="object-contain pointer-events-none select-none"
                    sizes="(max-width: 768px) 100vw, 1200px"
                    priority
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Arrow Button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-6 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/80 active:scale-90 text-white/90 border border-white/15 transition-all backdrop-blur-sm cursor-pointer hidden sm:flex items-center justify-center"
              aria-label="Sonraki"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Captions & Thumbnails */}
        <div className="z-20 px-4 py-3 sm:pb-6 text-center max-w-xl mx-auto w-full bg-gradient-to-t from-black/70 to-transparent">
          {/* Specific Photo Caption or Group Message */}
          {(currentPhoto.caption || groupMessage) && (
            <div className="mb-2.5 px-4 py-1.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 text-white text-xs sm:text-sm inline-flex items-center gap-2 max-w-full shadow-sm">
              <MessageSquare className="w-3.5 h-3.5 text-[#D8C5A4] shrink-0" />
              <span className="truncate">
                {currentPhoto.caption || groupMessage}
              </span>
            </div>
          )}

          {/* Mobile Swipe Hint */}
          {photos.length > 1 && (
            <div className="text-[10px] text-white/50 mb-2 sm:hidden">
              Fotoğraflar arasında geçiş yapmak için sağa-sola kaydırın
            </div>
          )}

          {/* Thumbnail Bar for Multiple Photos */}
          {photos.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
              {photos.map((item, idx) => (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => handleSelectIndex(idx)}
                  className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer ${
                    idx === currentIndex
                      ? "ring-2 ring-[#C5A059] scale-110 opacity-100 shadow-md"
                      : "opacity-40 hover:opacity-80 scale-95"
                  }`}
                >
                  <Image
                    src={item.url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
