// API Conversation individuelle
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Détails d'une conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    const participants = JSON.parse(conversation.participants) as string[];
    if (!participants.includes(user.id)) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer les infos des autres participants
    const otherUserIds = participants.filter((pId) => pId !== user.id);
    const otherUsers = await db.user.findMany({
      where: { id: { in: otherUserIds } },
      select: { id: true, name: true, email: true },
    });

    // Récupérer les infos de l'annonce liée
    let listingInfo: { id: string; title?: string; firstName?: string; price?: number; location?: string; city?: string; category?: string } | null = null;
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

    // Marquer les messages comme lus
    await db.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({
      conversation: {
        ...conversation,
        otherUsers,
        listingInfo,
      },
    });
  } catch (error) {
    console.error("Erreur récupération conversation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la conversation" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const conversation = await db.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    const participants = JSON.parse(conversation.participants) as string[];
    if (!participants.includes(user.id)) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Supprimer la conversation (cascade delete des messages)
    await db.conversation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression conversation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la conversation" },
      { status: 500 }
    );
  }
}
