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

// Déchiffrer une donnée sensible
function decryptSensitiveData(encryptedData: string): string {
  const key = getEncryptionKey();
  const [ivHex, encrypted] = encryptedData.split(":");
  if (!ivHex || !encrypted) {
    throw new Error("Format de données chiffrées invalide");
  }
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
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

// Interface pour les données de backup
interface BackupData {
  metadata: {
    version: string;
    exportedAt: string;
    exportedBy: string;
    platform: string;
    type: string;
  };
  statistics: Record<string, number>;
  users: Array<{
    id: string;
    email_encrypted: string;
    email_masked: string;
    name: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
    password_hash_encrypted: string | null;
  }>;
  tenantProfiles: Array<{
    id: string;
    userId: string;
    firstName: string;
    lastName: string | null;
    city: string;
    budget: number;
    housingType: string | null;
    jobStatus: string;
    hasGuarantor: boolean;
    urgency: string;
    description: string | null;
    phone: string | null;
    isActive: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
  }>;
  landlordListings: Array<{
    id: string;
    userId: string;
    type: string;
    title: string;
    description: string | null;
    location: string;
    address: string | null;
    price: number;
    surface: number | null;
    rooms: number | null;
    photos: string | null;
    isActive: boolean;
    views: number;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
    updatedAt: string;
  }>;
  colocListings: Array<{
    id: string;
    userId: string;
    type: string;
    title: string;
    description: string | null;
    location: string;
    address: string | null;
    price: number;
    surface: number | null;
    photos: string | null;
    latitude: number | null;
    longitude: number | null;
    isActive: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
  }>;
  professionalAccounts: Array<{
    id: string;
    userId: string;
    companyName: string;
    siret_encrypted: string | null;
    siretHash: string;
    phone: string | null;
    zone: string;
    logo: string | null;
    description: string | null;
    isVerified: boolean;
    isApproved: boolean;
    subscriptionType: string;
    subscriptionEnd: string | null;
    partnerBadge: boolean;
    totalViews: number;
    totalRequests: number;
    createdAt: string;
  }>;
  proServices: Array<{
    id: string;
    proId: string;
    category: string;
    title: string;
    description: string | null;
    price: number | null;
    priceType: string;
    photos: string | null;
    zone: string | null;
    isActive: boolean;
    isPaid: boolean;
    paymentId: string | null;
    views: number;
    createdAt: string;
    updatedAt: string;
  }>;
  serviceAds: Array<{
    id: string;
    proId: string;
    company: string | null;
    siret: string | null;
    category: string;
    title: string;
    description: string | null;
    price: number | null;
    zone: string | null;
    photo: string | null;
    isVerified: boolean;
    isActive: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
  }>;
  payments: Array<{
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: string;
    type: string;
    targetId: string;
    paypalOrderId: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  unlockedContacts: Array<{
    id: string;
    landlordId: string;
    tenantId: string;
    unlockedAt: string;
  }>;
  settings: Array<{
    id: string;
    key: string;
    value: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

// API de restauration - POST
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification SuperAdmin
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le fichier JSON
    const formData = await request.formData();
    const file = formData.get("backup") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Vérifier le type de fichier
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      return NextResponse.json({ error: "Le fichier doit être un fichier JSON" }, { status: 400 });
    }

    // Lire et parser le contenu
    const content = await file.text();
    let backupData: BackupData;

    try {
      backupData = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Format JSON invalide" }, { status: 400 });
    }

    // Vérifier la structure du backup
    if (!backupData.metadata || !backupData.metadata.platform || backupData.metadata.platform !== "Domelia.fr") {
      return NextResponse.json({ error: "Ce fichier n'est pas une sauvegarde Domelia valide" }, { status: 400 });
    }

    if (backupData.metadata.type !== "secure_backup") {
      return NextResponse.json({ error: "Type de sauvegarde non reconnu" }, { status: 400 });
    }

    // Statistiques de restauration
    const stats = {
      users: 0,
      tenantProfiles: 0,
      landlordListings: 0,
      colocListings: 0,
      professionalAccounts: 0,
      proServices: 0,
      serviceAds: 0,
      payments: 0,
      unlockedContacts: 0,
      settings: 0,
      errors: [] as string[],
    };

    // Restaurer les utilisateurs
    for (const user of backupData.users || []) {
      try {
        const email = decryptSensitiveData(user.email_encrypted);
        const passwordHash = user.password_hash_encrypted 
          ? decryptSensitiveData(user.password_hash_encrypted) 
          : "";

        await db.user.upsert({
          where: { id: user.id },
          create: {
            id: user.id,
            email,
            passwordHash,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
            createdAt: new Date(user.createdAt),
          },
          update: {
            email,
            passwordHash,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
          },
        });
        stats.users++;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        stats.errors.push(`User ${user.id}: ${errorMessage}`);
      }
    }

    // Restaurer les profils locataires
    for (const profile of backupData.tenantProfiles || []) {
      try {
        const phone = profile.phone ? decryptSensitiveData(profile.phone) : null;
        await db.tenantProfile.upsert({
          where: { id: profile.id },
          create: {
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
            phone,
            isActive: profile.isActive,
            views: profile.views,
            createdAt: new Date(profile.createdAt),
            updatedAt: new Date(profile.updatedAt),
          },
          update: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            city: profile.city,
            budget: profile.budget,
            housingType: profile.housingType,
            jobStatus: profile.jobStatus,
            hasGuarantor: profile.hasGuarantor,
            urgency: profile.urgency,
            description: profile.description,
            phone,
            isActive: profile.isActive,
            views: profile.views,
            updatedAt: new Date(profile.updatedAt),
          },
        });
        stats.tenantProfiles++;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        stats.errors.push(`TenantProfile ${profile.id}: ${errorMessage}`);
      }
    }

    // Restaurer les annonces propriétaires
    for (const listing of backupData.landlordListings || []) {
      try {
        await db.landlordListing.upsert({
          where: { id: listing.id },
          create: {
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
            createdAt: new Date(listing.createdAt),
            updatedAt: new Date(listing.updatedAt),
          },
          update: {
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
            updatedAt: new Date(listing.updatedAt),
          },
        });
        stats.landlordListings++;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        stats.errors.push(`LandlordListing ${listing.id}: ${errorMessage}`);
      }
    }

    // Restaurer les annonces colocation
    for (const listing of backupData.colocListings || []) {
      try {
        await db.colocListing.upsert({
          where: { id: listing.id },
          create: {
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
            createdAt: new Date(listing.createdAt),
            updatedAt: new Date(listing.updatedAt),
          },
          update: {
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
            updatedAt: new Date(listing.updatedAt),
          },
        });
        stats.colocListings++;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        stats.errors.push(`ColocListing ${listing.id}: ${errorMessage}`);
      }
    }

    // Restaurer les comptes professionnels
    for (const pro of backupData.professionalAccounts || []) {
      try {
        const siret = pro.siret_encrypted ? decryptSensitiveData(pro.siret_encrypted) : null;
        const phone = pro.phone ? decryptSensitiveData(pro.phone) : null;

        await db.professionalAccount.upsert({
          where: { id: pro.id },
          create: {
            id: pro.id,
            userId: pro.userId,
            companyName: pro.companyName,
            siret,
            siretHash: pro.siretHash,
            phone,
            zone: pro.zone,
            logo: pro.logo,
            description: pro.description,
            isVerified: pro.isVerified,
            isApproved: pro.isApproved,
            subscriptionType: pro.subscriptionType,
            subscriptionEnd: pro.subscriptionEnd ? new Date(pro.subscriptionEnd) : null,
            partnerBadge: pro.partnerBadge,
            totalViews: pro.totalViews,
            totalRequests: pro.totalRequests,
            createdAt: new Date(pro.createdAt),
          },
          update: {
            companyName: pro.companyName,
            siret,
            siretHash: pro.siretHash,
            phone,
            zone: pro.zone,
            logo: pro.logo,
            description: pro.description,
            isVerified: pro.isVerified,
            isApproved: pro.isApproved,
            subscriptionType: pro.subscriptionType,
            subscriptionEnd: pro.subscriptionEnd ? new Date(pro.subscriptionEnd) : null,
            partnerBadge: pro.partnerBadge,
            totalViews: pro.totalViews,
            totalRequests: pro.totalRequests,
          },
        });
        stats.professionalAccounts++;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        stats.errors.push(`ProfessionalAccount ${pro.id}: ${errorMessage}`);
      }
    }

    // Restaurer les services professionnels
    for (const service of backupData.proServices || []) {
      try {
        await db.proService.upsert({
          where: { id: service.id },
          create: {
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
            createdAt: new Date(service.createdAt),
            updatedAt: new Date(service.updatedAt),
          },
          update: {
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
            updatedAt: new Date(service.updatedAt),
          },
        });
        stats.proServices++;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        stats.errors.push(`ProService ${service.id}: ${errorMessage}`);
      }
    }

    // Restaurer les anciens services
    for (const ad of backupData.serviceAds || []) {
      try {
        const siret = ad.siret ? decryptSensitiveData(ad.siret) : null;
        await db.serviceAd.upsert({
          where: { id: ad.id },
          create: {
            id: ad.id,
            proId: ad.proId,
            company: ad.company,
            siret,
            category: ad.category,
            title: ad.title,
            description: ad.description,
            price: ad.price,
            zone: ad.zone,
            photo: ad.photo,
            isVerified: ad.isVerified,
            isActive: ad.isActive,
            views: ad.views,
            createdAt: new Date(ad.createdAt),
            updatedAt: new Date(ad.updatedAt),
          },
          update: {
            company: ad.company,
            siret,
            category: ad.category,
            title: ad.title,
            description: ad.description,
            price: ad.price,
            zone: ad.zone,
            photo: ad.photo,
            isVerified: ad.isVerified,
            isActive: ad.isActive,
            views: ad.views,
            updatedAt: new Date(ad.updatedAt),
          },
        });
        stats.serviceAds++;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        stats.errors.push(`ServiceAd ${ad.id}: ${errorMessage}`);
      }
    }

    // Restaurer les paiements
    for (const payment of backupData.payments || []) {
      try {
        await db.payment.upsert({
          where: { id: payment.id },
          create: {
            id: payment.id,
            userId: payment.userId,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            type: payment.type,
            targetId: payment.targetId,
            paypalOrderId: payment.paypalOrderId,
            createdAt: new Date(payment.createdAt),
            updatedAt: new Date(payment.updatedAt),
          },
          update: {
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            type: payment.type,
            targetId: payment.targetId,
            paypalOrderId: payment.paypalOrderId,
            updatedAt: new Date(payment.updatedAt),
          },
        });
        stats.payments++;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        stats.errors.push(`Payment ${payment.id}: ${errorMessage}`);
      }
    }

    // Restaurer les contacts déverrouillés
    for (const contact of backupData.unlockedContacts || []) {
      try {
        await db.unlockedContact.upsert({
          where: { id: contact.id },
          create: {
            id: contact.id,
            landlordId: contact.landlordId,
            tenantId: contact.tenantId,
            unlockedAt: new Date(contact.unlockedAt),
          },
          update: {
            landlordId: contact.landlordId,
            tenantId: contact.tenantId,
            unlockedAt: new Date(contact.unlockedAt),
          },
        });
        stats.unlockedContacts++;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        stats.errors.push(`UnlockedContact ${contact.id}: ${errorMessage}`);
      }
    }

    // Restaurer les paramètres (sauf les valeurs masquées)
    for (const setting of backupData.settings || []) {
      try {
        // Ne pas restaurer les valeurs masquées
        if (setting.value === "***HIDDEN***") {
          continue;
        }

        await db.setting.upsert({
          where: { id: setting.id },
          create: {
            id: setting.id,
            key: setting.key,
            value: setting.value,
            createdAt: new Date(setting.createdAt),
            updatedAt: new Date(setting.updatedAt),
          },
          update: {
            key: setting.key,
            value: setting.value,
            updatedAt: new Date(setting.updatedAt),
          },
        });
        stats.settings++;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        stats.errors.push(`Setting ${setting.key}: ${errorMessage}`);
      }
    }

    // Logger l'action
    await db.adminLog.create({
      data: {
        adminId: session.userId,
        action: "restore",
        targetType: "system",
        targetId: "database",
        details: `Restauration depuis backup: ${backupData.metadata.exportedAt}`,
      },
    }).catch(() => {
      // Ignorer les erreurs de log
    });

    return NextResponse.json({
      success: true,
      message: "Restauration terminée",
      stats,
      backupDate: backupData.metadata.exportedAt,
      backupVersion: backupData.metadata.version,
    });

  } catch (error: unknown) {
    console.error("Erreur lors de la restauration:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Erreur lors de la restauration", details: errorMessage },
      { status: 500 }
    );
  }
}
