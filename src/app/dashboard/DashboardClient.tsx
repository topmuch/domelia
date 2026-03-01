"use client";

import { useState } from "react";
import Link from "next/link";
import { UnlockedContactsList } from "@/components/domelia/UnlockedContactsList";

interface TenantProfile {
  id: string;
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
  views: number;
}

interface Listing {
  id: string;
  title: string;
  category: string;
  location?: string;
  price?: number | null;
  isActive: boolean;
  views: number;
}

interface DashboardClientProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
  tenantProfile: TenantProfile | null;
  listings: Listing[];
}

export default function DashboardClient({ user, tenantProfile, listings: initialListings }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("profil");
  const [listings, setListings] = useState(initialListings);
  
  // Stocker le user dans une variable pour les conditions
  const isProprietaire = user.role === "proprietaire" || user.role === "admin";

  const handleToggle = async (id: string, category: string, currentStatus: boolean) => {
    try {
      const endpoint = category === "colocation" 
        ? `/api/colocations/${id}` 
        : category === "service" 
        ? `/api/services/${id}` 
        : `/api/listings/${id}`;
      
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setListings(prev => prev.map(l => l.id === id ? { ...l, isActive: !currentStatus } : l));
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleDelete = async (id: string, category: string) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    
    try {
      const endpoint = category === "colocation" 
        ? `/api/colocations/${id}` 
        : category === "service" 
        ? `/api/services/${id}` 
        : `/api/listings/${id}`;
      
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== id));
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const getLink = (l: Listing) => {
    if (l.category === "colocation") return `/annonce/coloc/${l.id}`;
    if (l.category === "service") return `/prestataire/${l.id}`;
    return `/annonce/logement/${l.id}`;
  };

  const getCategoryIcon = (cat: string) => cat === "logement" ? "🏢" : cat === "colocation" ? "🛏️" : "🔧";
  const getCategoryLabel = (cat: string) => cat === "logement" ? "Logement" : cat === "colocation" ? "Colocation" : "Service";

  return (
    <>
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden border border-[#F1F5F9]">
        <div className="flex border-b border-[#F1F5F9] overflow-x-auto">
          {[
            { id: "profil", label: "Mon profil", icon: "👤" },
            { id: "annonces", label: "Mes annonces", icon: "🏠" },
            ...(isProprietaire ? [{ id: "contacts", label: "Mes contacts", icon: "🔓" }] : []),
            { id: "parametres", label: "Parametres", icon: "⚙️" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                activeTab === tab.id
                  ? "text-[#560591] border-b-2 border-[#560591] bg-[#FAF5FF]"
                  : "text-[#475569] hover:text-[#1E293B] hover:bg-[#F8FAFC]"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#F1F5F9]">
        {/* Profil */}
        {activeTab === "profil" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-xl font-bold text-[#1E293B]">Mon profil</h2>
              {tenantProfile && (
                <Link
                  href={`/modifier-profil/${tenantProfile.id}`}
                  className="bg-[#560591] text-white px-4 py-2 rounded-xl hover:bg-[#3D0466] transition-colors text-sm font-medium"
                >
                  Modifier
                </Link>
              )}
            </div>

            {tenantProfile ? (
              <div className="bg-[#FAF5FF] rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tenantProfile.firstName && (
                    <div>
                      <p className="text-sm text-[#475569]">Prenom</p>
                      <p className="font-semibold text-[#1E293B]">{tenantProfile.firstName}</p>
                    </div>
                  )}
                  {tenantProfile.lastName && (
                    <div>
                      <p className="text-sm text-[#475569]">Nom</p>
                      <p className="font-semibold text-[#1E293B]">{tenantProfile.lastName}</p>
                    </div>
                  )}
                  {tenantProfile.city && (
                    <div>
                      <p className="text-sm text-[#475569]">Ville</p>
                      <p className="font-semibold text-[#1E293B]">{tenantProfile.city}</p>
                    </div>
                  )}
                  {tenantProfile.budget && (
                    <div>
                      <p className="text-sm text-[#475569]">Budget</p>
                      <p className="font-semibold text-[#1E293B]">{tenantProfile.budget} EUR/mois</p>
                    </div>
                  )}
                  {tenantProfile.jobStatus && (
                    <div>
                      <p className="text-sm text-[#475569]">Situation</p>
                      <p className="font-semibold text-[#1E293B]">{tenantProfile.jobStatus}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-[#475569]">Garant</p>
                    <p className="font-semibold text-[#1E293B]">{tenantProfile.hasGuarantor ? "Oui" : "Non"}</p>
                  </div>
                </div>
                {tenantProfile.description && (
                  <div className="mt-4">
                    <p className="text-sm text-[#475569]">Description</p>
                    <p className="text-[#1E293B]">{tenantProfile.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">👤</p>
                <h3 className="text-lg font-semibold mb-2">Aucun profil cree</h3>
                <p className="text-[#475569] mb-6">Creez votre profil pour etre visible par les proprietaires</p>
                <Link href="/je-cherche" className="bg-[#560591] text-white px-6 py-3 rounded-xl inline-block hover:bg-[#3D0466]">
                  Creer mon profil
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Annonces */}
        {activeTab === "annonces" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-xl font-bold text-[#1E293B]">Mes annonces</h2>
              <Link href="/je-loue" className="bg-[#560591] text-white px-4 py-2 rounded-xl hover:bg-[#3D0466] text-sm font-medium">
                + Publier
              </Link>
            </div>

            {listings.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {listings.map(l => (
                  <div key={l.id} className={`p-4 rounded-xl border ${l.isActive ? "border-[#EDE9FE] bg-white" : "border-[#F1F5F9] bg-[#F8FAFC]"}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getCategoryIcon(l.category)}</span>
                        <div>
                          <p className="font-semibold">{l.title}</p>
                          <p className="text-sm text-[#475569]">
                            {l.location && <span>📍 {l.location} </span>}
                            {l.price && <span>💰 {l.price} EUR </span>}
                            <span>👁️ {l.views}</span>
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${l.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                              {l.isActive ? "Actif" : "Inactif"}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                              {getCategoryLabel(l.category)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Link href={getLink(l)} className="p-2 rounded hover:bg-gray-100">👁️</Link>
                        <button onClick={() => handleToggle(l.id, l.category, l.isActive)} className="p-2 rounded hover:bg-gray-100">
                          {l.isActive ? "⏸️" : "▶️"}
                        </button>
                        <button onClick={() => handleDelete(l.id, l.category)} className="p-2 rounded hover:bg-red-50 text-red-500">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">🏠</p>
                <h3 className="text-lg font-semibold mb-2">Aucune annonce</h3>
                <p className="text-[#475569] mb-6">Publiez votre premiere annonce</p>
                <Link href="/je-loue" className="bg-[#560591] text-white px-6 py-3 rounded-xl inline-block hover:bg-[#3D0466]">
                  Publier
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Contacts déverrouillés (propriétaires uniquement) */}
        {activeTab === "contacts" && isProprietaire && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-xl font-bold text-[#1E293B]">Mes contacts déverrouillés</h2>
              <Link
                href="/profils-locataires"
                className="bg-[#560591] text-white px-4 py-2 rounded-xl hover:bg-[#3D0466] text-sm font-medium"
              >
                + Débloquer
              </Link>
            </div>

            <p className="text-[#475569]">
              Retrouvez tous les locataires dont vous avez déverrouillé les coordonnées (2€ par contact).
            </p>

            <UnlockedContactsList />
          </div>
        )}

        {/* Parametres */}
        {activeTab === "parametres" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1E293B]">Parametres</h2>
            
            <div className="bg-[#FAF5FF] rounded-xl p-4">
              <h3 className="font-semibold mb-2">Informations</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-[#475569]">Email:</span> {user.email}</p>
                <p><span className="text-[#475569]">Nom:</span> {user.name || "Non defini"}</p>
              </div>
            </div>

            <Link
              href="/deconnexion"
              className="w-full bg-gray-100 text-[#475569] py-3 rounded-xl hover:bg-gray-200 font-medium text-center block"
            >
              Se deconnecter
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
