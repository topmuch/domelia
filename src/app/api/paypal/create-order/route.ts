// API pour créer une commande PayPal - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Récupérer les paramètres PayPal depuis la base de données
async function getPayPalConfig() {
  const settings = await db.setting.findMany({
    where: {
      key: { in: ['paypalClientId', 'paypalSecret', 'paypalMode', 'contactFee'] }
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
    contactFee: parseFloat(config.contactFee || '2.00'),
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 });
    }

    if (user.role !== "proprietaire" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Seuls les propriétaires peuvent contacter les locataires" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json({ error: "ID du locataire requis" }, { status: 400 });
    }

    // Vérifier que le profil locataire existe
    const tenantProfile = await db.tenantProfile.findUnique({
      where: { id: tenantId },
    });

    if (!tenantProfile) {
      return NextResponse.json({ error: "Profil locataire introuvable" }, { status: 404 });
    }

    // Vérifier si ce contact est déjà déverrouillé
    const existingUnlock = await db.unlockedContact.findUnique({
      where: {
        landlordId_tenantId: {
          landlordId: user.id,
          tenantId: tenantId,
        },
      },
    });

    if (existingUnlock) {
      return NextResponse.json({
        alreadyUnlocked: true,
        message: "Ce contact est déjà déverrouillé",
      });
    }

    // Récupérer la configuration PayPal
    const paypalConfig = await getPayPalConfig();
    
    // Créer un enregistrement de paiement en attente
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount: paypalConfig.contactFee,
        currency: "EUR",
        status: "pending",
        type: "contact",
        targetId: tenantId,
      },
    });

    // Si pas de configuration PayPal, utiliser le mode mock
    if (!paypalConfig.clientId || !paypalConfig.secret) {
      const mockOrderId = `MOCK_ORDER_${payment.id}_${Date.now()}`;

      await db.payment.update({
        where: { id: payment.id },
        data: { paypalOrderId: mockOrderId },
      });

      return NextResponse.json({
        orderId: mockOrderId,
        paymentId: payment.id,
        mockMode: true,
        message: "Mode développement - Paiement simulé (configurez PayPal dans l'admin)",
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
          description: `Déverrouillage contact locataire - Domelia.fr`,
          amount: {
            currency_code: "EUR",
            value: paypalConfig.contactFee.toFixed(2),
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
    await db.payment.update({
      where: { id: payment.id },
      data: { paypalOrderId: orderData.id },
    });

    return NextResponse.json({
      orderId: orderData.id,
      paymentId: payment.id,
      mockMode: false,
    });
  } catch (error: any) {
    console.error("Erreur création commande PayPal:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error?.message },
      { status: 500 }
    );
  }
}
