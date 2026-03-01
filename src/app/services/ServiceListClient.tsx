// Composant client pour la liste des services - Domelia.fr
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ServiceCard } from "@/components/domelia/ServiceCard";
import { ServiceFilters } from "@/components/domelia/ServiceFilters";
import { Button } from "@/components/ui/button";

interface Service {
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
  isActive: boolean;
  views: number;
  avgRating?: number | null;
  reviewCount: number;
  createdAt: string;
  user?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
}

interface ServicesResponse {
  services: Service[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Données de démo
const demoServices: Service[] = [
  {
    id: "service-1",
    company: "Déménagement Express",
    category: "demenagement",
    title: "Déménagement professionnel",
    description: "Déménagement complet partout en France. Service clé en main avec emballage inclus.",
    price: 350,
    zone: "France entière",
    isVerified: true,
    isActive: true,
    views: 1234,
    avgRating: 4.8,
    reviewCount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: "service-2",
    company: "StockPro",
    category: "stockage",
    title: "Garde-meubles sécurisé",
    description: "Stockage de meubles et affaires personnelles en box sécurisé 24/7.",
    price: 49,
    zone: "Grandes villes",
    isVerified: true,
    isActive: true,
    views: 856,
    avgRating: 4.9,
    reviewCount: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: "service-3",
    company: "AssurHabitat",
    category: "assurance",
    title: "Assurance habitation",
    description: "Assurance locataire adaptée à vos besoins. Couverture complète à prix compétitif.",
    price: 12,
    zone: "France",
    isVerified: true,
    isActive: true,
    views: 2341,
    avgRating: 4.7,
    reviewCount: 23,
    createdAt: new Date().toISOString(),
  },
  {
    id: "service-4",
    company: "HandyServices",
    category: "bricolage",
    title: "Petits travaux & Bricolage",
    description: "Installation, montage de meubles, petites réparations. Intervention rapide.",
    price: 35,
    zone: "Île-de-France",
    isVerified: true,
    isActive: true,
    views: 567,
    avgRating: 4.6,
    reviewCount: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "service-5",
    company: "HomeClean Pro",
    category: "menage",
    title: "Nettoyage professionnel",
    description: "Ménage régulier ou ponctuel. État des lieux de sortie inclus.",
    price: 25,
    zone: "Grandes villes",
    isVerified: true,
    isActive: true,
    views: 1892,
    avgRating: 4.8,
    reviewCount: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: "service-6",
    company: "Mobeel",
    category: "demenagement",
    title: "Location utilitaire",
    description: "Location de camions et utilitaires pour déménagement auto.",
    price: 59,
    zone: "France",
    isVerified: true,
    isActive: true,
    views: 723,
    avgRating: 4.5,
    reviewCount: 7,
    createdAt: new Date().toISOString(),
  },
];

export function ServiceListClient() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: "all",
    zone: "",
    priceMin: 0,
    priceMax: 1000,
  });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category !== "all") params.append("category", filters.category);
      if (filters.zone) params.append("zone", filters.zone);
      if (filters.priceMin > 0) params.append("priceMin", filters.priceMin.toString());
      if (filters.priceMax < 1000) params.append("priceMax", filters.priceMax.toString());
      params.append("page", page.toString());
      params.append("limit", "12");

      const response = await fetch(`/api/services?${params.toString()}`);
      const data: ServicesResponse = await response.json();

      if (response.ok) {
        // Combiner les données de la BDD avec les données de démo
        const allServices = [...data.services];
        
        // Ajouter les services de démo qui ne sont pas dans la BDD
        const dbIds = new Set(data.services.map(s => s.id));
        for (const demo of demoServices) {
          if (!dbIds.has(demo.id)) {
            // Filtrer selon les filtres actuels
            if (filters.category !== "all" && demo.category !== filters.category) continue;
            if (filters.zone && !demo.zone?.toLowerCase().includes(filters.zone.toLowerCase())) continue;
            if (filters.priceMin > 0 && (demo.price || 0) < filters.priceMin) continue;
            if (filters.priceMax < 1000 && (demo.price || 0) > filters.priceMax) continue;
            allServices.push(demo);
          }
        }
        
        setServices(allServices);
        setTotalPages(Math.max(data.pagination.totalPages, 1));
      } else {
        // En cas d'erreur, utiliser les données de démo
        setServices(demoServices);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Erreur chargement services:", error);
      // En cas d'erreur, utiliser les données de démo
      setServices(demoServices);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // Reset à la page 1
  };

  const handleLoadMore = () => {
    setPage((p) => Math.min(p + 1, totalPages));
  };

  // Adapter les données pour ServiceCard
  const adaptedServices = services.map((service) => ({
    id: service.id,
    companyName: service.company || "Professionnel",
    category: service.category,
    title: service.title,
    description: service.description,
    price: service.price,
    zone: service.zone,
    siretVerified: service.isVerified && !!service.siret,
    rating: service.avgRating || undefined,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar filtres */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <ServiceFilters onFilterChange={handleFilterChange} initialFilters={filters} />
          
          <Link
            href="/deposer-service"
            className="block mt-6 bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-semibold p-4 rounded-xl text-center hover:shadow-lg transition-shadow"
          >
            <span className="text-xl mr-2">+</span>
            Déposer un service
          </Link>
        </div>
      </div>

      {/* Liste des services */}
      <div className="lg:col-span-3">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-luxe p-5 animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-[#E2E8F0] rounded-xl" />
                  <div className="flex-1">
                    <div className="h-5 bg-[#E2E8F0] rounded w-3/4 mb-2" />
                    <div className="h-4 bg-[#E2E8F0] rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-[#E2E8F0] rounded mb-2" />
                <div className="h-4 bg-[#E2E8F0] rounded w-2/3 mb-4" />
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-[#E2E8F0] rounded-full w-20" />
                  <div className="h-6 bg-[#E2E8F0] rounded-full w-16" />
                </div>
                <div className="h-10 bg-[#E2E8F0] rounded-xl" />
              </div>
            ))}
          </div>
        ) : adaptedServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
              Aucun service trouvé
            </h3>
            <p className="text-[#475569]">
              Essayez de modifier vos filtres pour voir plus de résultats.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {adaptedServices.map((service, index) => (
                <ServiceCard key={service.id} service={service} delay={index * 50} />
              ))}
            </div>

            {page < totalPages && (
              <div className="mt-8 text-center">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  className="px-8"
                >
                  Voir plus de services
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
