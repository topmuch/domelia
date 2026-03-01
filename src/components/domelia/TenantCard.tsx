// Composant carte locataire - Design Wahoo Luxe
"use client";

import Link from "next/link";

interface TenantCardProps {
  profile: {
    id: string;
    firstName: string;
    lastName?: string | null;
    city: string;
    budget: number;
    housingType?: string | null;
    jobStatus: string;
    hasGuarantor: boolean;
    urgency: string;
    description?: string | null;
  };
  delay?: number;
}

export function TenantCard({ profile, delay = 0 }: TenantCardProps) {
  // CORRECTION #4: Utiliser l'initiale du prénom pour l'avatar
  const initials = profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "?";
  
  const getUrgencyLabel = (urgency: string) => {
    const labels: Record<string, string> = {
      immediate: "Immédiate",
      "1_mois": "1 mois",
      "2_mois": "2 mois",
      flexible: "Flexible",
    };
    return labels[urgency] || urgency;
  };

  const getJobStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      cdi: "CDI",
      cdd: "CDD",
      etudiant: "Étudiant",
      independant: "Indépendant",
      retraite: "Retraité",
      sans_emploi: "En recherche",
    };
    return labels[status] || status;
  };

  const getHousingTypeLabel = (type?: string | null) => {
    if (!type) return null;
    const labels: Record<string, string> = {
      studio: "Studio",
      t1: "T1",
      t2: "T2",
      t3: "T3",
      appartement: "Appartement",
      maison: "Maison",
    };
    return labels[type] || type;
  };

  return (
    <div
      className="group bg-white dark:bg-slate-800/50 rounded-2xl border-l-4 border-l-[#560591] dark:border-l-violet-500 shadow-luxe dark:shadow-slate-900/50 hover-lift overflow-hidden opacity-0 animate-fade-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Image placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-[#FAF5FF] to-[#EDE9FE] dark:from-slate-700 dark:to-slate-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-[#560591] dark:bg-violet-600 opacity-10" />
        </div>
        {/* Badge urgence */}
        {profile.urgency === "immediate" && (
          <div className="absolute top-3 right-3 bg-[#F59E0B] text-white text-xs font-semibold px-3 py-1 rounded-full animate-pulse-glow">
            🔥 {getUrgencyLabel(profile.urgency)}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5">
        {/* En-tête avec avatar - CORRECTION #4 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#560591] dark:bg-violet-600 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-md">
            <span className="text-white font-bold text-lg">{initials}</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">
              {profile.firstName} {profile.lastName?.charAt(0)}.
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
              <svg className="w-4 h-4 text-[#560591] dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.city}
            </p>
          </div>
        </div>

        {/* Budget */}
        <div className="mb-3">
          <span className="text-[#560591] dark:text-violet-400 font-bold text-xl">💰 {profile.budget} €</span>
          <span className="text-slate-400 dark:text-slate-500 text-sm"> /mois</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {getHousingTypeLabel(profile.housingType) && (
            <span className="bg-[#EDE9FE] dark:bg-violet-900/30 text-[#560591] dark:text-violet-300 text-xs font-medium px-2.5 py-1 rounded-full">
              {getHousingTypeLabel(profile.housingType)}
            </span>
          )}
          <span className="bg-[#ECFDF5] dark:bg-emerald-900/30 text-[#10B981] dark:text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            💼 {getJobStatusLabel(profile.jobStatus)}
          </span>
          {profile.hasGuarantor && (
            <span className="bg-[#ECFDF5] dark:bg-emerald-900/30 text-[#10B981] dark:text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              ✅ Garant
            </span>
          )}
        </div>

        {/* CTA - CORRECTION #1: Couleur principale #560591 */}
        <Link
          href={`/annonce/locataire/${profile.id}`}
          className="block w-full text-center bg-[#560591] dark:bg-violet-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 hover:bg-[#3D0466] dark:hover:bg-violet-700 hover:shadow-lg hover:scale-[1.02] btn-shimmer"
        >
          Voir le profil
        </Link>
      </div>
    </div>
  );
}
