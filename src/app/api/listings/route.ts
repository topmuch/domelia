// API des annonces propriétaires - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Récupérer toutes les annonces actives
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const city = searchParams.get("city");
    const type = searchParams.get("type");

    const whereClause: Record<string, unknown> = {
      isActive: true,
      user: { isActive: true } // Vérifier que l'utilisateur est aussi actif
    };
    if (city) {
      whereClause.location = { contains: city, mode: "insensitive" };
    }
    if (type) {
      whereClause.type = type;
    }

    const listings = await db.landlordListing.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Erreur lors de la récupération des annonces:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des annonces" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle annonce
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      type,
      title,
      description,
      location,
      address,
      price,
      surface,
      rooms,
      photos,
      latitude,
      longitude,
    } = body;

    // Validation
    if (!title || !location || !price) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires" },
        { status: 400 }
      );
    }

    const listing = await db.landlordListing.create({
      data: {
        userId: user.id,
        type: type || "logement",
        title,
        description,
        location,
        address,
        price: parseInt(price.toString()),
        surface: surface ? parseInt(surface.toString()) : null,
        rooms: rooms ? parseInt(rooms.toString()) : null,
        photos,
        latitude: latitude ? parseFloat(latitude.toString()) : null,
        longitude: longitude ? parseFloat(longitude.toString()) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    console.error("Erreur lors de la création de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'annonce" },
      { status: 500 }
    );
  }
}
