// API de sauvegarde manuelle - SuperAdmin Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import * as crypto from "crypto";

// Clé de chiffrement AES (à stocker dans les variables d'environnement en production)
const getEncryptionKey = () => {
  const key = process.env.BACKUP_ENCRYPTION_KEY || "domelia-backup-key-2024-secure-32b!";
  return crypto.createHash("sha256").update(key).digest();
};

// Chiffrer une donnée sensible
function encryptSensitiveData(data: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

// Masquer partiellement un email pour l'affichage
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const maskedLocal = local.charAt(0) + "***" + (local.length > 1 ? local.charAt(local.length - 1) : "");
  return `${maskedLocal}@${domain}`;
}

// Formater la date pour le nom de fichier
function getBackupFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `domelia-backup-${year}-${month}-${day}.json`;
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification SuperAdmin
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer toutes les données critiques
    const [
      users,
      tenantProfiles,
      landlordListings,
      colocListings,
      professionalAccounts,
      proServices,
      serviceAds,
      payments,
      unlockedContacts,
      settings,
    ] = await Promise.all([
      // Users (sans password_hash en clair)
      db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          passwordHash: true, // On le garde pour restauration mais chiffré
        },
      }),
      // Tenant Profiles
      db.tenantProfile.findMany(),
      // Landlord Listings
      db.landlordListing.findMany(),
      // Coloc Listings
      db.colocListing.findMany(),
      // Professional Accounts
      db.professionalAccount.findMany({
        select: {
          id: true,
          userId: true,
          companyName: true,
          siret: true,
          siretHash: true,
          phone: true,
          zone: true,
          logo: true,
          description: true,
          isVerified: true,
          isApproved: true,
          subscriptionType: true,
          subscriptionEnd: true,
          partnerBadge: true,
          totalViews: true,
          totalRequests: true,
          createdAt: true,
        },
      }),
      // Pro Services
      db.proService.findMany(),
      // Service Ads (anciens services)
      db.serviceAd.findMany(),
      // Payments
      db.payment.findMany({
        select: {
          id: true,
          userId: true,
          amount: true,
          currency: true,
          status: true,
          type: true,
          targetId: true,
          paypalOrderId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      // Unlocked Contacts
      db.unlockedContact.findMany(),
      // Settings
      db.setting.findMany({
        select: {
          id: true,
          key: true,
          // Ne pas inclure la valeur pour les clés sensibles
          value: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    // Préparer les données de sauvegarde avec sécurité
    const backupData = {
      metadata: {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        exportedBy: session.email,
        platform: "Domelia.fr",
        type: "secure_backup",
      },
      statistics: {
        users: users.length,
        tenantProfiles: tenantProfiles.length,
        landlordListings: landlordListings.length,
        colocListings: colocListings.length,
        professionalAccounts: professionalAccounts.length,
        proServices: proServices.length,
        serviceAds: serviceAds.length,
        payments: payments.length,
        unlockedContacts: unlockedContacts.length,
      },
      // Données utilisateurs (emails chiffrés, mots de passe hashés)
      users: users.map((user) => ({
        id: user.id,
        email_encrypted: encryptSensitiveData(user.email),
        email_masked: maskEmail(user.email), // Pour vérification visuelle
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        password_hash_encrypted: user.passwordHash ? encryptSensitiveData(user.passwordHash) : null,
      })),
      // Profils locataires
      tenantProfiles: tenantProfiles.map((profile) => ({
        id: profile.id,
        userId: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        city: profile.city,
        budget: profile.budget,
        housingType: profile.housingType,
        jobStatus: profile.jobStatus,
        hasGuarantor: profile.hasGuarantor,
        urgency: profile.urgency,
        description: profile.description,
        phone: profile.phone ? encryptSensitiveData(profile.phone) : null,
        isActive: profile.isActive,
        views: profile.views,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      })),
      // Annonces propriétaires
      landlordListings: landlordListings.map((listing) => ({
        id: listing.id,
        userId: listing.userId,
        type: listing.type,
        title: listing.title,
        description: listing.description,
        location: listing.location,
        address: listing.address,
        price: listing.price,
        surface: listing.surface,
        rooms: listing.rooms,
        photos: listing.photos,
        isActive: listing.isActive,
        views: listing.views,
        latitude: listing.latitude,
        longitude: listing.longitude,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      })),
      // Annonces colocation
      colocListings: colocListings.map((listing) => ({
        id: listing.id,
        userId: listing.userId,
        type: listing.type,
        title: listing.title,
        description: listing.description,
        location: listing.location,
        address: listing.address,
        price: listing.price,
        surface: listing.surface,
        photos: listing.photos,
        latitude: listing.latitude,
        longitude: listing.longitude,
        isActive: listing.isActive,
        views: listing.views,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      })),
      // Comptes professionnels
      professionalAccounts: professionalAccounts.map((pro) => ({
        id: pro.id,
        userId: pro.userId,
        companyName: pro.companyName,
        siret_encrypted: pro.siret ? encryptSensitiveData(pro.siret) : null,
        siretHash: pro.siretHash,
        phone: pro.phone ? encryptSensitiveData(pro.phone) : null,
        zone: pro.zone,
        logo: pro.logo,
        description: pro.description,
        isVerified: pro.isVerified,
        isApproved: pro.isApproved,
        subscriptionType: pro.subscriptionType,
        subscriptionEnd: pro.subscriptionEnd?.toISOString() || null,
        partnerBadge: pro.partnerBadge,
        totalViews: pro.totalViews,
        totalRequests: pro.totalRequests,
        createdAt: pro.createdAt.toISOString(),
      })),
      // Services professionnels
      proServices: proServices.map((service) => ({
        id: service.id,
        proId: service.proId,
        category: service.category,
        title: service.title,
        description: service.description,
        price: service.price,
        priceType: service.priceType,
        photos: service.photos,
        zone: service.zone,
        isActive: service.isActive,
        isPaid: service.isPaid,
        paymentId: service.paymentId,
        views: service.views,
        createdAt: service.createdAt.toISOString(),
        updatedAt: service.updatedAt.toISOString(),
      })),
      // Anciens services
      serviceAds: serviceAds.map((ad) => ({
        id: ad.id,
        proId: ad.proId,
        company: ad.company,
        siret: ad.siret ? encryptSensitiveData(ad.siret) : null,
        category: ad.category,
        title: ad.title,
        description: ad.description,
        price: ad.price,
        zone: ad.zone,
        photo: ad.photo,
        isVerified: ad.isVerified,
        isActive: ad.isActive,
        views: ad.views,
        createdAt: ad.createdAt.toISOString(),
        updatedAt: ad.updatedAt.toISOString(),
      })),
      // Paiements
      payments: payments.map((payment) => ({
        id: payment.id,
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        type: payment.type,
        targetId: payment.targetId,
        paypalOrderId: payment.paypalOrderId,
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
      })),
      // Contacts déverrouillés
      unlockedContacts: unlockedContacts.map((contact) => ({
        id: contact.id,
        landlordId: contact.landlordId,
        tenantId: contact.tenantId,
        unlockedAt: contact.unlockedAt.toISOString(),
      })),
      // Paramètres (sans les secrets PayPal)
      settings: settings
        .filter((s) => !s.key.toLowerCase().includes("secret"))
        .map((setting) => ({
          id: setting.id,
          key: setting.key,
          value: setting.key.toLowerCase().includes("paypal") ? "***HIDDEN***" : setting.value,
          createdAt: setting.createdAt.toISOString(),
          updatedAt: setting.updatedAt.toISOString(),
        })),
    };

    // Générer le JSON
    const jsonString = JSON.stringify(backupData, null, 2);

    // Créer la réponse avec téléchargement
    const filename = getBackupFilename();

    // Logger l'action
    await db.adminLog.create({
      data: {
        adminId: session.userId,
        action: "backup",
        targetType: "system",
        targetId: "database",
        details: `Sauvegarde complète exportée: ${filename}`,
      },
    }).catch(() => {
      // Ignorer les erreurs de log
    });

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de la sauvegarde:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la sauvegarde", details: error?.message },
      { status: 500 }
    );
  }
}
