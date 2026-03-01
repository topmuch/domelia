// API des messages d'une conversation - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Messages d'une conversation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        users: { select: { id: true } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation non trouvée" }, { status: 404 });
    }

    const isParticipant = conversation.users.some((u) => u.id === user.id);
    if (!isParticipant) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Récupérer les messages
    const messages = await db.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
    });

    // Marquer les messages reçus comme lus
    await db.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Erreur messages:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Envoyer un message
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }

    // Vérifier participation
    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation non trouvée" }, { status: 404 });
    }

    const isParticipant = conversation.users.some((u) => u.id === user.id);
    if (!isParticipant) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Créer le message
    const message = await db.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        content: content.trim(),
      },
    });

    // Mettre à jour la conversation
    await db.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Notifier les autres participants
    const otherUsers = conversation.users.filter((u) => u.id !== user.id);
    for (const otherUser of otherUsers) {
      await db.notification.create({
        data: {
          userId: otherUser.id,
          type: "message",
          title: "Nouveau message",
          content: `${user.name || "Un utilisateur"} vous a envoyé un message`,
          link: `/messagerie/${id}`,
        },
      });
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Erreur envoi message:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
