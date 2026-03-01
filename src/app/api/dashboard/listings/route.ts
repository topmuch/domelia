// API pour les annonces du dashboard - Domelia.fr
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non connecte" },
        { status: 401 }
      );
    }

    // Recuperer toutes les annonces de l'utilisateur
    const [listings, colocations, services] = await Promise.all([
      db.landlordListing.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      db.colocListing.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      db.serviceAd.findMany({
        where: { proId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Formatter les annonces pour l'affichage
    const allListings = [
      ...listings.map(l => ({
        ...l,
        category: "logement",
        photos: l.photos ? JSON.parse(l.photos) : [],
      })),
      ...colocations.map(c => ({
        ...c,
        category: "colocation",
        photos: c.photos ? JSON.parse(c.photos) : [],
      })),
      ...services.map(s => ({
        ...s,
        category: "service",
      })),
    ];

    // Statistiques
    const stats = {
      totalListings: allListings.length,
      activeListings: allListings.filter(l => l.isActive).length,
      totalViews: allListings.reduce((sum, l) => sum + l.views, 0),
      byType: {
        logement: listings.length,
        colocation: colocations.length,
        service: services.length,
      },
    };

    return NextResponse.json({
      listings: allListings,
      stats,
    });
  } catch (error) {
    console.error("Erreur lors de la recuperation des annonces:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
