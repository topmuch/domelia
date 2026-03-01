// Utilitaires d'authentification pour Domelia.fr
import { cookies } from "next/headers";
import { db } from "./db";
import { randomBytes, createHash } from "crypto";

// Hash du mot de passe avec SHA-256
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

// Vérification du mot de passe
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Génération d'un token de session
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

// Création d'une session
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
  
  // Pour SQLite, on stocke le token dans un cookie
  // La validation se fait côté serveur
  return token;
}

// Récupération de l'utilisateur courant
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("domelia_user_id")?.value;
  
  if (!userId) {
    return null;
  }
  
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      tenantProfile: true,
    },
  });
  
  return user;
}

// Définition de l'utilisateur connecté dans les cookies
export async function setCurrentUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set("domelia_user_id", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 jours
    path: "/",
  });
}

// Déconnexion
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("domelia_user_id");
}

// Vérifier un token et retourner l'utilisateur
export async function verifyToken(token: string) {
  // Le token est en fait l'userId dans notre système simple
  try {
    const user = await db.user.findUnique({
      where: { id: token },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}
