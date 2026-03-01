// API pour créer une commande PayPal pour un service professionnel - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Tarifs des services professionnels
const SERVICE_PRICING = {
  per_ad: 5.00,      // 5€ par annonce
  monthly: 15.00,    // 15€ par mois (illimité)
};

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
    const { serviceId, paymentType } = body; // paymentType: "per_ad" ou "monthly"

    if (!paymentType || !['per_ad', 'monthly'].includes(paymentType)) {
      return NextResponse.json({ error: "Type de paiement invalide" }, { status: 400 });
    }

    // Si abonnement mensuel, vérifier si déjà actif
    if (paymentType === 'monthly') {
      const hasActiveSubscription = proAccount.subscriptionType === "monthly" &&
        (!proAccount.subscriptionEnd || new Date(proAccount.subscriptionEnd) > new Date());

      if (hasActiveSubscription) {
        return NextResponse.json({
          error: "Vous avez déjà un abonnement mensuel actif",
          hasActiveSubscription: true,
        }, { status: 400 });
      }
    }

    // Si paiement à l'annonce, vérifier que le service existe
    if (paymentType === 'per_ad' && !serviceId) {
      return NextResponse.json({ error: "ID du service requis pour le paiement à l'annonce" }, { status: 400 });
    }

    const amount = SERVICE_PRICING[paymentType as keyof typeof SERVICE_PRICING];

    // Créer un enregistrement de paiement en attente
    const payment = await db.proSubscriptionPayment.create({
      data: {
        proId: proAccount.id,
        amount,
        type: paymentType,
        status: "pending",
        endDate: paymentType === 'monthly'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
          : null,
      },
    });

    // Récupérer la configuration PayPal
    const paypalConfig = await getPayPalConfig();

    // Si pas de configuration PayPal, utiliser le mode mock
    if (!paypalConfig.clientId || !paypalConfig.secret) {
      const mockOrderId = `MOCK_PRO_${payment.id}_${Date.now()}`;

      await db.proSubscriptionPayment.update({
        where: { id: payment.id },
        data: { paypalOrderId: mockOrderId },
      });

      return NextResponse.json({
        orderId: mockOrderId,
        paymentId: payment.id,
        amount,
        mockMode: true,
        message: "Mode développement - Paiement simulé",
      });
    }

    // Créer une commande PayPal réelle
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

    const description = paymentType === 'monthly'
      ? `Abonnement mensuel Domelia Pro - Services illimités`
      : `Publication d'un service - Domelia Pro`;

    // Créer la commande PayPal
    const orderResponse = await fetch(`${paypalApiBase}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: payment.id,
          description,
          custom_id: JSON.stringify({ serviceId, paymentType }),
          amount: {
            currency_code: "EUR",
            value: amount.toFixed(2),
          },
        }],
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error("PayPal order creation error:", errorData);
      throw new Error("Erreur lors de la création de la commande PayPal");
    }

    const orderData = await orderResponse.json();

    // Mettre à jour le paiement avec l'ID PayPal
    await db.proSubscriptionPayment.update({
      where: { id: payment.id },
      data: { paypalOrderId: orderData.id },
    });

    return NextResponse.json({
      orderId: orderData.id,
      paymentId: payment.id,
      amount,
      mockMode: false,
    });
  } catch (error: any) {
    console.error("Erreur création commande PayPal Pro:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error?.message },
      { status: 500 }
    );
  }
}
