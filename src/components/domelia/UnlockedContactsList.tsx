// Composant liste des contacts déverrouillés - Domelia.fr
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface UnlockedContact {
  id: string;
  tenantId: string;
  unlockedAt: string;
  tenantProfile: {
    id: string;
    firstName: string;
    lastName: string | null;
    city: string;
    budget: number | null;
  } | null;
  payment: {
    amount: number;
    createdAt: string;
  } | null;
}

export function UnlockedContactsList() {
  const [contacts, setContacts] = useState<UnlockedContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/unlocked-contacts");
        if (res.ok) {
          const data = await res.json();
          setContacts(data.contacts || []);
        }
      } catch (error) {
        console.error("Erreur chargement contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-[#560591] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-3">🔓</p>
        <h3 className="font-semibold text-[#1E293B] mb-2">Aucun contact déverrouillé</h3>
        <p className="text-[#475569] text-sm mb-4">
          Parcourez les profils locataires et déverrouillez leurs coordonnées pour les contacter.
        </p>
        <Link
          href="/profils-locataires"
          className="inline-block bg-[#560591] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#3D0466]"
        >
          Voir les locataires
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="p-4 rounded-xl border border-[#EDE9FE] bg-white hover:shadow-sm transition-shadow"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#560591] flex items-center justify-center text-white font-bold">
                {contact.tenantProfile?.firstName?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-semibold text-[#1E293B]">
                  {contact.tenantProfile?.firstName} {contact.tenantProfile?.lastName}
                </p>
                <p className="text-sm text-[#475569]">
                  📍 {contact.tenantProfile?.city}
                  {contact.tenantProfile?.budget && (
                    <span className="ml-2">💰 {contact.tenantProfile.budget}€/mois</span>
                  )}
                </p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                    ✓ Déverrouillé
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                    {contact.payment?.amount}€ payé
                  </span>
                </div>
              </div>
            </div>
            <Link
              href={`/messagerie?contact=${contact.tenantId}`}
              className="bg-[#560591] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#3D0466]"
            >
              💬 Message
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
