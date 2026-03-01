// API détail colocation - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Récupérer une colocation par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await db.colocListing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            tenantProfile: {
              select: {
                firstName: true,
                lastName: true,
                jobStatus: true,
              },
            },
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      );
    }

    // Incrémenter le compteur de vues
    await db.colocListing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Ajouter les initiales de l'utilisateur
    const listingWithInitials = {
      ...listing,
      user: {
        ...listing.user,
        initials: listing.user.name
          ? listing.user.name.charAt(0).toUpperCase()
          : "?",
        isVerified: listing.user.tenantProfile !== null, // Profil vérifié si tenantProfile existe
      },
    };

    return NextResponse.json({ listing: listingWithInitials });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'annonce" },
      { status: 500 }
    );
  }
}

// PATCH - Modifier une colocation (propriétaire uniquement)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    // Vérifier que l'annonce appartient à l'utilisateur
    const existingListing = await db.colocListing.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      );
    }

    if (existingListing.userId !== user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier cette annonce" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Champs modifiables
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.location) updateData.location = body.location;
    if (body.address !== undefined) updateData.address = body.address || null;
    if (body.price) updateData.price = parseInt(body.price.toString());
    if (body.surface !== undefined) updateData.surface = body.surface ? parseInt(body.surface.toString()) : null;
    if (body.photos) updateData.photos = JSON.stringify(body.photos);
    if (body.latitude !== undefined) updateData.latitude = body.latitude ? parseFloat(body.latitude.toString()) : null;
    if (body.longitude !== undefined) updateData.longitude = body.longitude ? parseFloat(body.longitude.toString()) : null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const listing = await db.colocListing.update({
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

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    console.error("Erreur lors de la modification de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'annonce" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une colocation (propriétaire uniquement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    // Vérifier que l'annonce appartient à l'utilisateur
    const existingListing = await db.colocListing.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      );
    }

    if (existingListing.userId !== user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer cette annonce" },
        { status: 403 }
      );
    }

    await db.colocListing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Annonce supprimée" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'annonce" },
      { status: 500 }
    );
  }
}
