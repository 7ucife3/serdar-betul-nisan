"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check, Loader2, Zap, Layers, Image as ImageIcon, User } from "lucide-react";
import confetti from "canvas-confetti";
import { compressImage } from "@/lib/imageCompressor";

export interface SelectedFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface UploadWizardModalProps {
  isOpen: boolean;
  guestName?: string;
  files: File[];
  onClose: () => void;
  onSuccess: () => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export default function UploadWizardModal({
  isOpen,
  guestName = "",
  files,
  onClose,
  onSuccess,
}: UploadWizardModalProps) {
  const [items, setItems] = useState<SelectedFileItem[]>(() =>
    files.map((f, idx) => ({
      id: `item_${Date.now()}_${idx}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
    }))
  );

  const [uploaderName, setUploaderName] = useState(() => {
    if (guestName && guestName.trim()) return guestName.trim();
    if (typeof window !== "undefined") {
      return localStorage.getItem("nisan_guest_name") || "";
    }
    return "";
  });
  const [nameError, setNameError] = useState("");

  const [isHd, setIsHd] = useState<boolean>(true); // Default HD on, WhatsApp style
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  if (!isOpen) return null;

  const isGroup = items.length > 1;

  const handleRemoveItem = (id: string) => {
    const remaining = items.filter((it) => it.id !== id);
    if (remaining.length === 0) {
      onClose();
    } else {
      setItems(remaining);
    }
  };

  const handleUpload = async () => {
    if (items.length === 0 || isUploading) return;

    const cleanName = uploaderName.trim();
    if (!cleanName || cleanName.length < 2) {
      setNameError("Lütfen geçerli bir isim-soyisim girin.");
      return;
    }
    setNameError("");

    if (typeof window !== "undefined") {
      localStorage.setItem("nisan_guest_name", cleanName);
    }

    try {
      setIsUploading(true);
      setStatusText(
        isHd
          ? "HD fotoğraflar hazırlanıyor..."
          : "Hızlı yükleme için optimize ediliyor..."
      );
      setUploadProgress(10);

      // Process and compress each photo
      const processedPhotos: Array<{
        dataUrl: string;
        originalDataUrl?: string;
      }> = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setStatusText(`Fotoğraf ${i + 1}/${items.length} işleniyor...`);

        // Fast web thumbnail
        const thumbBase64 = await compressImage(item.file);

        // Optional raw HD data
        let origBase64: string | undefined = undefined;
        if (isHd) {
          origBase64 = await readFileAsDataUrl(item.file);
        }

        processedPhotos.push({
          dataUrl: thumbBase64,
          originalDataUrl: origBase64,
        });

        setUploadProgress(15 + Math.round(((i + 1) / items.length) * 45));
      }

      setStatusText("Sunucuya yükleniyor...");
      setUploadProgress(65);

      // Simple, automatic payload
      const uploadItem = {
        photos: processedPhotos,
        message: message.trim() || undefined,
        isGroup: isGroup,
        isHd: isHd,
      };

      setUploadProgress(85);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: cleanName,
          items: [uploadItem],
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Yükleme başarısız oldu.");
      }

      setUploadProgress(100);
      setStatusText("Yükleme Tamamlandı! 🎉");

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C5A059", "#E2C78E", "#F3ECE0", "#D84A65", "#FFFFFF"],
      });

      setTimeout(() => {
        setIsUploading(false);
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Fotoğraf yüklenirken bir sorun oluştu.");
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => !isUploading && onClose()}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8DDCC] z-10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EFE7D8] bg-white/80">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg text-[#2D2A26] font-medium">
                  {isGroup ? "Grup Fotoğrafları Paylaş" : "Fotoğraf Paylaş"}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#7A6444] text-[10px] font-medium border border-[#E5DAC8]">
                  {isGroup ? (
                    <>
                      <Layers className="w-3 h-3" />
                      {items.length} Fotoğraf
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3 h-3" />
                      Tekil Fotoğraf
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* WhatsApp-Style HD Button */}
              <button
                type="button"
                onClick={() => setIsHd(!isHd)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  isHd
                    ? "bg-[#C5A059] text-white border-[#C5A059] shadow-sm shadow-[#C5A059]/30"
                    : "bg-[#F0EBE1] text-[#7A6953] border-[#DDD0BC] hover:bg-[#E7DEC9]"
                }`}
                title="WhatsApp tarzı HD Kalite Seçeneği"
              >
                {isHd && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>HD</span>
              </button>

              {!isUploading && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-[#8C7A63] hover:text-[#2D2A26] hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Quality notification bar */}
          <div
            className={`px-5 py-2 text-xs flex items-center gap-2 border-b transition-colors ${
              isHd
                ? "bg-[#F7F3E9] text-[#786137] border-[#E8DCBF]"
                : "bg-[#F4EFE6] text-[#70604D] border-[#E5DAC8]"
            }`}
          >
            {isHd ? (
              <>
                <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span className="text-[11px] leading-tight">
                  <strong>HD Kalite Açık:</strong> Fotoğraflar tam baskı kalitesinde çiftimiz için saklanır.
                </span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-[#8C7A63] shrink-0" />
                <span className="text-[11px] leading-tight">
                  <strong>Standart Kalite:</strong> Hızlı ve internet kotası dostu yükleme.
                </span>
              </>
            )}
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Required Uploader Name Input */}
            <div>
              <label className="block text-xs font-semibold text-[#5B4B38] mb-1.5">
                Adınız & Soyadınız <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9E8E7A]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={uploaderName}
                  onChange={(e) => {
                    setUploaderName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  placeholder="Örn: Ayşe Yılmaz"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white border border-[#E0D3C1] focus:border-[#B28B47] focus:ring-2 focus:ring-[#B28B47]/20 outline-none text-xs sm:text-sm text-[#2D2A26] placeholder-[#A89885]"
                />
              </div>
              {nameError && (
                <p className="text-xs text-rose-600 mt-1 pl-1">{nameError}</p>
              )}
            </div>
            {/* Single clean message input */}
            <div>
              <label className="block text-xs font-semibold text-[#5B4B38] mb-1.5">
                Tebrik Mesajınız (Opsiyonel)
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Serdar & Betül'e bir tebrik mesajı veya not bırakın..."
                className="w-full p-3 rounded-2xl bg-white border border-[#E0D3C1] focus:border-[#B28B47] focus:ring-2 focus:ring-[#B28B47]/20 outline-none text-xs sm:text-sm text-[#2D2A26] placeholder-[#A89885] resize-none"
              />
            </div>

            {/* Photo Previews */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#5B4B38]">
                  Seçilen {isGroup ? "Fotoğraflar" : "Fotoğraf"} ({items.length})
                </span>
                {isGroup && (
                  <span className="text-[11px] text-[#8C7A63]">
                    Akışta tek bir şık grup kartı olarak gösterilecek
                  </span>
                )}
              </div>

              <div
                className={`grid gap-2.5 ${
                  items.length === 1
                    ? "grid-cols-1"
                    : "grid-cols-3 sm:grid-cols-4"
                }`}
              >
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`relative rounded-2xl overflow-hidden group bg-[#EFE8DC] border border-[#E6DAC8] ${
                      items.length === 1
                        ? "aspect-[4/3] max-h-56 mx-auto w-full"
                        : "aspect-square"
                    }`}
                  >
                    <Image
                      src={item.previewUrl}
                      alt={`Seçilen ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors shadow-sm"
                      title="Kaldır"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer & Upload Progress */}
          <div className="p-4 sm:p-5 border-t border-[#EFE7D8] bg-white/80">
            {isUploading && (
              <div className="mb-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#635340]">
                  <span>{statusText}</span>
                  <span>%{uploadProgress}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EFE8DC] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#C5A059] to-[#997738] transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isUploading}
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#EFE8DC] hover:bg-[#E5DAC8] text-[#5C4A34] text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
              >
                Vazgeç
              </button>

              <button
                type="button"
                disabled={isUploading || items.length === 0}
                onClick={handleUpload}
                className="flex-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#A58249] to-[#886731] hover:from-[#96743C] hover:to-[#765725] text-white font-medium text-xs sm:text-sm shadow-md shadow-[#A58249]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Yükleniyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      Paylaş ({items.length} Fotoğraf{isHd ? " • HD" : ""})
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
