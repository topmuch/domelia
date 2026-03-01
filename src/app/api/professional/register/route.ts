// API d'inscription professionnelle - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setCurrentUser } from "@/lib/auth";
import { createHash } from "crypto";

// Fonction pour chiffrer le SIRET (RGPD)
function encryptSiret(siret: string): string {
  const secret = process.env.SIRET_ENCRYPTION_KEY || "domelia-siret-secret-2024";
  return createHash("sha256").update(siret + secret).digest("hex").slice(0, 32);
}

// Fonction pour hasher le SIRET pour vérification unique
function hashSiret(siret: string): string {
  return createHash("sha256").update(siret).digest("hex");
}

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, email, password, siret, phone, zone, category } = body;
    
    // Validations
    if (!companyName || !email || !password || !siret || !zone || !category) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }
    
    const cleanSiret = siret.replace(/\s/g, "");
    
    if (!/^\d{14}$/.test(cleanSiret)) {
      return NextResponse.json(
        { error: "Le SIRET doit contenir exactement 14 chiffres" },
        { status: 400 }
      );
    }
    
    if (!validateSiretLuhn(cleanSiret)) {
      return NextResponse.json(
        { error: "Numéro SIRET invalide" },
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
    
    // Vérifier si le SIRET est déjà enregistré (via le hash)
    const siretHash = hashSiret(cleanSiret);
    const existingPro = await db.professionalAccount.findUnique({
      where: { siretHash },
    });
    
    if (existingPro) {
      return NextResponse.json(
        { error: "Ce numéro SIRET est déjà enregistré sur Domelia" },
        { status: 400 }
      );
    }
    
    // Créer l'utilisateur avec le rôle professionnel
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        name: companyName,
        role: "professionnel",
      },
    });
    
    // Chiffrer le SIRET pour le stockage RGPD
    const encryptedSiret = encryptSiret(cleanSiret);
    
    // Créer le compte professionnel
    const proAccount = await db.professionalAccount.create({
      data: {
        userId: user.id,
        companyName,
        siret: encryptedSiret,
        siretHash,
        phone: phone || null,
        zone,
        isVerified: false, // À vérifier par l'admin
        isApproved: false, // À approuver par l'admin
        subscriptionType: "none",
        partnerBadge: false,
      },
    });
    
    // Créer une notification pour les admins
    await db.notification.create({
      data: {
        userId: "admin", // Sera filtré côté admin
        type: "system",
        title: "Nouvelle inscription professionnelle",
        content: `${companyName} (${category}) souhaite rejoindre Domelia Pro. SIRET: ***${cleanSiret.slice(-4)}`,
        link: "/admin/professionnels",
      },
    }).catch(() => {
      // Ignorer les erreurs de notification
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
      proAccount: {
        id: proAccount.id,
        companyName: proAccount.companyName,
        isVerified: proAccount.isVerified,
        isApproved: proAccount.isApproved,
      },
      message: "Compte professionnel créé avec succès. Votre compte sera vérifié sous 24-48h.",
    });
  } catch (error: any) {
    console.error("Erreur inscription professionnelle:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription", details: error?.message },
      { status: 500 }
    );
  }
}
