// Composant client pour la liste des colocations - Domelia.fr
"use client";

import { useState, useEffect, useCallback } from "react";
import { ColocationCard } from "@/components/domelia/ColocationCard";
import { ColocFilters } from "@/components/domelia/ColocFilters";

interface Colocation {
  id: string;
  type: "chambre" | "recherche_coloc";
  title: string;
  location: string;
  price: number;
  surface?: number | null;
  photos?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  user?: {
    name?: string | null;
    initials?: string;
  };
  createdAt?: Date;
}

interface Filters {
  city: string;
  maxPrice: string;
  type: string;
}

interface ColocationListClientProps {
  demoColocations: Colocation[];
}

export function ColocationListClient({ demoColocations }: ColocationListClientProps) {
  const [listings, setListings] = useState<Colocation[]>(demoColocations);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({ city: "", maxPrice: "", type: "" });
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 12;

  // Fonction pour charger les colocations
  const fetchColocations = useCallback(async (resetOffset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      if (resetOffset) {
        setOffset(0);
        params.set("offset", "0");
      } else {
        params.set("offset", offset.toString());
      }
      if (filters.city) params.set("city", filters.city);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.type) params.set("type", filters.type);

      const res = await fetch(`/api/colocations?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.listings.length > 0) {
        // Transformer les données pour le composant
        const transformed = data.listings.map((listing: Record<string, unknown>) => ({
          id: listing.id as string,
          type: listing.type as "chambre" | "recherche_coloc",
          title: listing.title as string,
          location: listing.location as string,
          price: listing.price as number,
          surface: listing.surface as number | null | undefined,
          photos: listing.photos as string | null | undefined,
          latitude: listing.latitude as number | null | undefined,
          longitude: listing.longitude as number | null | undefined,
          user: listing.user as { name?: string | null; initials?: string },
          createdAt: listing.createdAt as Date,
        }));

        if (resetOffset) {
          setListings(transformed);
        } else {
          setListings((prev) => [...prev, ...transformed]);
        }
        setHasMore(data.hasMore);
      } else {
        // Utiliser les données de démo si l'API ne renvoie rien
        if (resetOffset) {
          setListings(applyFilters(demoColocations, filters));
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      // Utiliser les données de démo en cas d'erreur
      setListings(applyFilters(demoColocations, filters));
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [filters, offset, demoColocations]);

  // Appliquer les filtres localement sur les données de démo
  const applyFilters = (data: Colocation[], currentFilters: Filters): Colocation[] => {
    let filtered = [...data];

    if (currentFilters.type) {
      filtered = filtered.filter((item) => item.type === currentFilters.type);
    }

    if (currentFilters.city) {
      const cityLower = currentFilters.city.toLowerCase();
      filtered = filtered.filter((item) =>
        item.location.toLowerCase().includes(cityLower)
      );
    }

    if (currentFilters.maxPrice) {
      const maxPriceNum = parseInt(currentFilters.maxPrice);
      filtered = filtered.filter((item) => item.price <= maxPriceNum);
    }

    return filtered;
  };

  // Charger les données au montage
  useEffect(() => {
    fetchColocations(true);
  }, []);

  // Recharger quand les filtres changent
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setOffset(0);
  };

  // Charger plus
  const loadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
  };

  return (
    <>
      {/* Filtres */}
      <ColocFilters onFilterChange={handleFilterChange} initialFilters={filters} />

      {/* État de chargement */}
      {loading && listings.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-[#560591] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Grille de cartes */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, index) => (
            <ColocationCard key={listing.id} listing={listing} delay={index * 50} />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-[#1E293B] mb-2">
              Aucune colocation trouvée
            </h3>
            <p className="text-[#475569]">
              Essayez de modifier vos filtres pour voir plus de résultats
            </p>
          </div>
        )
      )}

      {/* Bouton charger plus */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 rounded-xl border-2 border-[#560591] text-[#560591] font-semibold hover:bg-[#FAF5FF] transition-all disabled:opacity-50"
          >
            {loading ? "Chargement..." : "Voir plus d'annonces"}
          </button>
        </div>
      )}
    </>
  );
}
