// Composant carte détaillée service - Domelia.fr
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactButton } from "@/components/domelia/ContactButton";

interface ServiceDetailCardProps {
  service: {
    id: string;
    company?: string | null;
    siret?: string | null;
    category: string;
    title: string;
    description?: string | null;
    price?: number | null;
    zone?: string | null;
    photo?: string | null;
    isVerified: boolean;
    views: number;
    avgRating?: number | null;
    reviewCount: number;
    createdAt: Date | string;
    user?: {
      id: string;
      name?: string | null;
      email: string;
    } | null;
  };
}

// Infos par catégorie
const getCategoryInfo = (category: string) => {
  const info: Record<string, { label: string; color: string; icon: string }> = {
    demenagement: { label: "Déménagement", color: "#F59E0B", icon: "🚚" },
    assurance: { label: "Assurance", color: "#3B82F6", icon: "🛡️" },
    bricolage: { label: "Bricolage", color: "#EF4444", icon: "🔧" },
    menage: { label: "Ménage", color: "#10B981", icon: "🧹" },
    stockage: { label: "Stockage", color: "#7C3AED", icon: "📦" },
    autre: { label: "Autre", color: "#560591", icon: "📋" },
  };
  return info[category] || info.autre;
};

// Composant étoiles
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ServiceDetailCard({ service }: ServiceDetailCardProps) {
  const categoryInfo = getCategoryInfo(service.category);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-2xl shadow-luxe overflow-hidden">
        {/* Image de couverture si disponible */}
        {service.photo && (
          <div className="relative h-48 bg-gradient-to-r from-[#ECFDF5] to-[#D1FAE5]">
            <img
              src={service.photo}
              alt={service.company || "Service"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}
        
        <div className="p-6">
          {/* Logo et nom */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-md"
              style={{ backgroundColor: categoryInfo.color + "20" }}
            >
              {service.photo ? (
                <img
                  src={service.photo}
                  alt={service.company || "Service"}
                  className="w-16 h-16 object-contain rounded-xl"
                />
              ) : (
                <span>{categoryInfo.icon}</span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B]">
                  {service.company || "Professionnel"}
                </h1>
                {service.isVerified && (
                  <Badge className="bg-green-100 text-green-600 hover:bg-green-100">
                    <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Vérifié
                  </Badge>
                )}
              </div>

              <p className="text-[#10B981] text-lg font-medium mb-2">
                {service.title}
              </p>

              <Badge
                style={{ backgroundColor: categoryInfo.color }}
                className="text-white"
              >
                {categoryInfo.icon} {categoryInfo.label}
              </Badge>
            </div>
          </div>

          {/* Badges info */}
          <div className="flex flex-wrap gap-2 mb-4">
            {service.siret && (
              <Badge variant="outline" className="border-[#E2E8F0] text-[#475569]">
                📋 SIRET: {service.siret}
              </Badge>
            )}
            {service.zone && (
              <Badge variant="outline" className="border-[#E2E8F0] text-[#475569]">
                📍 {service.zone}
              </Badge>
            )}
            <Badge variant="outline" className="border-[#E2E8F0] text-[#475569]">
                👁️ {service.views} vues
            </Badge>
          </div>

          {/* Note */}
          {service.avgRating !== null && service.avgRating !== undefined && (
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={Math.round(service.avgRating)} />
              <span className="text-sm text-[#475569]">
                {service.avgRating.toFixed(1)}/5 ({service.reviewCount} avis)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl shadow-luxe p-6">
        <h2 className="text-xl font-bold text-[#1E293B] mb-4">À propos</h2>
        <p className="text-[#475569] leading-relaxed whitespace-pre-line">
          {service.description || "Aucune description fournie."}
        </p>
      </div>

      {/* Zone d'intervention */}
      {service.zone && (
        <div className="bg-white rounded-2xl shadow-luxe p-6">
          <h2 className="text-xl font-bold text-[#1E293B] mb-4">Zone d&apos;intervention</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#ECFDF5] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#1E293B]">{service.zone}</p>
              <p className="text-sm text-[#94A3B8]">Couverture géographique</p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Contact */}
      <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl p-6 text-white sticky top-24">
        <h3 className="text-xl font-bold mb-2">Besoin de ce service ?</h3>
        <p className="text-white/80 text-sm mb-4">
          Contactez ce professionnel pour obtenir un devis gratuit.
        </p>

        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <p className="text-white/60 text-sm mb-1">À partir de</p>
          {service.price ? (
            <p className="text-white font-bold text-2xl">{service.price} €</p>
          ) : (
            <p className="text-white font-bold text-2xl">Sur devis</p>
          )}
        </div>

        <div className="space-y-3">
          <ContactButton
            targetName={service.company || "Professionnel"}
            targetType="pro"
            targetId={service.id}
          />
          
          <Button
            variant="outline"
            className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            Demander un devis
          </Button>
        </div>

        <p className="text-white/60 text-xs mt-3 text-center">
          Réponse sous 24h garantie
        </p>
      </div>

      {/* Info inscription */}
      <div className="bg-[#F8FAFC] rounded-2xl p-4 text-sm text-[#94A3B8]">
        <p>
          Inscrit depuis le {new Date(service.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
