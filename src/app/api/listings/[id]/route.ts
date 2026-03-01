// API pour gerer une annonce individuelle - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Recuperer une annonce par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await db.landlordListing.findUnique({
      where: { id },
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

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvee" },
        { status: 404 }
      );
    }

    // Incrementer les vues
    await db.landlordListing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Erreur lors de la recuperation de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PATCH - Modifier une annonce (proprietaire uniquement)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non connecte" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verifier que l'annonce appartient a l'utilisateur
    const existingListing = await db.landlordListing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: "Annonce non trouvee" },
        { status: 404 }
      );
    }

    if (existingListing.userId !== user.id) {
      return NextResponse.json(
        { error: "Vous n'etes pas autorise a modifier cette annonce" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      location,
      address,
      price,
      surface,
      rooms,
      photos,
      isActive,
      latitude,
      longitude,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (address !== undefined) updateData.address = address;
    if (price !== undefined) updateData.price = parseInt(price.toString());
    if (surface !== undefined) updateData.surface = surface ? parseInt(surface.toString()) : null;
    if (rooms !== undefined) updateData.rooms = rooms ? parseInt(rooms.toString()) : null;
    if (photos !== undefined) updateData.photos = photos;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude.toString()) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude.toString()) : null;

    const updatedListing = await db.landlordListing.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, listing: updatedListing });
  } catch (error) {
    console.error("Erreur lors de la modification de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une annonce (proprietaire uniquement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non connecte" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verifier que l'annonce appartient a l'utilisateur
    const existingListing = await db.landlordListing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: "Annonce non trouvee" },
        { status: 404 }
      );
    }

    if (existingListing.userId !== user.id) {
      return NextResponse.json(
        { error: "Vous n'etes pas autorise a supprimer cette annonce" },
        { status: 403 }
      );
    }

    await db.landlordListing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Annonce supprimee" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
