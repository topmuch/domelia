// Carte de service professionnel pour la landing page - Domelia.fr
"use client";

import { useState } from "react";
import { ProContactModal } from "./ProContactModal";

interface ProServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    priceType: string;
    photos: string[];
    zone: string | null;
    category: string;
    views: number;
    pro: {
      id: string;
      companyName: string;
      logo: string | null;
      zone: string;
      isVerified: boolean;
      partnerBadge: boolean;
      avgRating?: number;
      totalReviews?: number;
    };
  };
}

const CATEGORY_ICONS: Record<string, string> = {
  demenagement: "🚚",
  garde_meubles: "📦",
  assurance: "🛡️",
  nettoyage: "🧹",
  travaux: "🔧",
  autre: "📋",
};

const CATEGORY_LABELS: Record<string, string> = {
  demenagement: "Déménagement",
  garde_meubles: "Garde-meubles",
  assurance: "Assurance",
  nettoyage: "Nettoyage",
  travaux: "Travaux",
  autre: "Autre",
};

export function ProServiceCard({ service }: ProServiceCardProps) {
  const [showContactModal, setShowContactModal] = useState(false);
  const pro = service.pro;

  const formatPrice = () => {
    if (!service.price) return "Sur devis";
    if (service.priceType === "from") return `À partir de ${service.price} €`;
    if (service.priceType === "on_quote") return "Sur devis";
    return `${service.price} €`;
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow group">
        {/* Image ou logo */}
        <div className="relative h-40 bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5]">
          {service.photos && service.photos.length > 0 ? (
            <img
              src={service.photos[0]}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : pro.logo ? (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={pro.logo}
                alt={pro.companyName}
                className="w-20 h-20 rounded-xl object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">{CATEGORY_ICONS[service.category] || "📋"}</span>
            </div>
          )}
          
          {/* Badge catégorie */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#475569]">
            {CATEGORY_ICONS[service.category]} {CATEGORY_LABELS[service.category]}
          </div>

          {/* Badge partenaire */}
          {pro.partnerBadge && (
            <div className="absolute top-3 right-3 bg-[#560591] text-white px-2 py-1 rounded-full text-xs font-medium">
              ⭐ Partenaire
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4">
          {/* Nom entreprise */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-[#1E293B] truncate">{pro.companyName}</h3>
            {pro.isVerified && (
              <svg className="w-4 h-4 text-[#10B981] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Titre du service */}
          <p className="text-sm text-[#475569] mb-3 line-clamp-2">{service.title}</p>

          {/* Zone et note */}
          <div className="flex items-center gap-3 text-xs text-[#94A3B8] mb-3">
            <span>📍 {service.zone || pro.zone}</span>
            {pro.avgRating !== undefined && (
              <span className="flex items-center gap-1">
                ⭐ {pro.avgRating.toFixed(1)} ({pro.totalReviews || 0})
              </span>
            )}
          </div>

          {/* Prix */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-[#10B981]">{formatPrice()}</span>
            </div>
            <button
              onClick={() => setShowContactModal(true)}
              className="px-4 py-2 bg-[#10B981] text-white text-sm font-medium rounded-lg hover:bg-[#059669] transition-colors"
            >
              Contacter
            </button>
          </div>
        </div>
      </div>

      {/* Modal de contact */}
      {showContactModal && (
        <ProContactModal
          service={{
            id: service.id,
            title: service.title,
            proId: pro.id,
            companyName: pro.companyName,
          }}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </>
  );
}
