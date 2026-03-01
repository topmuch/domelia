// API de vérification SIRET - Domelia.fr
import { NextRequest, NextResponse } from "next/server";

// Algorithme de Luhn pour valider le SIRET
function validateSiretLuhn(siret: string): boolean {
  if (!/^\d{14}$/.test(siret)) return false;
  
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(siret[i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

// Appel à l'API SIRENE de l'INSEE (simulation pour le développement)
async function verifySiretWithInsee(siret: string): Promise<{
  valid: boolean;
  companyName?: string;
  address?: string;
  error?: string;
}> {
  try {
    // En production, utiliser l'API INSEE avec un token
    // Pour le développement, on simule une vérification
    
    const INSEE_API_KEY = process.env.INSEE_API_KEY;
    const INSEE_SECRET = process.env.INSEE_SECRET;
    
    if (!INSEE_API_KEY || !INSEE_SECRET) {
      // Mode développement - on accepte le SIRET si le format est valide
      console.log("Mode développement: SIRET validé sans vérification INSEE");
      return {
        valid: true,
        companyName: "Entreprise (à compléter)",
      };
    }
    
    // Appel réel à l'API INSEE
    // Obtenir le token
    const tokenResponse = await fetch("https://api.insee.fr/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=client_credentials&client_id=${INSEE_API_KEY}&client_secret=${INSEE_SECRET}`,
    });
    
    if (!tokenResponse.ok) {
      throw new Error("Erreur d'authentification INSEE");
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Rechercher l'établissement
    const sireneResponse = await fetch(
      `https://api.insee.fr/entreprises/sirene/V3.11/siret/${siret}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json",
        },
      }
    );
    
    if (!sireneResponse.ok) {
      if (sireneResponse.status === 404) {
        return {
          valid: false,
          error: "SIRET introuvable dans la base SIRENE",
        };
      }
      throw new Error("Erreur lors de la recherche SIRENE");
    }
    
    const sireneData = await sireneResponse.json();
    const etablissement = sireneData.etablissement;
    
    // Vérifier que l'établissement est actif
    if (etablissement.etatAdministratifEtablissement !== "A") {
      return {
        valid: false,
        error: "Cet établissement n'est plus en activité",
      };
    }
    
    return {
      valid: true,
      companyName: etablissement.uniteLegale?.denominationUniteLegale || etablissement.uniteLegale?.nomUniteLegale || undefined,
      address: `${etablissement.adresseEtablissement?.numeroVoieEtablissement || ""} ${etablissement.adresseEtablissement?.typeVoieEtablissement || ""} ${etablissement.adresseEtablissement?.libelleVoieEtablissement || ""}`.trim() || undefined,
    };
  } catch (error) {
    console.error("Erreur vérification SIRET:", error);
    // En cas d'erreur, on accepte le SIRET si le format est valide (fallback)
    return {
      valid: true,
      companyName: "Entreprise (vérification manuelle requise)",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siret } = body;
    
    if (!siret) {
      return NextResponse.json(
        { valid: false, error: "Numéro SIRET requis" },
        { status: 400 }
      );
    }
    
    // Nettoyer le SIRET
    const cleanSiret = siret.replace(/\s/g, "");
    
    // Vérifier le format
    if (!/^\d{14}$/.test(cleanSiret)) {
      return NextResponse.json(
        { valid: false, error: "Le SIRET doit contenir exactement 14 chiffres" },
        { status: 400 }
      );
    }
    
    // Vérifier avec l'algorithme de Luhn
    if (!validateSiretLuhn(cleanSiret)) {
      return NextResponse.json(
        { valid: false, error: "Numéro SIRET invalide (erreur de vérification)" },
        { status: 400 }
      );
    }
    
    // Vérifier auprès de l'INSEE
    const result = await verifySiretWithInsee(cleanSiret);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur API vérification SIRET:", error);
    return NextResponse.json(
      { valid: false, error: "Erreur lors de la vérification du SIRET" },
      { status: 500 }
    );
  }
}
