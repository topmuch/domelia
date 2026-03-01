// API Services - Liste et création
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Liste des services avec filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres de filtre
    const category = searchParams.get("category");
    const zone = searchParams.get("zone");
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Construction des filtres
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (category && category !== "all") {
      where.category = category;
    }

    if (zone) {
      where.zone = {
        contains: zone,
      };
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) {
        (where.price as Record<string, unknown>).gte = parseInt(priceMin);
      }
      if (priceMax) {
        (where.price as Record<string, unknown>).lte = parseInt(priceMax);
      }
    }

    // Récupération des services
    const [services, total] = await Promise.all([
      db.serviceAd.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: [
          { isVerified: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      db.serviceAd.count({ where }),
    ]);

    // Calcul de la note moyenne pour chaque service
    const servicesWithRating = services.map((service) => {
      const avgRating = service.reviews.length > 0
        ? service.reviews.reduce((acc, r) => acc + r.rating, 0) / service.reviews.length
        : null;
      
      return {
        ...service,
        avgRating,
        reviewCount: service.reviews.length,
        reviews: undefined, // On ne renvoie pas les avis individuels dans la liste
      };
    });

    return NextResponse.json({
      services: servicesWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur récupération services:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des services" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau service (authentification requise)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { company, siret, category, title, description, price, zone, photo, priceOnQuote } = body;

    // Validation des champs requis
    if (!category || !title) {
      return NextResponse.json(
        { error: "La catégorie et le titre sont requis" },
        { status: 400 }
      );
    }

    // Vérification que la catégorie est valide
    const validCategories = ["demenagement", "assurance", "bricolage", "menage", "stockage", "autre"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Catégorie invalide" },
        { status: 400 }
      );
    }

    // Création du service
    const service = await db.serviceAd.create({
      data: {
        proId: user.id,
        company: company || user.name || null,
        siret: siret || null,
        category,
        title,
        description: description || null,
        price: priceOnQuote ? null : (price ? parseInt(price) : null),
        zone: zone || null,
        photo: photo || null,
        isVerified: false,
        isActive: true,
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

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("Erreur création service:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du service" },
      { status: 500 }
    );
  }
}
