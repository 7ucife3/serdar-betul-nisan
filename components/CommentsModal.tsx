"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  CornerDownRight,
  MessageCircle,
  Sparkles,
  User,
} from "lucide-react";
import { CommentItem } from "@/lib/types";
import { formatRelativeTime } from "@/lib/dateUtils";

interface CommentsModalProps {
  isOpen: boolean;
  postId: string;
  guestName?: string;
  postAuthor: string;
  initialComments?: CommentItem[];
  onClose: () => void;
  onCommentsUpdated: (postId: string, comments: CommentItem[]) => void;
  onRequestGuestName?: () => void;
}

export default function CommentsModal({
  isOpen,
  postId,
  guestName = "",
  postAuthor,
  initialComments = [],
  onClose,
  onCommentsUpdated,
  onRequestGuestName,
}: CommentsModalProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [inputText, setInputText] = useState("");
  const [commenterName, setCommenterName] = useState(() => {
    if (guestName && guestName.trim()) return guestName.trim();
    if (typeof window !== "undefined") {
      return localStorage.getItem("nisan_guest_name") || "";
    }
    return "";
  });
  const [nameError, setNameError] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    author: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments, postId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = inputText.trim();
    const trimmedName = commenterName.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setNameError("Lütfen adınızı girin.");
      return;
    }
    setNameError("");

    if (!trimmedText || isSubmitting) return;

    if (typeof window !== "undefined") {
      localStorage.setItem("nisan_guest_name", trimmedName);
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          author: trimmedName,
          text: trimmedText,
          parentId: replyingTo?.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.comments) {
        setComments(data.comments);
        onCommentsUpdated(postId, data.comments);
        setInputText("");
        setReplyingTo(null);

        // Scroll to bottom
        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartReply = (comment: CommentItem) => {
    setReplyingTo({ id: comment.id, author: comment.author });
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  // Separate top-level comments and replies
  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parentId === parentId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ y: "100%", opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8DDCC] z-10 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
        >
          {/* Top handle for mobile */}
          <div className="w-12 h-1.5 bg-[#DBCBB4] rounded-full mx-auto mt-3 sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EFE7D8] bg-white/80">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#C5A059]" />
              <h2 className="font-serif text-base sm:text-lg text-[#2D2A26] font-medium">
                Yorumlar ({comments.length})
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8C7A63] hover:text-[#2D2A26] hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {rootComments.length === 0 ? (
              <div className="py-12 text-center">
                <Sparkles className="w-8 h-8 text-[#C5A059]/60 mx-auto mb-2" />
                <p className="text-xs text-[#8C7A63]">
                  Henüz yorum yapılmamış. İlk tebrik yorumunu siz yazın!
                </p>
              </div>
            ) : (
              rootComments.map((comment) => {
                const replies = getReplies(comment.id);
                const initials = comment.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div key={comment.id} className="space-y-2">
                    {/* Top Level Comment */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#E2C78E] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs mt-0.5">
                        {initials}
                      </div>

                      <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-sm border border-[#EADBCA] shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#2D2A26]">
                            {comment.author}
                          </span>
                          <span className="text-[10px] text-[#A39482]">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-[#4E4438] leading-relaxed break-words">
                          {comment.text}
                        </p>

                        <div className="mt-2 flex items-center">
                          <button
                            type="button"
                            onClick={() => handleStartReply(comment)}
                            className="text-[11px] font-semibold text-[#8C6D37] hover:text-[#5B4323] flex items-center gap-1 transition-colors"
                          >
                            <CornerDownRight className="w-3 h-3" />
                            <span>Yanıtla</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {replies.length > 0 && (
                      <div className="ml-8 pl-3 border-l-2 border-[#EADDCC] space-y-2 pt-1">
                        {replies.map((reply) => {
                          const replyInitials = reply.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase();

                          return (
                            <div
                              key={reply.id}
                              className="flex items-start gap-2"
                            >
                              <div className="w-6 h-6 rounded-full bg-[#E5D7C3] text-[#634E2F] flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                                {replyInitials}
                              </div>

                              <div className="flex-1 bg-[#FAF6F0] p-2.5 rounded-2xl rounded-tl-sm border border-[#E8DDCC]">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-[11px] font-bold text-[#2D2A26]">
                                    {reply.author}
                                  </span>
                                  <span className="text-[9px] text-[#A39482]">
                                    {formatRelativeTime(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-[#4E4438] leading-relaxed break-words">
                                  {reply.text}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Bottom Input Area */}
          <div className="p-3 sm:p-4 border-t border-[#EFE7D8] bg-white space-y-2">
            {replyingTo && (
              <div className="px-3 py-1 rounded-xl bg-[#F4EFE6] border border-[#EADBCA] flex items-center justify-between text-[11px] text-[#786348]">
                <span>
                  <strong>{replyingTo.author}</strong> kişisine yanıt
                  veriyorsunuz
                </span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative w-1/3 min-w-[120px]">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#9E8E7A]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={commenterName}
                    onChange={(e) => {
                      setCommenterName(e.target.value);
                      if (nameError) setNameError("");
                    }}
                    placeholder="Adınız..."
                    className="w-full pl-8 pr-2 py-2 rounded-full bg-[#FAF7F2] border border-[#E0D3C1] focus:border-[#C5A059] outline-none text-xs text-[#2D2A26] placeholder-[#A69785]"
                  />
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Yorumunuzu yazın..."
                  className="flex-1 px-4 py-2 rounded-full bg-[#FAF7F2] border border-[#E0D3C1] focus:border-[#C5A059] outline-none text-xs text-[#2D2A26] placeholder-[#A69785]"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !inputText.trim() || !commenterName.trim()}
                  className="p-2 rounded-full bg-[#A58249] hover:bg-[#8F6F3A] text-white disabled:opacity-40 transition-all shadow-xs shrink-0"
                  title="Gönder"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {nameError && (
                <p className="text-[11px] text-rose-600 pl-2">{nameError}</p>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
