// API Reviews pour les services
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Liste des avis d'un service
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const page = parseInt(new URL(request.url).searchParams.get("page") || "1");
    const limit = parseInt(new URL(request.url).searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const service = await db.serviceAd.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service non trouvé" },
        { status: 404 }
      );
    }

    const [reviews, total] = await Promise.all([
      db.serviceReview.findMany({
        where: { serviceId: id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.serviceReview.count({ where: { serviceId: id } }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur récupération avis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des avis" },
      { status: 500 }
    );
  }
}

// POST - Poster un avis (authentification requise)
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const { rating, comment } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La note doit être comprise entre 1 et 5" },
        { status: 400 }
      );
    }

    // Vérifier que le service existe
    const service = await db.serviceAd.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur n'a pas déjà posté un avis
    const existingReview = await db.serviceReview.findFirst({
      where: {
        serviceId: id,
        userId: user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Vous avez déjà posté un avis pour ce service" },
        { status: 400 }
      );
    }

    // Créer l'avis
    const review = await db.serviceReview.create({
      data: {
        serviceId: id,
        userId: user.id,
        rating: parseInt(rating),
        comment: comment || null,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Erreur création avis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'avis" },
      { status: 500 }
    );
  }
}
