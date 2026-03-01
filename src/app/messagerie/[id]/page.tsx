// Page conversation détaillée
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion?redirect=/messagerie");
  }

  const { id } = await params;

  // Récupérer la conversation
  const conversation = await db.conversation.findUnique({
    where: { id },
  });

  if (!conversation) {
    notFound();
  }

  // Vérifier que l'utilisateur est participant
  const participants = JSON.parse(conversation.participants) as string[];
  if (!participants.includes(user.id)) {
    redirect("/messagerie");
  }

  // Récupérer les autres participants
  const otherUserIds = participants.filter((pId) => pId !== user.id);
  const otherUsers = await db.user.findMany({
    where: { id: { in: otherUserIds } },
    select: { id: true, name: true, email: true },
  });

  // Récupérer les infos de l'annonce liée
  let listingInfo = null;
  if (conversation.listingId && conversation.listingType) {
    if (conversation.listingType === "logement") {
      listingInfo = await db.landlordListing.findUnique({
        where: { id: conversation.listingId },
        select: { id: true, title: true, price: true, location: true },
      });
    } else if (conversation.listingType === "coloc") {
      listingInfo = await db.colocListing.findUnique({
        where: { id: conversation.listingId },
        select: { id: true, title: true, price: true, location: true },
      });
    } else if (conversation.listingType === "service") {
      listingInfo = await db.serviceAd.findUnique({
        where: { id: conversation.listingId },
        select: { id: true, title: true, category: true },
      });
    } else if (conversation.listingType === "locataire") {
      listingInfo = await db.tenantProfile.findUnique({
        where: { id: conversation.listingId },
        select: { id: true, firstName: true, city: true },
      });
    }
  }

  const otherUser = otherUsers[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] via-white to-[#EDE9FE]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container-domelia py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/messagerie"
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                {otherUser?.name || "Conversation"}
              </h1>
              {listingInfo && (
                <p className="text-sm text-gray-500">
                  {listingInfo.title || `Profil - ${listingInfo.city || ""}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="container-domelia py-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <ChatWindow
            conversationId={id}
            currentUserId={user.id}
            otherUserName={otherUser?.name || null}
            listingInfo={listingInfo}
          />
        </div>
      </div>
    </div>
  );
}
