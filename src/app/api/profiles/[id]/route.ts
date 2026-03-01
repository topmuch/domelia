// API profil locataire individuel - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Récupérer un profil par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const profile = await db.tenantProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un profil
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

    // Vérifier que le profil appartient à l'utilisateur
    const existingProfile = await db.tenantProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      );
    }

    if (existingProfile.userId !== user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier ce profil" },
        { status: 403 }
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

    const profile = await db.tenantProfile.update({
      where: { id },
      data: {
        firstName,
        lastName,
        city,
        budget: parseInt(budget),
        housingType: housingType || null,
        jobStatus,
        hasGuarantor: hasGuarantor === true || hasGuarantor === "true",
        urgency: urgency || "flexible",
        description: description || null,
        phone: phone || null,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un profil
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

    // Vérifier que le profil appartient à l'utilisateur
    const existingProfile = await db.tenantProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      );
    }

    if (existingProfile.userId !== user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer ce profil" },
        { status: 403 }
      );
    }

    await db.tenantProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du profil:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du profil" },
      { status: 500 }
    );
  }
}
