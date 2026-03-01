"use client";

import { useState } from "react";
import Link from "next/link";

interface Favorite {
  id: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  details: any;
}

interface FavoritesClientProps {
  favorites: Favorite[];
}

export default function FavoritesClient({ favorites: initialFavorites }: FavoritesClientProps) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [filter, setFilter] = useState("all");

  // Filtrer par type
  const filteredFavorites =
    filter === "all"
      ? favorites
      : favorites.filter((f) => f.targetType === filter);

  // Supprimer un favori
  const handleRemove = async (targetType: string, targetId: string) => {
    try {
      const res = await fetch(
        `/api/favorites?targetType=${targetType}&targetId=${targetId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setFavorites(favorites.filter(
          (f) => !(f.targetType === targetType && f.targetId === targetId)
        ));
      }
    } catch {
      console.error("Erreur suppression");
    }
  };

  // Obtenir le lien vers l'annonce
  const getLink = (fav: Favorite) => {
    switch (fav.targetType) {
      case "locataire":
        return `/annonce/locataire/${fav.targetId}`;
      case "logement":
        return `/annonce/logement/${fav.targetId}`;
      case "coloc":
        return `/annonce/coloc/${fav.targetId}`;
      case "service":
        return `/prestataire/${fav.targetId}`;
      default:
        return "#";
    }
  };

  // Obtenir le titre
  const getTitle = (fav: Favorite) => {
    const d = fav.details;
    switch (fav.targetType) {
      case "locataire":
        return `${d.firstName} - ${d.city}`;
      case "logement":
      case "coloc":
        return d.title || "Sans titre";
      case "service":
        return d.title || d.company || "Service";
      default:
        return "Sans titre";
    }
  };

  // Obtenir le prix
  const getPrice = (fav: Favorite) => {
    const d = fav.details;
    return d.price ? `${d.price} €/mois` : "Prix sur devis";
  };

  // Obtenir la localisation
  const getLocation = (fav: Favorite) => {
    const d = fav.details;
    return d.city || d.location || d.zone || "";
  };

  // Badge type
  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      locataire: { label: "👤 Locataire", color: "bg-pink-100 text-pink-600" },
      logement: { label: "🏠 Logement", color: "bg-blue-100 text-blue-600" },
      coloc: { label: "🛏️ Colocation", color: "bg-orange-100 text-orange-600" },
      service: { label: "🔧 Service", color: "bg-green-100 text-green-600" },
    };
    return badges[type] || { label: type, color: "bg-gray-100 text-gray-600" };
  };

  return (
    <>
      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "locataire", "logement", "coloc", "service"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === type
                ? "bg-[#560591] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {type === "all"
              ? "Tous"
              : type === "locataire"
              ? "👤 Locataires"
              : type === "logement"
              ? "🏠 Logements"
              : type === "coloc"
              ? "🛏️ Colocations"
              : "🔧 Services"}
          </button>
        ))}
      </div>

      {/* Grille */}
      {filteredFavorites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-luxe">
          <p className="text-5xl mb-4">💔</p>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Aucun favori
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === "all"
              ? "Vous n'avez pas encore sauvegardé d'éléments"
              : `Aucun favori dans cette catégorie`}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#560591] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#3D0466] transition-colors"
          >
            Découvrir les annonces
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((fav) => {
            const badge = getTypeBadge(fav.targetType);
            return (
              <div
                key={fav.id}
                className="bg-white rounded-2xl shadow-luxe overflow-hidden hover-lift group"
              >
                <div className="p-5">
                  {/* Badge type */}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}
                  >
                    {badge.label}
                  </span>

                  {/* Contenu */}
                  <h3 className="font-bold text-gray-800 mt-3 line-clamp-2">
                    {getTitle(fav)}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {getLocation(fav)}
                  </div>

                  <p className="text-[#560591] font-bold mt-3">
                    {getPrice(fav)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={getLink(fav)}
                      className="flex-1 text-center bg-[#560591] text-white py-2 rounded-xl font-medium hover:bg-[#3D0466] transition-colors"
                    >
                      Voir
                    </Link>
                    <button
                      onClick={() => handleRemove(fav.targetType, fav.targetId)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors"
                      title="Retirer des favoris"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
