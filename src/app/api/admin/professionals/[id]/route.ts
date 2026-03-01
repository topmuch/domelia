// API SuperAdmin pour gérer un professionnel - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

// GET - Détails d'un professionnel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const professional = await db.professionalAccount.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            isActive: true,
          },
        },
        services: {
          include: {
            _count: {
              select: { requests: true },
            },
          },
        },
        requests: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            requesterName: true,
            requesterEmail: true,
            status: true,
            createdAt: true,
            service: {
              select: { title: true },
            },
          },
        },
        subscriptionPayments: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Professionnel non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ professional });
  } catch (error: any) {
    console.error("Erreur récupération professionnel:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

// PATCH - Modifier le statut d'un professionnel
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;

    // Actions possibles
    const validActions = [
      "approve",
      "reject",
      "verify",
      "unverify",
      "grant_partner",
      "revoke_partner",
      "suspend",
      "activate",
    ];

    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: "Action invalide" },
        { status: 400 }
      );
    }

    const professional = await db.professionalAccount.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Professionnel non trouvé" },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let userUpdateData: any = {};
    let logAction = "";
    let logDetails = "";

    switch (action) {
      case "approve":
        updateData = { isApproved: true, isVerified: true };
        logAction = "approve";
        logDetails = `Compte professionnel approuvé: ${professional.companyName}`;
        break;

      case "reject":
        updateData = { isApproved: false, isVerified: false };
        logAction = "reject";
        logDetails = `Compte professionnel rejeté: ${professional.companyName}. Raison: ${reason || "Non spécifiée"}`;
        break;

      case "verify":
        updateData = { isVerified: true };
        logAction = "verify";
        logDetails = `SIRET vérifié pour: ${professional.companyName}`;
        break;

      case "unverify":
        updateData = { isVerified: false };
        logAction = "unverify";
        logDetails = `Vérification SIRET révoquée pour: ${professional.companyName}`;
        break;

      case "grant_partner":
        updateData = {
          partnerBadge: true,
          subscriptionType: "monthly",
          subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
        };
        logAction = "grant_partner";
        logDetails = `Badge partenaire accordé à: ${professional.companyName}`;
        break;

      case "revoke_partner":
        updateData = { partnerBadge: false };
        logAction = "revoke_partner";
        logDetails = `Badge partenaire révoqué pour: ${professional.companyName}`;
        break;

      case "suspend":
        userUpdateData = { isActive: false };
        logAction = "suspend";
        logDetails = `Compte suspendu: ${professional.companyName}. Raison: ${reason || "Non spécifiée"}`;
        break;

      case "activate":
        userUpdateData = { isActive: true };
        logAction = "activate";
        logDetails = `Compte réactivé: ${professional.companyName}`;
        break;
    }

    // Mise à jour du compte professionnel
    await db.professionalAccount.update({
      where: { id },
      data: updateData,
    });

    // Mise à jour de l'utilisateur si nécessaire
    if (Object.keys(userUpdateData).length > 0) {
      await db.user.update({
        where: { id: professional.userId },
        data: userUpdateData,
      });
    }

    // Log admin
    await db.adminLog.create({
      data: {
        adminId: session.userId,
        action: logAction,
        targetType: "professional",
        targetId: id,
        details: logDetails,
      },
    });

    // Notification au professionnel
    await db.notification.create({
      data: {
        userId: professional.userId,
        type: "system",
        title: getNotificationTitle(action),
        content: getNotificationContent(action, reason),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Action effectuée avec succès",
    });
  } catch (error: any) {
    console.error("Erreur mise à jour professionnel:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un professionnel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const professional = await db.professionalAccount.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Professionnel non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer l'utilisateur (cascade supprime le compte pro)
    await db.user.delete({
      where: { id: professional.userId },
    });

    // Log admin
    await db.adminLog.create({
      data: {
        adminId: session.userId,
        action: "delete",
        targetType: "professional",
        targetId: id,
        details: `Compte professionnel supprimé: ${professional.companyName}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Professionnel supprimé définitivement",
    });
  } catch (error: any) {
    console.error("Erreur suppression professionnel:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

function getNotificationTitle(action: string): string {
  const titles: Record<string, string> = {
    approve: "🎉 Votre compte est approuvé !",
    reject: "Mise à jour de votre compte",
    verify: "✅ SIRET vérifié",
    unverify: "Vérification SIRET révoquée",
    grant_partner: "⭐ Vous êtes maintenant Partenaire officiel !",
    revoke_partner: "Statut partenaire révoqué",
    suspend: "Compte suspendu",
    activate: "Compte réactivé",
  };
  return titles[action] || "Mise à jour de votre compte";
}

function getNotificationContent(action: string, reason?: string): string {
  const contents: Record<string, string> = {
    approve: "Votre compte professionnel a été approuvé. Vous pouvez maintenant publier vos services sur Domelia.",
    reject: `Votre demande d'inscription a été refusée. ${reason ? `Raison: ${reason}` : "Contactez le support pour plus d'informations."}`,
    verify: "Votre numéro SIRET a été vérifié avec succès.",
    unverify: "La vérification de votre SIRET a été révoquée. Veuillez nous contacter.",
    grant_partner: "Félicitations ! Vous bénéficiez maintenant du badge Partenaire officiel et de tous ses avantages.",
    revoke_partner: "Votre statut de partenaire officiel a été révoqué.",
    suspend: `Votre compte a été suspendu. ${reason ? `Raison: ${reason}` : "Contactez le support pour plus d'informations."}`,
    activate: "Votre compte a été réactivé. Vous pouvez à nouveau utiliser nos services.",
  };
  return contents[action] || "Une mise à jour a été effectuée sur votre compte.";
}
