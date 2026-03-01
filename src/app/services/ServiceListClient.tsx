// Composant client pour la liste des services - Domelia.fr (Design épuré)
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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
    category: "garde_meubles",
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
    category: "travaux",
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
    category: "nettoyage",
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

const CATEGORY_FILTERS = [
  { key: "all", label: "Tous", icon: "📋" },
  { key: "demenagement", label: "Déménagement", icon: "🚚" },
  { key: "garde_meubles", label: "Garde-meubles", icon: "📦" },
  { key: "assurance", label: "Assurance", icon: "🛡️" },
  { key: "nettoyage", label: "Nettoyage", icon: "🧹" },
  { key: "travaux", label: "Bricolage", icon: "🔧" },
];

const CATEGORY_LABELS: Record<string, string> = {
  demenagement: "Déménagement professionnel",
  garde_meubles: "Garde-meubles sécurisé",
  assurance: "Assurance habitation",
  nettoyage: "Nettoyage professionnel",
  travaux: "Petits travaux & Bricolage",
  autre: "Autre service",
};

const CATEGORY_ICONS: Record<string, string> = {
  demenagement: "🚚",
  garde_meubles: "📦",
  assurance: "🛡️",
  nettoyage: "🧹",
  travaux: "🔧",
  autre: "📋",
};

export function ServiceListClient() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showContactModal, setShowContactModal] = useState<Service | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== "all") params.append("category", activeFilter);
      params.append("limit", "12");

      const response = await fetch(`/api/services?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        const allServices = [...data.services];
        
        // Ajouter les services de démo
        const dbIds = new Set(data.services.map((s: Service) => s.id));
        for (const demo of demoServices) {
          if (!dbIds.has(demo.id)) {
            if (activeFilter !== "all" && demo.category !== activeFilter) continue;
            allServices.push(demo);
          }
        }
        
        setServices(allServices);
      } else {
        // Filtrer les données de démo
        const filtered = activeFilter === "all" 
          ? demoServices 
          : demoServices.filter(s => s.category === activeFilter);
        setServices(filtered);
      }
    } catch (error) {
      console.error("Erreur chargement services:", error);
      const filtered = activeFilter === "all" 
        ? demoServices 
        : demoServices.filter(s => s.category === activeFilter);
      setServices(filtered);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <>
      <div className="container-domelia py-8">
        {/* Filtres */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter.key
                  ? "bg-[#560591] text-white"
                  : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#560591] hover:text-[#560591]"
              }`}
            >
              {filter.icon} {filter.label}
            </button>
          ))}
        </div>

        {/* Grille des services */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="w-16 h-16 bg-[#E2E8F0] rounded-xl mx-auto mb-4" />
                <div className="h-5 bg-[#E2E8F0] rounded w-3/4 mx-auto mb-2" />
                <div className="h-4 bg-[#E2E8F0] rounded w-1/2 mx-auto mb-4" />
                <div className="h-4 bg-[#E2E8F0] rounded mb-2" />
                <div className="h-4 bg-[#E2E8F0] rounded w-2/3 mb-4" />
                <div className="flex gap-2 justify-center mb-4">
                  <div className="h-6 bg-[#E2E8F0] rounded-full w-20" />
                  <div className="h-6 bg-[#E2E8F0] rounded-full w-16" />
                </div>
                <div className="h-10 bg-[#E2E8F0] rounded-lg" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
              Aucun service trouvé
            </h3>
            <p className="text-[#64748B]">
              Essayez de modifier vos filtres pour voir plus de résultats.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Header avec logo */}
                <div className="p-6 text-center border-b border-[#F1F5F9]">
                  <div className="w-16 h-16 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-[#560591]">
                    {CATEGORY_ICONS[service.category] || "📋"}
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E293B] mb-1">
                    {service.company || "Professionnel"}
                  </h3>
                  <span className="inline-block bg-[#f5f0fc] text-[#560591] text-xs font-semibold px-3 py-1 rounded-full">
                    {CATEGORY_LABELS[service.category] || service.title}
                  </span>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <p className="text-[#64748B] text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.isVerified && (
                      <span className="inline-flex items-center gap-1 bg-[#ECFDF5] text-[#10B981] text-xs px-2 py-1 rounded">
                        ✅ SIRET vérifié
                      </span>
                    )}
                    {service.avgRating && (
                      <span className="inline-flex items-center gap-1 bg-[#f5f0fc] text-[#560591] text-xs px-2 py-1 rounded">
                        ⭐ {service.avgRating.toFixed(1)}
                      </span>
                    )}
                    {service.zone && (
                      <span className="inline-flex items-center gap-1 bg-[#f5f0fc] text-[#560591] text-xs px-2 py-1 rounded">
                        📍 {service.zone}
                      </span>
                    )}
                  </div>

                  {/* Prix */}
                  <div className="text-xl font-bold text-[#560591] mb-4">
                    À partir de {service.price} €
                  </div>

                  {/* Bouton contact */}
                  <button
                    onClick={() => setShowContactModal(service)}
                    className="w-full py-3 bg-[#560591] text-white font-semibold rounded-lg hover:bg-[#430477] transition-colors"
                  >
                    Contacter ce pro
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de contact */}
      {showContactModal && (
        <ContactModal
          service={showContactModal}
          onClose={() => setShowContactModal(null)}
        />
      )}
    </>
  );
}

// Modal de contact simplifiée
function ContactModal({ service, onClose }: { service: Service; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/professional/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          ...formData,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        alert("Erreur lors de l'envoi du message");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-xl font-bold text-[#1E293B] mb-2">Message envoyé !</h3>
          <p className="text-[#64748B] mb-6">
            Le professionnel vous répondra dans les plus brefs délais.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#560591] text-white font-semibold rounded-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[#1E293B]">
            Contacter {service.company}
          </h3>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#1E293B]">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1">Votre nom *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#560591]"
              placeholder="Jean Dupont"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#560591]"
              placeholder="jean@exemple.fr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1">Téléphone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#560591]"
              placeholder="06 12 34 56 78"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1">Message *</label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#560591] resize-none"
              placeholder="Décrivez votre besoin..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#560591] text-white font-semibold rounded-lg hover:bg-[#430477] transition-colors disabled:opacity-50"
          >
            {loading ? "Envoi en cours..." : "Envoyer le message"}
          </button>
        </form>
      </div>
    </div>
  );
}
