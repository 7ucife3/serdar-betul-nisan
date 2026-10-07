"use client";

import React, { useState, useEffect } from "react";
import GalleryFeed from "@/components/GalleryFeed";

const STORAGE_GUEST_KEY = "nisan_guest_name";

export default function GalleryPage() {
  const [guestName, setGuestName] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_GUEST_KEY);
    if (saved && saved.trim()) {
      setGuestName(saved.trim());
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <GalleryFeed
        guestName={guestName}
        onChangeGuestName={() => {}}
        onRequestOpenNameModal={() => {}}
      />
    </main>
  );
}
