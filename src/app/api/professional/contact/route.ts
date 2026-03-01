// API pour les demandes de contact professionnelles - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, name, email, phone, message } = body;

    // Validations
    if (!serviceId || !name || !email || !message) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    // Vérifier que le service existe (peut être un ProService ou un ServiceAd)
    let proService = await db.proService.findUnique({
      where: { id: serviceId },
      include: {
        pro: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });

    // Si pas trouvé, essayer les anciens services (ServiceAd)
    let proId: string;
    let serviceTitle: string;
    let proUserId: string | null = null;

    if (proService) {
      // Vérifier que le pro est approuvé
      if (!proService.pro.isApproved) {
        return NextResponse.json(
          { error: "Ce professionnel n'est pas encore approuvé" },
          { status: 400 }
        );
      }
      proId = proService.proId;
      serviceTitle = proService.title;
      proUserId = proService.pro.user.id;
    } else {
      // Essayer ServiceAd (ancien modèle)
      const serviceAd = await db.serviceAd.findUnique({
        where: { id: serviceId },
      });

      if (serviceAd) {
        proId = serviceAd.proId;
        serviceTitle = serviceAd.title;
      } else {
        // Pour les services de démo, simuler un succès
        return NextResponse.json({
          success: true,
          requestId: `demo-${Date.now()}`,
          message: "Demande envoyée avec succès (mode démo)",
        });
      }
    }

    // Récupérer l'utilisateur connecté (optionnel)
    const user = await getCurrentUser();

    // Créer la demande (seulement si proService existe)
    if (proService) {
      await db.serviceRequest.create({
        data: {
          serviceId,
          proId,
          requesterId: user?.id || "guest",
          requesterName: name,
          requesterEmail: email,
          requesterPhone: phone || null,
          message,
          status: "nouveau",
        },
      });

      // Mettre à jour les compteurs
      await db.professionalAccount.update({
        where: { id: proId },
        data: {
          totalRequests: { increment: 1 },
        },
      });

      // Créer une notification pour le pro
      if (proUserId) {
        await db.notification.create({
          data: {
            userId: proUserId,
            type: "system",
            title: "Nouvelle demande de contact",
            content: `${name} souhaite vous contacter pour "${serviceTitle}"`,
            link: "/dashboard-pro?tab=demandes",
          },
        }).catch(() => {
          // Ignorer les erreurs de notification
        });
      }
    }

    return NextResponse.json({
      success: true,
      requestId: `req-${Date.now()}`,
      message: "Demande envoyée avec succès",
    });
  } catch (error) {
    console.error("Erreur création demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la demande" },
      { status: 500 }
    );
  }
}
