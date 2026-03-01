// API des profils locataires - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Récupérer tous les profils actifs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const city = searchParams.get("city");

    const whereClause: any = {
      isActive: true,
      user: { isActive: true } // Vérifier que l'utilisateur est aussi actif
    };
    if (city) {
      whereClause.city = { contains: city, mode: "insensitive" };
    }

    const profiles = await db.tenantProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("Erreur lors de la récupération des profils:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des profils" },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour un profil locataire
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
      firstName,
      lastName,
      city,
      budget,
      housingType,
      jobStatus,
      hasGuarantor,
      urgency,
      description,
      phone,
    } = body;

    // Validation
    if (!firstName || !city || !budget || !jobStatus) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires" },
        { status: 400 }
      );
    }

    // Vérifier si un profil existe déjà
    const existingProfile = await db.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    let profile;
    if (existingProfile) {
      // Mettre à jour
      profile = await db.tenantProfile.update({
        where: { userId: user.id },
        data: {
          firstName,
          lastName,
          city,
          budget: parseInt(budget),
          housingType,
          jobStatus,
          hasGuarantor: hasGuarantor === true || hasGuarantor === "true",
          urgency,
          description,
          phone,
        },
      });
    } else {
      // Créer
      profile = await db.tenantProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          city,
          budget: parseInt(budget),
          housingType,
          jobStatus,
          hasGuarantor: hasGuarantor === true || hasGuarantor === "true",
          urgency,
          description,
          phone,
        },
      });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Erreur lors de la création du profil:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du profil" },
      { status: 500 }
    );
  }
}
