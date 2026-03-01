// API pour le profil dashboard - Domelia.fr
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

    // Recuperer le profil complet avec les annonces
    const fullProfile = await db.user.findUnique({
      where: { id: user.id },
      include: {
        tenantProfile: true,
        listings: {
          select: {
            id: true,
            title: true,
            type: true,
            location: true,
            price: true,
            isActive: true,
            views: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        colocations: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
            isActive: true,
            views: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        services: {
          select: {
            id: true,
            title: true,
            category: true,
            isActive: true,
            views: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!fullProfile) {
      return NextResponse.json(
        { error: "Utilisateur non trouve" },
        { status: 404 }
      );
    }

    // Calculer les statistiques
    const totalViews = 
      fullProfile.listings.reduce((sum, l) => sum + l.views, 0) +
      fullProfile.colocations.reduce((sum, c) => sum + c.views, 0) +
      fullProfile.services.reduce((sum, s) => sum + s.views, 0) +
      (fullProfile.tenantProfile?.views || 0);

    const activeListings = 
      fullProfile.listings.filter(l => l.isActive).length +
      fullProfile.colocations.filter(c => c.isActive).length;

    return NextResponse.json({
      user: {
        id: fullProfile.id,
        email: fullProfile.email,
        name: fullProfile.name,
        role: fullProfile.role,
        createdAt: fullProfile.createdAt,
      },
      tenantProfile: fullProfile.tenantProfile,
      listings: fullProfile.listings,
      colocations: fullProfile.colocations,
      services: fullProfile.services,
      stats: {
        totalViews,
        activeListings,
        totalListings: fullProfile.listings.length + fullProfile.colocations.length,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la recuperation du profil:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
