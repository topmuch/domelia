// Fenêtre de chat
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  otherUserName: string | null;
  listingInfo?: {
    title?: string;
    price?: number;
    location?: string;
    firstName?: string;
    city?: string;
  } | null;
}

export function ChatWindow({ conversationId, currentUserId, otherUserName, listingInfo }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling pour les nouveaux messages (toutes les 5 secondes)
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Erreur envoi message:", error);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const formatMessageTime = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    
    if (d.toDateString() === today.toDateString()) {
      return format(d, "HH:mm", { locale: fr });
    }
    return format(d, "d MMM à HH:mm", { locale: fr });
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    msgs.forEach((msg) => {
      const date = new Date(msg.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#560591]"></div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      {/* Header */}
      <div className="border-b border-gray-100 p-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#560591] flex items-center justify-center text-white font-medium">
            {otherUserName?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUserName || "Utilisateur"}</h3>
            {listingInfo && (
              <p className="text-xs text-gray-500">
                {listingInfo.title || `Profil - ${listingInfo.city || ""}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                {format(new Date(date), "d MMMM yyyy", { locale: fr })}
              </span>
            </div>

            {/* Messages du jour */}
            {msgs.map((message) => {
              const isOwn = message.senderId === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex mb-2 ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      isOwn
                        ? "bg-[#560591] text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? "text-purple-200" : "text-gray-400"
                      }`}
                    >
                      {formatMessageTime(message.createdAt)}
                      {isOwn && (
                        <span className="ml-2">
                          {message.isRead ? "✓✓" : "✓"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-gray-100 p-4 bg-white">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#560591] focus:bg-white transition-all"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-12 h-12 bg-[#560591] text-white rounded-full flex items-center justify-center hover:bg-[#3D0466] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
