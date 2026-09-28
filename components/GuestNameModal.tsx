"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Sparkles, X, ArrowRight } from "lucide-react";
import { saveAndRegisterGuest } from "@/lib/guestAuth";

interface GuestNameModalProps {
  isOpen: boolean;
  currentName?: string;
  onSave: (name: string) => void;
  onClose?: () => void;
}

export default function GuestNameModal({
  isOpen,
  currentName = "",
  onSave,
  onClose,
}: GuestNameModalProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError("");
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setError("Lütfen geçerli bir isim-soyisim girin.");
      return;
    }
    setError("");
    saveAndRegisterGuest(trimmed);
    onSave(trimmed);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal / Bottom Drawer */}
          <motion.div
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EADBCA] z-10"
          >
            {/* Top mobile pull handle */}
            <div className="w-12 h-1.5 bg-[#DBCBB4] rounded-full mx-auto mb-5 sm:hidden" />

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full text-[#8C7A63] hover:text-[#423523] hover:bg-black/5 transition-colors"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#F0E6D5] text-[#937543] flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#2F2923]">
                Aramıza Hoş Geldiniz!
              </h2>
              <p className="text-xs sm:text-sm text-[#736350] mt-1.5 leading-relaxed max-w-sm mx-auto">
                Yükleyeceğiniz fotoğraflar ve tebrik mesajlarınız için lütfen
                adınızı ve soyadınızı belirtin.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="guest-name-input"
                  className="block text-xs font-semibold text-[#5A4B3A] mb-1.5 tracking-wide uppercase"
                >
                  İsim & Soyisim
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9E8E7A]">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="guest-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Örn: Ayşe Yılmaz"
                    autoFocus
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-[#E0D3C1] focus:border-[#B28B47] focus:ring-3 focus:ring-[#B28B47]/20 outline-none text-[#2D2823] placeholder-[#A69785] text-sm transition-all shadow-xs"
                  />
                </div>
                {error && (
                  <p className="text-xs text-rose-600 mt-1.5 pl-1">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#A58249] to-[#8A6732] hover:from-[#94743E] hover:to-[#785827] text-white font-medium text-sm shadow-lg shadow-[#A58249]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Galeriyi Keşfet & Başla</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-[#9E8E7A] pt-1">
                Girdiğiniz isim cihazınızda otomatik hatırlanacaktır.
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
