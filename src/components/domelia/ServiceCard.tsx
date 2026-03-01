// Composant carte service professionnel - Domelia.fr
"use client";

import Link from "next/link";

interface ServiceCardProps {
  service: {
    id: string;
    companyName: string;
    category: string;
    title: string;
    description?: string;
    price?: number;
    zone?: string;
    logo?: string;
    siretVerified?: boolean;
    rating?: number;
    available247?: boolean;
  };
  delay?: number;
}

// Logos par défaut par catégorie
const getCategoryDefaults = (category: string) => {
  const defaults: Record<string, { color: string; icon: string }> = {
    demenagement: { color: "#F59E0B", icon: "🚚" },
    assurance: { color: "#3B82F6", icon: "🛡️" },
    bricolage: { color: "#EF4444", icon: "🔧" },
    menage: { color: "#10B981", icon: "🧹" },
    stockage: { color: "#7C3AED", icon: "📦" },
    autre: { color: "#560591", icon: "⭐" },
  };
  return defaults[category] || defaults.autre;
};

export function ServiceCard({ service, delay = 0 }: ServiceCardProps) {
  const categoryDefaults = getCategoryDefaults(service.category);

  return (
    <div
      className="group bg-white dark:bg-slate-800/50 rounded-2xl shadow-luxe dark:shadow-slate-900/50 hover-lift overflow-hidden opacity-0 animate-fade-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Header avec logo */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: categoryDefaults.color + "20" }}
          >
            {service.logo ? (
              <img src={service.logo} alt={service.companyName} className="w-12 h-12 object-contain" />
            ) : (
              <span>{categoryDefaults.icon}</span>
            )}
          </div>
          
          {/* Infos */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1 line-clamp-1">
              {service.companyName}
            </h3>
            <p className="text-[#560591] dark:text-violet-400 text-sm font-medium">
              {service.title}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 pb-3">
        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
          {service.description || "Services professionnels de qualité pour faciliter votre installation."}
        </p>
      </div>

      {/* Badges */}
      <div className="px-5 pb-3 flex flex-wrap gap-2">
        {service.siretVerified && (
          <span className="inline-flex items-center gap-1 bg-[#ECFDF5] dark:bg-emerald-900/30 text-[#10B981] dark:text-emerald-400 text-xs font-medium px-2 py-1 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            SIRET vérifié
          </span>
        )}
        {service.available247 && (
          <span className="inline-flex items-center gap-1 bg-[#EDE9FE] dark:bg-violet-900/30 text-[#7C3AED] dark:text-violet-300 text-xs font-medium px-2 py-1 rounded-full">
            🕐 24/7
          </span>
        )}
        {service.rating && (
          <span className="inline-flex items-center gap-1 bg-[#FFF7ED] dark:bg-amber-900/30 text-[#F59E0B] dark:text-amber-400 text-xs font-medium px-2 py-1 rounded-full">
            ⭐ {service.rating.toFixed(1)}
          </span>
        )}
        {service.zone && (
          <span className="inline-flex items-center gap-1 bg-[#F8FAFC] dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs font-medium px-2 py-1 rounded-full">
            📍 {service.zone}
          </span>
        )}
      </div>

      {/* Prix et CTA */}
      <div className="px-5 pb-5 flex items-center justify-between gap-3">
        {service.price && (
          <div>
            <span className="text-[#560591] dark:text-violet-400 font-bold text-lg">À partir de {service.price} €</span>
          </div>
        )}
        <Link
          href={`/prestataire/${service.id}`}
          className="flex-1 text-center bg-[#560591] dark:bg-violet-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 hover:bg-[#3D0466] dark:hover:bg-violet-700 hover:shadow-lg btn-shimmer"
        >
          Contacter ce pro
        </Link>
      </div>
    </div>
  );
}
