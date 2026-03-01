// Composant filtres colocation - Domelia.fr
"use client";

import { useState } from "react";

interface Filters {
  city: string;
  maxPrice: string;
  type: string;
}

interface ColocFiltersProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Filters;
}

export function ColocFilters({ onFilterChange, initialFilters }: ColocFiltersProps) {
  const [filters, setFilters] = useState<Filters>(
    initialFilters || { city: "", maxPrice: "", type: "" }
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { city: "", maxPrice: "", type: "" };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = filters.city || filters.maxPrice || filters.type;

  return (
    <div className="bg-white rounded-2xl shadow-luxe p-4 md:p-6 mb-6">
      {/* Filtres principaux */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Type de filtre */}
        <div className="flex gap-2">
          <button
            onClick={() => handleChange("type", "")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filters.type === ""
                ? "bg-[#560591] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#FAF5FF]"
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => handleChange("type", "chambre")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filters.type === "chambre"
                ? "bg-orange-500 text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-orange-50"
            }`}
          >
            🛏️ Chambres
          </button>
          <button
            onClick={() => handleChange("type", "recherche_coloc")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filters.type === "recherche_coloc"
                ? "bg-blue-500 text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-blue-50"
            }`}
          >
            🔍 Cherchent coloc
          </button>
        </div>

        {/* Bouton filtres avancés */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="ml-auto px-4 py-2 rounded-xl border border-[#F1F5F9] text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filtres
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[#560591]" />
          )}
        </button>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-[#F1F5F9] grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ville */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">
              Ville
            </label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Paris, Lyon..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591] text-sm"
            />
          </div>

          {/* Budget max */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">
              Budget max
            </label>
            <div className="relative">
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
                placeholder="600"
                className="w-full px-4 py-2.5 pr-8 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591] text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">€</span>
            </div>
          </div>

          {/* Clear */}
          <div className="flex items-end">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-all"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
