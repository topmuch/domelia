// API pour récupérer les contacts déverrouillés - Domelia.fr
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non connecté" },
        { status: 401 }
      );
    }

    // Récupérer les contacts déverrouillés par ce propriétaire
    const unlockedContacts = await db.unlockedContact.findMany({
      where: {
        landlordId: user.id,
      },
      orderBy: {
        unlockedAt: "desc",
      },
    });

    // Enrichir avec les infos du profil locataire
    const enrichedContacts = await Promise.all(
      unlockedContacts.map(async (contact) => {
        const tenantProfile = await db.tenantProfile.findUnique({
          where: { id: contact.tenantId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            city: true,
            budget: true,
          },
        });

        const payment = await db.payment.findUnique({
          where: { id: contact.paymentId },
          select: {
            amount: true,
            createdAt: true,
          },
        });

        return {
          id: contact.id,
          tenantId: contact.tenantId,
          unlockedAt: contact.unlockedAt,
          tenantProfile,
          payment,
        };
      })
    );

    return NextResponse.json({
      contacts: enrichedContacts,
    });
  } catch (error) {
    console.error("Erreur récupération contacts déverrouillés:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
