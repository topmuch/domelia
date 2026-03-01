// Composant carte colocation - Domelia.fr
"use client";

import Link from "next/link";

interface ColocationCardProps {
  listing: {
    id: string;
    type: "chambre" | "recherche_coloc";
    title: string;
    city: string;
    budget: number;
    surface?: number;
    description?: string;
    photos?: string | null;
    firstName?: string;
    createdAt?: Date;
    latitude?: number;
    longitude?: number;
  };
  delay?: number;
}

// Fallbacks uniques par type d'annonce
const getFallbackImage = (type: string, id: string) => {
  const fallbacks: Record<string, string[]> = {
    chambre: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop", // chambre lumineuse
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop", // chambre moderne
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop", // chambre cosy
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop", // chambre design
    ],
    recherche_coloc: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop", // salon coloc
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&h=300&fit=crop", // appartement partagé
    ],
  };
  
  const images = fallbacks[type] || fallbacks.chambre;
  // Utiliser l'ID pour sélectionner une image unique de manière déterministe
  const index = Math.abs(hashCode(id)) % images.length;
  return images[index];
};

// Hash simple pour obtenir un index déterministe depuis l'ID
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

export function ColocationCard({ listing, delay = 0 }: ColocationCardProps) {
  const isChambre = listing.type === "chambre";
  
  // Image unique pour cette annonce
  const imageUrl = listing.photos 
    ? (typeof listing.photos === 'string' ? JSON.parse(listing.photos)[0] : listing.photos)
    : getFallbackImage(listing.type, listing.id);

  // Badge style selon le type
  const getBadgeStyle = () => {
    if (isChambre) {
      return { bg: "#F59E0B", label: "🛏️ Chambre" };
    }
    return { bg: "#10B981", label: "🔍 Recherche coloc" };
  };
  const badge = getBadgeStyle();

  // Lien vers la page détail - tous les types de coloc vont vers /annonce/coloc/:id
  const detailUrl = `/annonce/coloc/${listing.id}`;

  return (
    <div
      className="group bg-white dark:bg-slate-800/50 rounded-2xl shadow-luxe dark:shadow-slate-900/50 hover-lift overflow-hidden opacity-0 animate-fade-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Image ou Avatar */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#FAF5FF] to-[#EDE9FE] dark:from-slate-700 dark:to-slate-600">
        {isChambre ? (
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#560591] dark:bg-violet-600 flex items-center justify-center text-white text-3xl font-bold">
              {listing.firstName?.charAt(0) || "?"}
            </div>
          </div>
        )}
        {/* Badge */}
        <div 
          className="absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: badge.bg }}
        >
          {badge.label}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5">
        {/* Titre */}
        <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2 line-clamp-1">
          {isChambre ? listing.title : `${listing.firstName || "Quelqu'un"} cherche un colocataire`}
        </h3>

        {/* Localisation */}
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 flex items-center gap-1">
          <svg className="w-4 h-4 text-[#560591] dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {listing.city}
          {listing.surface && ` • ${listing.surface} m²`}
        </p>

        {/* Budget */}
        <div className="mb-4">
          <span className="text-[#560591] dark:text-violet-400 font-bold text-xl">{listing.budget} €</span>
          <span className="text-slate-400 dark:text-slate-500 text-sm"> /mois</span>
        </div>

        {/* CTA - CORRECTION: bon lien */}
        <Link
          href={detailUrl}
          className="block w-full text-center bg-[#560591] dark:bg-violet-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 hover:bg-[#3D0466] dark:hover:bg-violet-700 hover:shadow-lg btn-shimmer"
        >
          {isChambre ? "Voir l'annonce" : "Voir le profil"}
        </Link>
      </div>
    </div>
  );
}
