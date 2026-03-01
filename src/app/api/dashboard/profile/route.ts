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

    // Recuperer le profil complet avec les annonces en parallele
    const [userProfile, listings, colocations, services] = await Promise.all([
      // Profil utilisateur avec tenantProfile
      db.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          tenantProfile: true,
        },
      }),
      // Annonces de logement (landlord listings)
      db.landlordListing.findMany({
        where: { userId: user.id },
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
      }),
      // Colocations
      db.colocListing.findMany({
        where: { userId: user.id },
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
      }),
      // Services (via proId)
      db.serviceAd.findMany({
        where: { proId: user.id },
        select: {
          id: true,
          title: true,
          category: true,
          isActive: true,
          views: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!userProfile) {
      return NextResponse.json(
        { error: "Utilisateur non trouve" },
        { status: 404 }
      );
    }

    // Calculer les statistiques
    const totalViews = 
      listings.reduce((sum, l) => sum + l.views, 0) +
      colocations.reduce((sum, c) => sum + c.views, 0) +
      services.reduce((sum, s) => sum + s.views, 0) +
      (userProfile.tenantProfile?.views || 0);

    const activeListings = 
      listings.filter(l => l.isActive).length +
      colocations.filter(c => c.isActive).length +
      services.filter(s => s.isActive).length;

    return NextResponse.json({
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        createdAt: userProfile.createdAt,
      },
      tenantProfile: userProfile.tenantProfile,
      listings: listings,
      colocations: colocations,
      services: services,
      stats: {
        totalViews,
        activeListings,
        totalListings: listings.length + colocations.length,
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
