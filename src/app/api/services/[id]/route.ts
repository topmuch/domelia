// API Service détail - Lecture, modification, suppression
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Détail d'un service avec avis
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const service = await db.serviceAd.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviews: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service non trouvé" },
        { status: 404 }
      );
    }

    // Incrémenter le compteur de vues
    await db.serviceAd.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Calculer la note moyenne
    const avgRating = service.reviews.length > 0
      ? service.reviews.reduce((acc, r) => acc + r.rating, 0) / service.reviews.length
      : null;

    return NextResponse.json({
      service: {
        ...service,
        avgRating,
        reviewCount: service.reviews.length,
        views: service.views + 1, // Retourner la nouvelle valeur
      },
    });
  } catch (error) {
    console.error("Erreur récupération service:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du service" },
      { status: 500 }
    );
  }
}

// PATCH - Modifier un service (propriétaire uniquement)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Vérifier que le service existe et appartient à l'utilisateur
    const existingService = await db.serviceAd.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service non trouvé" },
        { status: 404 }
      );
    }

    if (existingService.proId !== user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier ce service" },
        { status: 403 }
      );
    }

    // Champs modifiables
    const updateData: Record<string, unknown> = {};
    
    if (body.company !== undefined) updateData.company = body.company;
    if (body.siret !== undefined) updateData.siret = body.siret;
    if (body.category !== undefined) {
      const validCategories = ["demenagement", "assurance", "bricolage", "menage", "stockage", "autre"];
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: "Catégorie invalide" },
          { status: 400 }
        );
      }
      updateData.category = body.category;
    }
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price ? parseInt(body.price) : null;
    if (body.zone !== undefined) updateData.zone = body.zone;
    if (body.photo !== undefined) updateData.photo = body.photo;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updatedService = await db.serviceAd.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ service: updatedService });
  } catch (error) {
    console.error("Erreur modification service:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du service" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un service (propriétaire uniquement)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Vérifier que le service existe et appartient à l'utilisateur
    const existingService = await db.serviceAd.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service non trouvé" },
        { status: 404 }
      );
    }

    if (existingService.proId !== user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer ce service" },
        { status: 403 }
      );
    }

    // Supprimer le service (les avis seront supprimés en cascade)
    await db.serviceAd.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression service:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du service" },
      { status: 500 }
    );
  }
}
