// API pour capturer un paiement PayPal - Domelia.fr
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

// Fonction pour obtenir le token d'accès PayPal
async function getPayPalAccessToken(clientId: string, secret: string, mode: string) {
  const paypalApiBase = mode === 'production'
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
    
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const response = await fetch(`${paypalApiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
  return { accessToken: data.access_token, paypalApiBase };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non connecté" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, paymentId } = body;

    if (!orderId || !paymentId) {
      return NextResponse.json(
        { error: "orderId et paymentId requis" },
        { status: 400 }
      );
    }

    // Vérifier que le paiement appartient à l'utilisateur
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.userId !== user.id) {
      return NextResponse.json(
        { error: "Paiement introuvable ou non autorisé" },
        { status: 404 }
      );
    }

    // Si déjà réussi, retourner directement
    if (payment.status === "succeeded") {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        tenantId: payment.targetId,
      });
    }

    // Mode mock pour le développement (si pas de config PayPal ou orderId commence par MOCK)
    if (orderId.startsWith("MOCK_ORDER_")) {
      // Simuler un paiement réussi
      await db.payment.update({
        where: { id: paymentId },
        data: { status: "succeeded" },
      });

      // Créer le contact déverrouillé
      await db.unlockedContact.create({
        data: {
          landlordId: user.id,
          tenantId: payment.targetId,
          paymentId: paymentId,
        },
      });

      return NextResponse.json({
        success: true,
        mockMode: true,
        tenantId: payment.targetId,
        message: "Paiement simulé avec succès",
      });
    }

    // Récupérer la configuration PayPal
    const paypalConfig = await getPayPalConfig();
    
    if (!paypalConfig.clientId || !paypalConfig.secret) {
      return NextResponse.json(
        { error: "Configuration PayPal manquante" },
        { status: 500 }
      );
    }

    // Obtenir le token d'accès PayPal
    const { accessToken, paypalApiBase } = await getPayPalAccessToken(
      paypalConfig.clientId,
      paypalConfig.secret,
      paypalConfig.mode
    );

    // Capturer le paiement
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

      await db.payment.update({
        where: { id: paymentId },
        data: { status: "failed" },
      });

      return NextResponse.json(
        { error: "Erreur lors de la capture du paiement" },
        { status: 500 }
      );
    }

    const captureData = await captureResponse.json();

    // Vérifier le statut de la capture
    const captureStatus = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.status;

    if (captureStatus === "COMPLETED") {
      // Mettre à jour le paiement
      await db.payment.update({
        where: { id: paymentId },
        data: { status: "succeeded" },
      });

      // Créer le contact déverrouillé
      await db.unlockedContact.create({
        data: {
          landlordId: user.id,
          tenantId: payment.targetId,
          paymentId: paymentId,
        },
      });

      return NextResponse.json({
        success: true,
        tenantId: payment.targetId,
        paypalCaptureId: captureData.id,
      });
    } else {
      // Paiement non complété
      await db.payment.update({
        where: { id: paymentId },
        data: { status: "failed" },
      });

      return NextResponse.json(
        { error: `Paiement non complété: ${captureStatus}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur capture PayPal:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
