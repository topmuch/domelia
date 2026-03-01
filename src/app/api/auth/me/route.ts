// API pour recuperer l'utilisateur connecte - Domelia.fr
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non connecte", authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantProfile: user.tenantProfile,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la recuperation de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur serveur", authenticated: false },
      { status: 500 }
    );
  }
}
