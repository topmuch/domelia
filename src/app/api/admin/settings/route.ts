// API pour gérer les paramètres de l'application - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Récupérer tous les paramètres
export async function GET() {
  try {
    const settings = await db.setting.findMany();
    
    // Convertir en objet clé-valeur
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    
    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error("Erreur récupération paramètres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    );
  }
}

// POST - Mettre à jour les paramètres
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;
    
    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Paramètres invalides" },
        { status: 400 }
      );
    }
    
    // Mettre à jour chaque paramètre
    for (const [key, value] of Object.entries(settings)) {
      await db.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur mise à jour paramètres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres" },
      { status: 500 }
    );
  }
}
