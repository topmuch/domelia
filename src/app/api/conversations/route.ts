// API des conversations - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Liste des conversations de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const conversations = await db.conversation.findMany({
      where: {
        users: {
          some: { id: user.id },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        users: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Enrichir avec infos du dernier message et interlocuteur
    const enriched = conversations.map((conv) => {
      const otherUser = conv.users.find((u) => u.id !== user.id);
      const lastMessage = conv.messages[0];
      return {
        ...conv,
        otherUser,
        lastMessage,
      };
    });

    return NextResponse.json({ conversations: enriched });
  } catch (error) {
    console.error("Erreur conversations:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer une nouvelle conversation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { recipientId, listingId, listingType, initialMessage } = await request.json();

    if (!recipientId) {
      return NextResponse.json({ error: "Destinataire requis" }, { status: 400 });
    }

    // Vérifier si conversation existe déjà
    const existing = await db.conversation.findFirst({
      where: {
        AND: [
          { users: { some: { id: user.id } } },
          { users: { some: { id: recipientId } } },
          listingId ? { listingId } : { listingId: null },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ conversation: existing, exists: true });
    }

    // Créer la conversation
    const conversation = await db.conversation.create({
      data: {
        participants: JSON.stringify([user.id, recipientId]),
        listingId,
        listingType,
        users: {
          connect: [{ id: user.id }, { id: recipientId }],
        },
      },
    });

    // Ajouter le message initial si fourni
    if (initialMessage) {
      await db.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          content: initialMessage,
        },
      });
    }

    // Notifier le destinataire
    await db.notification.create({
      data: {
        userId: recipientId,
        type: "message",
        title: "Nouveau message",
        content: `Vous avez reçu un nouveau message de ${user.name || "un utilisateur"}`,
        link: `/messagerie/${conversation.id}`,
      },
    });

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error("Erreur création conversation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
