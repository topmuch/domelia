// API des colocations - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Récupérer toutes les colocations actives avec filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const city = searchParams.get("city");
    const maxPrice = searchParams.get("maxPrice");
    const type = searchParams.get("type"); // "chambre" ou "recherche_coloc"

    const whereClause: Record<string, unknown> = {
      isActive: true,
    };

    if (city) {
      whereClause.location = { contains: city, mode: "insensitive" };
    }
    if (maxPrice) {
      whereClause.price = { lte: parseInt(maxPrice) };
    }
    if (type && (type === "chambre" || type === "recherche_coloc")) {
      whereClause.type = type;
    }

    const [listings, total] = await Promise.all([
      db.colocListing.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      db.colocListing.count({ where: whereClause }),
    ]);

    // Incrémenter le compteur de vues pour chaque annonce (optionnel, seulement si demandé)
    const withViews = listings.map((listing) => ({
      ...listing,
      user: {
        ...listing.user,
        initials: listing.user.name
          ? listing.user.name.charAt(0).toUpperCase()
          : "?",
      },
    }));

    return NextResponse.json({
      listings: withViews,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des colocations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des colocations" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle annonce de colocation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour créer une annonce" },
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
      photos,
      latitude,
      longitude,
    } = body;

    // Validation
    if (!type || !title || !location || !price) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires (type, titre, ville, budget)" },
        { status: 400 }
      );
    }

    // Vérifier que le type est valide
    if (type !== "chambre" && type !== "recherche_coloc") {
      return NextResponse.json(
        { error: "Type d'annonce invalide. Utilisez 'chambre' ou 'recherche_coloc'" },
        { status: 400 }
      );
    }

    const listing = await db.colocListing.create({
      data: {
        userId: user.id,
        type,
        title,
        description: description || null,
        location,
        address: address || null,
        price: parseInt(price.toString()),
        surface: surface ? parseInt(surface.toString()) : null,
        photos: photos ? JSON.stringify(photos) : null,
        latitude: latitude ? parseFloat(latitude.toString()) : null,
        longitude: longitude ? parseFloat(longitude.toString()) : null,
        isActive: true,
        views: 0,
      },
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
    console.error("Erreur lors de la création de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'annonce" },
      { status: 500 }
    );
  }
}
