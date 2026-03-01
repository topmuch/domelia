// API combinée : Inscription + Création profil locataire - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Champs utilisateur
      email,
      password,
      firstName,
      lastName,
      phone,
      // Champs profil
      city,
      budget,
      housingType,
      jobStatus,
      hasGuarantor,
      urgency,
      description,
    } = body;

    // Validation des données utilisateur
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Validation des champs profil
    if (!firstName || !city || !budget || !jobStatus) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires du profil" },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Créer l'utilisateur ET le profil en une seule transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: hashPassword(password),
          name: `${firstName} ${lastName || ''}`.trim(),
          role: "locataire",
        },
      });

      // 2. Créer le profil locataire
      const profile = await tx.tenantProfile.create({
        data: {
          userId: user.id,
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

      return { user, profile };
    });

    // Créer la réponse avec le cookie de session
    const response = NextResponse.json({
      success: true,
      profile: result.profile,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
    });

    // Définir le cookie de session
    response.cookies.set("domelia_user_id", result.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
