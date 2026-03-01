// Composant filtres pour les services - Domelia.fr
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface ServiceFiltersProps {
  onFilterChange: (filters: ServiceFilters) => void;
  initialFilters?: ServiceFilters;
}

export interface ServiceFilters {
  category: string;
  zone: string;
  priceMin: number;
  priceMax: number;
}

const categories = [
  { id: "all", label: "Tous les services", icon: "📦" },
  { id: "demenagement", label: "Déménagement", icon: "🚚" },
  { id: "assurance", label: "Assurance", icon: "🛡️" },
  { id: "bricolage", label: "Bricolage", icon: "🔧" },
  { id: "menage", label: "Ménage", icon: "🧹" },
  { id: "stockage", label: "Stockage", icon: "📦" },
  { id: "autre", label: "Autre", icon: "📋" },
];

const zones = [
  "France entière",
  "Île-de-France",
  "Grandes villes",
  "Paris",
  "Lyon",
  "Marseille",
  "Bordeaux",
  "Toulouse",
  "Nice",
  "Nantes",
  "Strasbourg",
];

export function ServiceFilters({ onFilterChange, initialFilters }: ServiceFiltersProps) {
  const [filters, setFilters] = useState<ServiceFilters>(
    initialFilters || {
      category: "all",
      zone: "",
      priceMin: 0,
      priceMax: 1000,
    }
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCategoryChange = (category: string) => {
    const newFilters = { ...filters, category };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleZoneChange = (zone: string) => {
    const newFilters = { ...filters, zone: zone === "all" ? "" : zone };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (values: number[]) => {
    const newFilters = { ...filters, priceMin: values[0], priceMax: values[1] };
    setFilters(newFilters);
  };

  const handlePriceCommit = (values: number[]) => {
    const newFilters = { ...filters, priceMin: values[0], priceMax: values[1] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      category: "all",
      zone: "",
      priceMin: 0,
      priceMax: 1000,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-luxe p-6">
      {/* Filtres par catégorie */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#475569] mb-3">Catégorie</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.category === cat.id
                  ? "bg-[#10B981] text-white shadow-md"
                  : "bg-[#F8FAFC] text-[#475569] hover:bg-[#ECFDF5] hover:text-[#10B981]"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle filtres avancés */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-[#560591] font-medium hover:underline mb-4"
      >
        <svg
          className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        Filtres avancés
      </button>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="space-y-6 pt-4 border-t border-[#E2E8F0]">
          {/* Zone */}
          <div>
            <Label className="text-sm font-semibold text-[#475569] mb-2 block">
              Zone d&apos;intervention
            </Label>
            <Select value={filters.zone || "all"} onValueChange={handleZoneChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes les zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les zones</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prix */}
          <div>
            <Label className="text-sm font-semibold text-[#475569] mb-2 block">
              Budget ({filters.priceMin}€ - {filters.priceMax}€)
            </Label>
            <Slider
              min={0}
              max={1000}
              step={10}
              value={[filters.priceMin, filters.priceMax]}
              onValueChange={handlePriceChange}
              onValueCommit={handlePriceCommit}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[#94A3B8] mt-1">
              <span>0€</span>
              <span>1000€+</span>
            </div>
          </div>

          {/* Reset */}
          <Button
            variant="outline"
            onClick={resetFilters}
            className="w-full"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
