// API pour capturer un paiement PayPal pour service professionnel - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Récupérer les paramètres PayPal depuis la base de données
async function getPayPalConfig() {
  const settings = await db.setting.findMany({
    where: {
      key: { in: ['paypalClientId', 'paypalSecret', 'paypalMode'] }
    }
  });

  const config: Record<string, string> = {};
  settings.forEach(s => {
    config[s.key] = s.value;
  });

  return {
    clientId: config.paypalClientId || process.env.PAYPAL_CLIENT_ID || '',
    secret: config.paypalSecret || process.env.PAYPAL_SECRET || '',
    mode: config.paypalMode || 'sandbox',
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "professionnel") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const proAccount = await db.professionalAccount.findUnique({
      where: { userId: user.id },
    });

    if (!proAccount) {
      return NextResponse.json({ error: "Compte professionnel non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { orderId, serviceId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande requis" }, { status: 400 });
    }

    // Trouver le paiement correspondant
    const payment = await db.proSubscriptionPayment.findFirst({
      where: {
        paypalOrderId: orderId,
        proId: proAccount.id,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Paiement non trouvé" }, { status: 404 });
    }

    if (payment.status === "succeeded") {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        message: "Paiement déjà effectué",
      });
    }

    // Récupérer la configuration PayPal
    const paypalConfig = await getPayPalConfig();

    // Mode mock
    if (orderId.startsWith("MOCK_PRO_")) {
      await processSuccessfulPayment(payment, serviceId, proAccount.id);

      return NextResponse.json({
        success: true,
        mockMode: true,
        message: "Paiement simulé avec succès",
      });
    }

    // Capturer le paiement PayPal réel
    const paypalApiBase = paypalConfig.mode === 'production'
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    const auth = Buffer.from(`${paypalConfig.clientId}:${paypalConfig.secret}`).toString("base64");

    // Obtenir le token d'accès
    const tokenResponse = await fetch(`${paypalApiBase}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      throw new Error("Impossible d'obtenir le token PayPal");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Capturer la commande
    const captureResponse = await fetch(
      `${paypalApiBase}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json();
      console.error("PayPal capture error:", errorData);

      await db.proSubscriptionPayment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });

      throw new Error("Erreur lors de la capture du paiement");
    }

    const captureData = await captureResponse.json();

    // Vérifier le statut
    const captureStatus = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.status;

    if (captureStatus === "COMPLETED") {
      await processSuccessfulPayment(payment, serviceId, proAccount.id);

      return NextResponse.json({
        success: true,
        message: "Paiement effectué avec succès",
      });
    } else {
      await db.proSubscriptionPayment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });

      return NextResponse.json({
        success: false,
        error: "Le paiement n'a pas pu être complété",
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Erreur capture paiement PayPal Pro:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error?.message },
      { status: 500 }
    );
  }
}

// Fonction pour traiter un paiement réussi
async function processSuccessfulPayment(
  payment: any,
  serviceId: string | undefined,
  proId: string
) {
  // Mettre à jour le paiement
  await db.proSubscriptionPayment.update({
    where: { id: payment.id },
    data: { status: "succeeded" },
  });

  if (payment.type === "monthly") {
    // Abonnement mensuel
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.professionalAccount.update({
      where: { id: proId },
      data: {
        subscriptionType: "monthly",
        subscriptionEnd: endDate,
        partnerBadge: true,
      },
    });

    // Activer tous les services existants
    await db.proService.updateMany({
      where: { proId, isPaid: false },
      data: { isPaid: true, isActive: true },
    });
  } else {
    // Paiement à l'annonce
    if (serviceId) {
      await db.proService.update({
        where: { id: serviceId },
        data: { isPaid: true, isActive: true, paymentId: payment.id },
      });
    }

    // Mettre à jour le type d'abonnement
    await db.professionalAccount.update({
      where: { id: proId },
      data: { subscriptionType: "per_ad" },
    });
  }
}
