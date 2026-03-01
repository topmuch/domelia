// Composant client du Dashboard Professionnel - Domelia.fr
"use client";

import { useState } from "react";
import Link from "next/link";

interface ProData {
  id: string;
  companyName: string;
  phone: string;
  zone: string;
  logo: string;
  description: string;
  isVerified: boolean;
  isApproved: boolean;
  subscriptionType: string;
  subscriptionEnd: string | null;
  partnerBadge: boolean;
}

interface Service {
  id: string;
  category: string;
  title: string;
  description: string | null;
  price: number | null;
  priceType: string;
  photos: string[];
  zone: string | null;
  isActive: boolean;
  isPaid: boolean;
  views: number;
  createdAt: string;
}

interface Request {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  message: string;
  status: string;
  proNotes: string | null;
  serviceName: string;
  createdAt: string;
}

interface Payment {
  id: string;
  amount: number;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
}

interface Stats {
  totalViews: number;
  totalRequests: number;
  activeServices: number;
  pendingRequests: number;
  thisMonthViews: number;
}

interface ProDashboardClientProps {
  proData: ProData;
  services: Service[];
  requests: Request[];
  payments: Payment[];
  stats: Stats;
  userEmail: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  demenagement: "🚚 Déménagement",
  garde_meubles: "📦 Garde-meubles",
  assurance: "🛡️ Assurance",
  nettoyage: "🧹 Nettoyage",
  travaux: "🔧 Travaux",
  autre: "📋 Autre",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  nouveau: { label: "Nouveau", color: "bg-blue-100 text-blue-700" },
  en_cours: { label: "En cours", color: "bg-yellow-100 text-yellow-700" },
  termine: { label: "Terminé", color: "bg-green-100 text-green-700" },
  archive: { label: "Archivé", color: "bg-gray-100 text-gray-600" },
};

export function ProDashboardClient({
  proData,
  services: initialServices,
  requests: initialRequests,
  payments,
  stats,
  userEmail,
}: ProDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("profil");
  const [services, setServices] = useState(initialServices);
  const [requests, setRequests] = useState(initialRequests);
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState<Request | null>(null);

  // Mise à jour du statut d'une demande
  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/professional/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (error) {
      console.error("Erreur mise à jour:", error);
    }
  };

  // Basculer l'état d'un service
  const toggleService = async (serviceId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/professional/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setServices((prev) =>
          prev.map((s) =>
            s.id === serviceId ? { ...s, isActive: !currentStatus } : s
          )
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <>
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden border border-[#E2E8F0]">
        <div className="flex border-b border-[#E2E8F0] overflow-x-auto">
          {[
            { id: "profil", label: "Mon profil", icon: "👤" },
            { id: "services", label: "Mes services", icon: "📋" },
            { id: "demandes", label: "Demandes reçues", icon: "📩" },
            { id: "abonnement", label: "Abonnement", icon: "💳" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                activeTab === tab.id
                  ? "text-[#10B981] border-b-2 border-[#10B981] bg-[#ECFDF5]"
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
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E2E8F0]">
        {/* Mon profil */}
        {activeTab === "profil" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-xl font-bold text-[#1E293B]">Mon profil professionnel</h2>
              <button className="bg-[#10B981] text-white px-4 py-2 rounded-xl hover:bg-[#059669] transition-colors text-sm font-medium">
                Modifier
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-1">
                    Raison sociale
                  </label>
                  <p className="text-[#1E293B] font-medium">{proData.companyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-1">
                    Email
                  </label>
                  <p className="text-[#1E293B]">{userEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-1">
                    Téléphone
                  </label>
                  <p className="text-[#1E293B]">{proData.phone || "Non renseigné"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-1">
                    Zone d'intervention
                  </label>
                  <p className="text-[#1E293B]">{proData.zone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-1">
                    Statut
                  </label>
                  <div className="flex items-center gap-2">
                    {proData.isVerified ? (
                      <span className="text-[#10B981] flex items-center gap-1 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        SIRET vérifié
                      </span>
                    ) : (
                      <span className="text-[#F59E0B] flex items-center gap-1 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        En attente de vérification
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {proData.description && (
              <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                <label className="block text-sm font-medium text-[#475569] mb-1">
                  Description
                </label>
                <p className="text-[#1E293B]">{proData.description}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
              <h3 className="font-semibold text-[#1E293B] mb-4">Logo de l'entreprise</h3>
              {proData.logo ? (
                <div className="w-32 h-32 rounded-xl overflow-hidden border border-[#E2E8F0]">
                  <img src={proData.logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-xl bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0] flex items-center justify-center">
                  <span className="text-[#94A3B8] text-sm text-center px-4">
                    Aucun logo
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mes services */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-xl font-bold text-[#1E293B]">Mes services</h2>
              <button
                onClick={() => setShowNewServiceModal(true)}
                className="bg-[#10B981] text-white px-4 py-2 rounded-xl hover:bg-[#059669] transition-colors text-sm font-medium flex items-center gap-2"
              >
                <span>+</span>
                Publier un service
              </button>
            </div>

            {services.length > 0 ? (
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 rounded-xl border ${
                      service.isActive && service.isPaid
                        ? "border-[#D1FAE5] bg-[#F0FDF4]"
                        : service.isPaid
                        ? "border-[#E2E8F0] bg-[#F8FAFC]"
                        : "border-[#FEF3C7] bg-[#FFFBEB]"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-4">
                        <span className="text-2xl">
                          {CATEGORY_LABELS[service.category]?.split(" ")[0] || "📋"}
                        </span>
                        <div>
                          <p className="font-semibold text-[#1E293B]">{service.title}</p>
                          <p className="text-sm text-[#475569]">
                            {CATEGORY_LABELS[service.category]}
                            {service.price && (
                              <span className="ml-2">
                                •{" "}
                                {service.priceType === "from"
                                  ? "À partir de "
                                  : service.priceType === "on_quote"
                                  ? "Sur devis"
                                  : ""}
                                {service.priceType !== "on_quote" &&
                                  `${service.price.toLocaleString()} €`}
                              </span>
                            )}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                service.isActive && service.isPaid
                                  ? "bg-green-100 text-green-600"
                                  : service.isPaid
                                  ? "bg-gray-100 text-gray-500"
                                  : "bg-yellow-100 text-yellow-600"
                              }`}
                            >
                              {!service.isPaid
                                ? "⏳ En attente de paiement"
                                : service.isActive
                                ? "✅ Actif"
                                : "⏸️ En pause"}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981]">
                              👁️ {service.views} vues
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {service.isPaid && (
                          <button
                            onClick={() => toggleService(service.id, service.isActive)}
                            className="p-2 rounded hover:bg-gray-100"
                          >
                            {service.isActive ? "⏸️" : "▶️"}
                          </button>
                        )}
                        <Link
                          href={`/dashboard-pro/service/${service.id}`}
                          className="p-2 rounded hover:bg-gray-100"
                        >
                          👁️
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">📋</p>
                <h3 className="text-lg font-semibold mb-2">Aucun service publié</h3>
                <p className="text-[#475569] mb-6">
                  Commencez par publier votre premier service pour apparaître sur Domelia.
                </p>
                <button
                  onClick={() => setShowNewServiceModal(true)}
                  className="bg-[#10B981] text-white px-6 py-3 rounded-xl inline-block hover:bg-[#059669]"
                >
                  + Publier un service
                </button>
              </div>
            )}

            {/* Info tarification */}
            <div className="mt-8 p-6 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <h3 className="font-semibold text-[#1E293B] mb-3">💰 Tarification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-[#E2E8F0]">
                  <p className="font-medium text-[#1E293B]">À l'annonce</p>
                  <p className="text-2xl font-bold text-[#10B981]">5 €</p>
                  <p className="text-sm text-[#475569]">par service publié</p>
                </div>
                <div className="p-4 bg-white rounded-lg border-2 border-[#560591]">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#1E293B]">Abonnement mensuel</p>
                    <span className="text-xs bg-[#560591] text-white px-2 py-0.5 rounded-full">
                      Recommandé
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#560591]">15 €</p>
                  <p className="text-sm text-[#475569]">services illimités + badge partenaire</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demandes reçues */}
        {activeTab === "demandes" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-xl font-bold text-[#1E293B]">Demandes reçues</h2>
              <div className="flex gap-2">
                <select className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm">
                  <option value="all">Tous les statuts</option>
                  <option value="nouveau">Nouveaux</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminés</option>
                </select>
              </div>
            </div>

            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-xl border border-[#E2E8F0] bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#10B981] font-bold">
                          {request.requesterName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1E293B]">{request.requesterName}</p>
                          <p className="text-sm text-[#475569]">{request.requesterEmail}</p>
                          <p className="text-xs text-[#94A3B8] mt-1">
                            Service: {request.serviceName}
                          </p>
                          <p className="text-sm text-[#475569] mt-2 bg-[#F8FAFC] p-3 rounded-lg">
                            "{request.message}"
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            STATUS_LABELS[request.status]?.color ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {STATUS_LABELS[request.status]?.label || request.status}
                        </span>
                        <span className="text-xs text-[#94A3B8]">
                          {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {request.requesterPhone && (
                        <a
                          href={`tel:${request.requesterPhone}`}
                          className="px-3 py-1.5 bg-[#10B981] text-white text-sm rounded-lg hover:bg-[#059669]"
                        >
                          📞 Appeler
                        </a>
                      )}
                      <a
                        href={`mailto:${request.requesterEmail}`}
                        className="px-3 py-1.5 bg-[#560591] text-white text-sm rounded-lg hover:bg-[#3D0466]"
                      >
                        ✉️ Répondre
                      </a>
                      {request.status === "nouveau" && (
                        <button
                          onClick={() => updateRequestStatus(request.id, "en_cours")}
                          className="px-3 py-1.5 bg-[#F59E0B] text-white text-sm rounded-lg hover:bg-[#D97706]"
                        >
                          📌 Prendre en charge
                        </button>
                      )}
                      {request.status === "en_cours" && (
                        <button
                          onClick={() => updateRequestStatus(request.id, "termine")}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          ✓ Terminer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">📩</p>
                <h3 className="text-lg font-semibold mb-2">Aucune demande pour le moment</h3>
                <p className="text-[#475569]">
                  Les demandes de contact de vos clients apparaîtront ici.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Abonnement */}
        {activeTab === "abonnement" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1E293B]">Mon abonnement</h2>

            {/* Statut actuel */}
            <div className="p-6 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-[#475569]">Formule actuelle</p>
                  <p className="text-xl font-bold text-[#1E293B]">
                    {proData.subscriptionType === "monthly"
                      ? "Abonnement mensuel"
                      : proData.subscriptionType === "per_ad"
                      ? "À l'annonce"
                      : "Aucun abonnement"}
                  </p>
                  {proData.subscriptionEnd && (
                    <p className="text-sm text-[#475569] mt-1">
                      Valable jusqu'au{" "}
                      {new Date(proData.subscriptionEnd).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
                {proData.partnerBadge && (
                  <div className="bg-[#560591] text-white px-4 py-2 rounded-xl">
                    ⭐ Partenaire officiel
                  </div>
                )}
              </div>
            </div>

            {/* Choisir une offre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-[#E2E8F0] rounded-xl">
                <h3 className="font-semibold text-[#1E293B] mb-2">À l'annonce</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-[#10B981]">5 €</span>
                  <span className="text-[#475569]">/ service</span>
                </div>
                <ul className="space-y-2 text-sm text-[#475569] mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    1 service publié
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Visible 30 jours
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Demandes illimitées
                  </li>
                </ul>
                <button className="w-full py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-medium text-[#475569] hover:bg-[#F1F5F9] transition-colors">
                  Choisir
                </button>
              </div>

              <div className="p-6 border-2 border-[#560591] rounded-xl relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#560591] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Recommandé
                </div>
                <h3 className="font-semibold text-[#1E293B] mb-2">Abonnement mensuel</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-[#560591]">15 €</span>
                  <span className="text-[#475569]">/ mois</span>
                </div>
                <ul className="space-y-2 text-sm text-[#475569] mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Services illimités
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Badge "Partenaire officiel"
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mise en avant prioritaire
                  </li>
                </ul>
                <button className="w-full py-3 bg-[#560591] text-white rounded-xl font-medium hover:bg-[#3D0466] transition-colors">
                  S'abonner
                </button>
              </div>
            </div>

            {/* Historique des paiements */}
            {payments.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-[#1E293B] mb-4">Historique des paiements</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E2E8F0]">
                        <th className="text-left py-3 px-4 text-[#475569]">Date</th>
                        <th className="text-left py-3 px-4 text-[#475569]">Type</th>
                        <th className="text-left py-3 px-4 text-[#475569]">Montant</th>
                        <th className="text-left py-3 px-4 text-[#475569]">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-[#F1F5F9]">
                          <td className="py-3 px-4">
                            {new Date(payment.startDate).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="py-3 px-4">
                            {payment.type === "monthly"
                              ? "Abonnement mensuel"
                              : "Publication unique"}
                          </td>
                          <td className="py-3 px-4 font-medium">{payment.amount} €</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                payment.status === "succeeded"
                                  ? "bg-green-100 text-green-600"
                                  : payment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {payment.status === "succeeded"
                                ? "✓ Réussi"
                                : payment.status === "pending"
                                ? "⏳ En attente"
                                : "✕ Échoué"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal nouveau service */}
      {showNewServiceModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewServiceModal(false);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1E293B]">Publier un service</h2>
                <button
                  onClick={() => setShowNewServiceModal(false)}
                  className="text-[#94A3B8] hover:text-[#475569]"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[#475569] mb-4">
                Choisissez d'abord votre mode de publication :
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button className="p-4 border border-[#E2E8F0] rounded-xl hover:border-[#10B981] hover:bg-[#F0FDF4] transition-colors text-left">
                  <p className="font-semibold text-[#1E293B]">5 € / annonce</p>
                  <p className="text-sm text-[#475569]">1 service, 30 jours</p>
                </button>
                <button className="p-4 border border-[#560591] rounded-xl bg-[#FAF5FF] text-left">
                  <p className="font-semibold text-[#1E293B]">15 € / mois</p>
                  <p className="text-sm text-[#475569]">Services illimités</p>
                </button>
              </div>
              <Link
                href="/dashboard-pro/nouveau-service"
                className="block w-full py-3 bg-[#10B981] text-white rounded-xl font-medium text-center hover:bg-[#059669] transition-colors"
              >
                Continuer
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
