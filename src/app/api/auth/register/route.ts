// API d'inscription - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role = "locataire" } = body;

    // Validation des données
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

    // Créer l'utilisateur
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        name: name || email.split("@")[0],
        role: role,
      },
    });

    // Connecter l'utilisateur automatiquement
    await setCurrentUser(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
