"use client";

import React, { useState, useEffect } from "react";
import GalleryFeed from "@/components/GalleryFeed";
import GuestNameModal from "@/components/GuestNameModal";

const STORAGE_GUEST_KEY = "nisan_guest_name";

export default function GalleryPage() {
  const [guestName, setGuestName] = useState<string>("");
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_GUEST_KEY);
    if (saved && saved.trim()) {
      setGuestName(saved.trim());
    } else {
      // If user navigated directly to /gallery without setting name, prompt modal
      setIsNameModalOpen(true);
    }
  }, []);

  const handleSaveName = (name: string) => {
    localStorage.setItem(STORAGE_GUEST_KEY, name);
    setGuestName(name);
    setIsNameModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <GalleryFeed
        guestName={guestName}
        onChangeGuestName={() => setIsNameModalOpen(true)}
        onRequestOpenNameModal={() => setIsNameModalOpen(true)}
      />

      <GuestNameModal
        isOpen={isNameModalOpen}
        currentName={guestName}
        onSave={handleSaveName}
        onClose={guestName ? () => setIsNameModalOpen(false) : undefined}
      />
    </main>
  );
}
