// Page Messagerie - Domelia.fr
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";
import MessagingClient from "./MessagingClient";

export default async function MessageriePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion?redirect=/messagerie");
  }

  // Récupérer les conversations
  const conversations = await db.conversation.findMany({
    where: {
      users: { some: { id: user.id } },
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" as const },
        take: 1,
      },
      users: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { updatedAt: "desc" as const },
  });

  // Enrichir avec les infos
  const enrichedConversations = conversations.map((conv) => {
    const otherUser = conv.users.find((u) => u.id !== user.id);
    const lastMessage = conv.messages[0];
    const participants = JSON.parse(conv.participants as string);
    return {
      id: conv.id,
      otherUser: otherUser || { id: "unknown", name: "Utilisateur", email: "" },
      lastMessage: lastMessage || null,
      updatedAt: conv.updatedAt.toISOString(),
    };
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-[#1E293B] mb-8">
              💬 Mes conversations
            </h1>
            <MessagingClient
              conversations={enrichedConversations}
              currentUserId={user.id}
            />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
