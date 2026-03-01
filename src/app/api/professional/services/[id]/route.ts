// API pour gérer un service professionnel spécifique - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Détails d'un service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = await db.proService.findUnique({
      where: { id },
      include: {
        pro: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        requests: {
          take: 20,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { requests: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error: any) {
    console.error("Erreur récupération service:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

// PATCH - Modifier un service
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "professionnel") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const proAccount = await db.professionalAccount.findUnique({
      where: { userId: user.id },
    });

    if (!proAccount) {
      return NextResponse.json({ error: "Compte professionnel non trouvé" }, { status: 404 });
    }

    // Vérifier que le service appartient au professionnel
    const existingService = await db.proService.findFirst({
      where: { id, proId: proAccount.id },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 });
    }

    const { title, description, price, priceType, zone, photos, isActive } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price ? Math.round(price * 100) : null;
    if (priceType !== undefined) updateData.priceType = priceType;
    if (zone !== undefined) updateData.zone = zone;
    if (photos !== undefined) updateData.photos = photos ? JSON.stringify(photos) : null;
    if (isActive !== undefined && existingService.isPaid) updateData.isActive = isActive;

    const service = await db.proService.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error("Erreur mise à jour service:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "professionnel") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const proAccount = await db.professionalAccount.findUnique({
      where: { userId: user.id },
    });

    if (!proAccount) {
      return NextResponse.json({ error: "Compte professionnel non trouvé" }, { status: 404 });
    }

    // Vérifier que le service appartient au professionnel
    const existingService = await db.proService.findFirst({
      where: { id, proId: proAccount.id },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 });
    }

    await db.proService.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Service supprimé" });
  } catch (error: any) {
    console.error("Erreur suppression service:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
