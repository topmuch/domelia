// API Signalements
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// POST - Créer un signalement
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetType, targetId, reason, description } = body;

    if (!targetType || !targetId || !reason) {
      return NextResponse.json(
        { error: "Type cible, ID cible et raison sont requis" },
        { status: 400 }
      );
    }

    // Valider le type
    const validTypes = ["locataire", "logement", "coloc", "service", "user"];
    if (!validTypes.includes(targetType)) {
      return NextResponse.json(
        { error: "Type de cible invalide" },
        { status: 400 }
      );
    }

    // Valider la raison
    const validReasons = [
      "contenu_inapproprie",
      "arnaque",
      "fausse_annonce",
      "harcelement",
      "discrimination",
      "spam",
      "autre",
    ];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: "Raison invalide" },
        { status: 400 }
      );
    }

    // Vérifier si un signalement similaire existe déjà
    const existing = await db.report.findFirst({
      where: {
        reporterId: user.id,
        targetType,
        targetId,
        status: "nouveau",
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Vous avez déjà signalé cet élément" },
        { status: 400 }
      );
    }

    // Créer le signalement
    const report = await db.report.create({
      data: {
        reporterId: user.id,
        targetType,
        targetId,
        reason,
        description: description || null,
        status: "nouveau",
      },
    });

    // Créer une notification admin (si un admin existe)
    const admins = await db.user.findMany({
      where: { role: "admin" },
      select: { id: true },
    });

    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: "report",
          title: "Nouveau signalement",
          content: `Un nouveau signalement a été créé pour ${targetType}`,
          link: "/admin/signalements",
        },
      });
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Erreur création signalement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du signalement" },
      { status: 500 }
    );
  }
}
