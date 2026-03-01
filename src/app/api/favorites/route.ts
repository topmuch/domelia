// API des favoris - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Liste des favoris de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const favorites = await db.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Enrichir avec les détails de chaque favori
    const enrichedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        let details: any = null;
        try {
          switch (fav.targetType) {
            case "locataire":
              details = await db.tenantProfile.findUnique({
                where: { id: fav.targetId },
                select: { id: true, firstName: true, city: true, budget: true, housingType: true },
              });
              break;
            case "logement":
              details = await db.landlordListing.findUnique({
                where: { id: fav.targetId },
                select: { id: true, title: true, location: true, price: true, surface: true, photos: true },
              });
              break;
            case "coloc":
              details = await db.colocListing.findUnique({
                where: { id: fav.targetId },
                select: { id: true, title: true, location: true, price: true, surface: true, photos: true },
              });
              break;
            case "service":
              details = await db.serviceAd.findUnique({
                where: { id: fav.targetId },
                select: { id: true, title: true, company: true, category: true, price: true, zone: true },
              });
              break;
          }
        } catch {
          // L'élément n'existe peut-être plus
        }
        return { ...fav, details, createdAt: fav.createdAt.toISOString() };
      })
    );

    // Filtrer les favoris dont l'élément n'existe plus
    const validFavorites = enrichedFavorites.filter((f) => f.details !== null);

    return NextResponse.json({ favorites: validFavorites });
  } catch (error) {
    console.error("Erreur favoris:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Ajouter aux favoris
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { targetType, targetId } = await request.json();

    if (!targetType || !targetId) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // Valider le type
    const validTypes = ["locataire", "logement", "coloc", "service"];
    if (!validTypes.includes(targetType)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    // Vérifier si existe déjà
    const existing = await db.favorite.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType,
          targetId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, favorite: existing, exists: true });
    }

    const favorite = await db.favorite.create({
      data: {
        userId: user.id,
        targetType,
        targetId,
      },
    });

    return NextResponse.json({ success: true, favorite });
  } catch (error) {
    console.error("Erreur ajout favori:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Retirer des favoris
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("targetType");
    const targetId = searchParams.get("targetId");

    if (!targetType || !targetId) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    await db.favorite.delete({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType,
          targetId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression favori:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
