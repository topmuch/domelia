// Liste des favoris
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Favorite {
  id: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  details: {
    id: string;
    title?: string;
    firstName?: string;
    price?: number;
    location?: string;
    city?: string;
    type?: string;
    category?: string;
    company?: string;
    photos?: string;
    photo?: string;
    budget?: number;
    jobStatus?: string;
  } | null;
}

export function FavoritesList() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement");
      }
      const data = await response.json();
      setFavorites(data.favorites);
    } catch {
      setError("Impossible de charger les favoris");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (targetType: string, targetId: string) => {
    try {
      const response = await fetch(
        `/api/favorites?targetType=${targetType}&targetId=${targetId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setFavorites((prev) =>
          prev.filter((f) => !(f.targetType === targetType && f.targetId === targetId))
        );
      }
    } catch (error) {
      console.error("Erreur suppression favori:", error);
    }
  };

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "locataire":
        return "Profil locataire";
      case "logement":
        return "Logement";
      case "coloc":
        return "Colocation";
      case "service":
        return "Service";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "locataire":
        return "bg-pink-100 text-pink-600";
      case "logement":
        return "bg-purple-100 text-purple-600";
      case "coloc":
        return "bg-orange-100 text-orange-600";
      case "service":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#560591]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchFavorites}
          className="mt-4 text-[#560591] hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun favori</h3>
        <p className="text-gray-500">
          Ajoutez des annonces à vos favoris pour les retrouver facilement
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {favorites.map((fav) => (
        <div
          key={fav.id}
          className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
        >
          <Link href={getLink(fav)} className="block p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                {fav.targetType === "service" ? (
                  <span className="text-2xl">
                    {fav.details?.category === "demenagement" ? "🚚" :
                     fav.details?.category === "assurance" ? "🛡️" :
                     fav.details?.category === "bricolage" ? "🔧" :
                     fav.details?.category === "menage" ? "🧹" :
                     fav.details?.category === "stockage" ? "📦" : "📋"}
                  </span>
                ) : (
                  <span className="text-2xl">
                    {fav.targetType === "locataire" ? "👤" :
                     fav.targetType === "logement" ? "🏠" : "👥"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${getTypeColor(fav.targetType)}`}>
                  {getTypeLabel(fav.targetType)}
                </span>
                <h3 className="font-medium text-gray-900 truncate">
                  {fav.details?.title || fav.details?.firstName || fav.details?.company || "Annonce"}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {fav.details?.location || fav.details?.city || ""}
                  {fav.details?.price && ` • ${fav.details.price}€`}
                  {fav.details?.budget && ` • ${fav.details.budget}€/mois`}
                </p>
              </div>
            </div>
          </Link>
          <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 flex justify-end">
            <button
              onClick={() => removeFavorite(fav.targetType, fav.targetId)}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Retirer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
