// API pour gérer une demande de service professionnel - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Détails d'une demande
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const serviceRequest = await db.serviceRequest.findFirst({
      where: {
        id,
        proId: proAccount.id,
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    if (!serviceRequest) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ request: serviceRequest });
  } catch (error: any) {
    console.error("Erreur récupération demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

// PATCH - Modifier le statut d'une demande
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { status, proNotes } = body;

    // Vérifier que la demande appartient au professionnel
    const existingRequest = await db.serviceRequest.findFirst({
      where: { id, proId: proAccount.id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    // Valider le statut
    const validStatuses = ["nouveau", "en_cours", "termine", "archive"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (proNotes !== undefined) updateData.proNotes = proNotes;

    const updatedRequest = await db.serviceRequest.update({
      where: { id },
      data: updateData,
    });

    // Mettre à jour le compteur de demandes du professionnel si la demande passe à "termine"
    if (status === "termine" && existingRequest.status !== "termine") {
      await db.professionalAccount.update({
        where: { id: proAccount.id },
        data: { totalRequests: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error: any) {
    console.error("Erreur mise à jour demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// DELETE - Archiver une demande
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Vérifier que la demande appartient au professionnel
    const existingRequest = await db.serviceRequest.findFirst({
      where: { id, proId: proAccount.id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    // Archiver au lieu de supprimer
    await db.serviceRequest.update({
      where: { id },
      data: { status: "archive" },
    });

    return NextResponse.json({ success: true, message: "Demande archivée" });
  } catch (error: any) {
    console.error("Erreur archivage demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'archivage" },
      { status: 500 }
    );
  }
}
