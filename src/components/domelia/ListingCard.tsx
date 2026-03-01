// Composant carte logement - Domelia.fr
"use client";

import Link from "next/link";

interface ListingCardProps {
  listing: {
    id: string;
    type: "logement" | "parking" | "colocation";
    title: string;
    location: string;
    city: string;
    price: number;
    surface?: number;
    rooms?: number;
    photos?: string | null;
    createdAt?: Date;
  };
  delay?: number;
}

export function ListingCard({ listing, delay = 0 }: ListingCardProps) {
  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      logement: { label: "Logement entier", color: "#560591" },
      parking: { label: "Parking", color: "#7C3AED" },
      colocation: { label: "Colocation", color: "#F59E0B" },
    };
    return badges[type] || badges.logement;
  };

  const badge = getTypeBadge(listing.type);
  
  // Image de fallback pour logement
  const fallbackImage = `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop`;
  const imageUrl = listing.photos ? JSON.parse(listing.photos)[0] : fallbackImage;

  return (
    <div
      className="group bg-white dark:bg-slate-800/50 rounded-2xl shadow-luxe dark:shadow-slate-900/50 hover-lift overflow-hidden opacity-0 animate-fade-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Badge type */}
        <div 
          className="absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: badge.color }}
        >
          {badge.label}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5">
        {/* Titre */}
        <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2 line-clamp-1">
          {listing.title}
        </h3>

        {/* Localisation */}
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 flex items-center gap-1">
          <svg className="w-4 h-4 text-[#560591] dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          📍 {listing.location || listing.city}
          {listing.surface && ` • ${listing.surface} m²`}
          {listing.rooms && ` • T${listing.rooms}`}
        </p>

        {/* Prix */}
        <div className="mb-4">
          <span className="text-[#560591] dark:text-violet-400 font-bold text-xl">{listing.price} €</span>
          <span className="text-slate-400 dark:text-slate-500 text-sm"> /mois</span>
        </div>

        {/* CTA */}
        <Link
          href={`/annonce/logement/${listing.id}`}
          className="block w-full text-center bg-[#560591] dark:bg-violet-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 hover:bg-[#3D0466] dark:hover:bg-violet-700 hover:shadow-lg btn-shimmer"
        >
          Voir l'annonce
        </Link>
      </div>
    </div>
  );
}
