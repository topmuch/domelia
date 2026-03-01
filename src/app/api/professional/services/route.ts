// API pour gérer les services professionnels - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Liste les services du professionnel connecté
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "professionnel") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const proAccount = await db.professionalAccount.findUnique({
      where: { userId: user.id },
    });

    if (!proAccount) {
      return NextResponse.json({ error: "Compte professionnel non trouvé" }, { status: 404 });
    }

    const services = await db.proService.findMany({
      where: { proId: proAccount.id },
      include: {
        _count: {
          select: { requests: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error("Erreur récupération services:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau service (sans paiement)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "professionnel") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const proAccount = await db.professionalAccount.findUnique({
      where: { userId: user.id },
    });

    if (!proAccount) {
      return NextResponse.json({ error: "Compte professionnel non trouvé" }, { status: 404 });
    }

    if (!proAccount.isApproved) {
      return NextResponse.json(
        { error: "Votre compte professionnel doit être approuvé pour publier des services" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { category, title, description, price, priceType, zone, photos, paymentType } = body;

    // Validations
    if (!category || !title) {
      return NextResponse.json(
        { error: "Catégorie et titre sont obligatoires" },
        { status: 400 }
      );
    }

    const validCategories = ["demenagement", "garde_meubles", "assurance", "nettoyage", "travaux", "autre"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Catégorie invalide" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a un abonnement mensuel actif
    const hasActiveSubscription = proAccount.subscriptionType === "monthly" &&
      (!proAccount.subscriptionEnd || new Date(proAccount.subscriptionEnd) > new Date());

    // Créer le service (en attente de paiement si pas d'abonnement)
    const service = await db.proService.create({
      data: {
        proId: proAccount.id,
        category,
        title,
        description: description || null,
        price: price ? Math.round(price * 100) : null, // Convertir en centimes
        priceType: priceType || "fixed",
        zone: zone || proAccount.zone,
        photos: photos ? JSON.stringify(photos) : null,
        isActive: false, // Inactif jusqu'au paiement
        isPaid: hasActiveSubscription, // Payé automatiquement si abonnement
      },
    });

    return NextResponse.json({
      success: true,
      service,
      requiresPayment: !hasActiveSubscription,
      message: hasActiveSubscription
        ? "Service publié avec succès"
        : "Service créé. Veuillez procéder au paiement pour le publier.",
    });
  } catch (error: any) {
    console.error("Erreur création service:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création", details: error?.message },
      { status: 500 }
    );
  }
}
