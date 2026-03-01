// API pour vérifier si un contact est déverrouillé - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { unlocked: false, error: "Non connecté" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        { error: "ID du locataire requis" },
        { status: 400 }
      );
    }

    // Vérifier si le contact est déverrouillé
    const unlockedContact = await db.unlockedContact.findUnique({
      where: {
        landlordId_tenantId: {
          landlordId: user.id,
          tenantId: tenantId,
        },
      },
      include: {
        // @ts-ignore - Prisma génère ce type
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (unlockedContact) {
      return NextResponse.json({
        unlocked: true,
        unlockedAt: unlockedContact.unlockedAt,
      });
    }

    return NextResponse.json({
      unlocked: false,
    });
  } catch (error) {
    console.error("Erreur vérification accès:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
