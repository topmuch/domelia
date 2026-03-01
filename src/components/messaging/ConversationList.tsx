// Liste des conversations
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Conversation {
  id: string;
  participants: string;
  listingId: string | null;
  listingType: string | null;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    sender: { id: string; name: string | null };
  }>;
  otherUsers: Array<{ id: string; name: string | null; email: string }>;
  unreadCount: number;
  listingInfo: {
    id: string;
    title?: string;
    firstName?: string;
    city?: string;
    price?: number;
    location?: string;
    category?: string;
  } | null;
}

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement");
      }
      const data = await response.json();
      setConversations(data.conversations);
    } catch {
      setError("Impossible de charger les conversations");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#560591]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchConversations}
          className="mt-4 text-[#560591] hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune conversation</h3>
        <p className="text-gray-500">
          Commencez par contacter un propriétaire ou un locataire
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation) => {
        const otherUser = conversation.otherUsers[0];
        const lastMessage = conversation.messages[0];

        return (
          <Link
            key={conversation.id}
            href={`/messagerie/${conversation.id}`}
            className="block p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-[#560591] flex items-center justify-center text-white font-medium flex-shrink-0">
                {getInitials(otherUser?.name)}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {otherUser?.name || "Utilisateur"}
                  </h3>
                  {lastMessage && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTime(lastMessage.createdAt)}
                    </span>
                  )}
                </div>

                {/* Info annonce */}
                {conversation.listingInfo && (
                  <p className="text-xs text-[#560591] mb-1 truncate">
                    📋 {conversation.listingInfo.title || 
                        (conversation.listingInfo.firstName && `Profil de ${conversation.listingInfo.firstName}`) ||
                        "Annonce"}
                  </p>
                )}

                {/* Dernier message */}
                {lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessage.content}
                  </p>
                )}
              </div>

              {/* Badge non lus */}
              {conversation.unreadCount > 0 && (
                <span className="bg-[#560591] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
