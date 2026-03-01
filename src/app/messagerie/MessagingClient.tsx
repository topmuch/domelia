"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Conversation {
  id: string;
  otherUser: { id: string; name: string; email: string };
  lastMessage: { content: string; createdAt: string } | null;
  updatedAt: string;
}

interface MessagingClientProps {
  conversations: Conversation[];
  currentUserId: string;
}

export default function MessagingClient({
  conversations: initialConversations,
  currentUserId,
}: MessagingClientProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Charger les messages d'une conversation
  const loadMessages = useCallback(async (convId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sélectionner une conversation
  const handleSelectConv = (convId: string) => {
    setSelectedConv(convId);
    loadMessages(convId);
  };

  // Envoyer un message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    try {
      const res = await fetch(`/api/conversations/${selectedConv}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        setNewMessage("");
        loadMessages(selectedConv);
      }
    } catch {
      console.error("Erreur envoi");
    }
  };

  // Polling pour nouveaux messages
  useEffect(() => {
    if (!selectedConv) return;

    const interval = setInterval(() => {
      loadMessages(selectedConv);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedConv, loadMessages]);

  const selected = conversations.find((c) => c.id === selectedConv);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Liste conversations */}
      <div className="md:col-span-1 bg-white rounded-2xl shadow-luxe overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Conversations</h2>
        </div>
        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-sm">Aucune conversation</p>
              <Link
                href="/"
                className="text-[#560591] text-sm hover:underline mt-2 block"
              >
                Parcourir les annonces
              </Link>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConv(conv.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedConv === conv.id ? "bg-[#FAF5FF]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#560591] flex items-center justify-center text-white font-bold">
                    {(conv.otherUser?.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {conv.otherUser?.name || "Utilisateur"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage?.content || "Nouvelle conversation"}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="md:col-span-2 bg-white rounded-2xl shadow-luxe overflow-hidden flex flex-col min-h-[500px]">
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-5xl mb-4">💬</p>
              <p>Sélectionnez une conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#560591] flex items-center justify-center text-white font-bold">
                {(selected?.otherUser?.name || "?")[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {selected?.otherUser?.name || "Utilisateur"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Chargement...
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === currentUserId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        msg.senderId === currentUserId
                          ? "bg-[#560591] text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.senderId === currentUserId
                            ? "text-white/70"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Formulaire */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-100 flex gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#560591]"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-6 py-3 bg-[#560591] text-white rounded-xl font-semibold hover:bg-[#3D0466] transition-colors disabled:opacity-50"
              >
                Envoyer
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
