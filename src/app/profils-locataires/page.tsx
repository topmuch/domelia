// Page Tous les locataires - Domelia.fr (avec pagination et filtres)
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";

// Données de démo étendues
const allDemoProfiles = [
  {
    id: "demo-1",
    firstName: "Marie",
    lastName: "L.",
    city: "Bordeaux",
    budget: 850,
    housingType: "t2",
    jobStatus: "cdi",
    hasGuarantor: true,
    urgency: "immediate",
    description: "Je suis une professionnelle travaillant dans le marketing digital.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
  },
  {
    id: "demo-2",
    firstName: "Thomas",
    lastName: "D.",
    city: "Lyon",
    budget: 1200,
    housingType: "t3",
    jobStatus: "cdi",
    hasGuarantor: true,
    urgency: "1_mois",
    description: "Développeur dans une entreprise tech lyonnaise.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
  },
  {
    id: "demo-3",
    firstName: "Sophie",
    lastName: "M.",
    city: "Paris",
    budget: 1500,
    housingType: "studio",
    jobStatus: "etudiant",
    hasGuarantor: true,
    urgency: "flexible",
    description: "Étudiante en médecine.",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12h ago
  },
  {
    id: "demo-4",
    firstName: "Lucas",
    lastName: "P.",
    city: "Nantes",
    budget: 700,
    housingType: "t2",
    jobStatus: "cdi",
    hasGuarantor: true,
    urgency: "2_mois",
    description: "Je travaille dans la finance.",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48h ago
  },
  {
    id: "demo-5",
    firstName: "Emma",
    lastName: "R.",
    city: "Toulouse",
    budget: 900,
    housingType: "appartement",
    jobStatus: "independant",
    hasGuarantor: false,
    urgency: "flexible",
    description: "Graphiste freelance.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: "demo-6",
    firstName: "Hugo",
    lastName: "M.",
    city: "Marseille",
    budget: 650,
    housingType: "studio",
    jobStatus: "etudiant",
    hasGuarantor: true,
    urgency: "immediate",
    description: "Étudiant en architecture.",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h ago - NEW
  },
  {
    id: "demo-7",
    firstName: "Camille",
    lastName: "B.",
    city: "Paris",
    budget: 1100,
    housingType: "t2",
    jobStatus: "cdi",
    hasGuarantor: true,
    urgency: "1_mois",
    description: "Consultante en stratégie.",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
  },
  {
    id: "demo-8",
    firstName: "Antoine",
    lastName: "G.",
    city: "Lyon",
    budget: 800,
    housingType: "t1",
    jobStatus: "cdd",
    hasGuarantor: true,
    urgency: "flexible",
    description: "En transition professionnelle.",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  },
  {
    id: "demo-9",
    firstName: "Léa",
    lastName: "V.",
    city: "Bordeaux",
    budget: 750,
    housingType: "studio",
    jobStatus: "etudiant",
    hasGuarantor: true,
    urgency: "2_mois",
    description: "Étudiante en droit.",
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30min ago - NEW
  },
  {
    id: "demo-10",
    firstName: "Maxime",
    lastName: "D.",
    city: "Nice",
    budget: 1300,
    housingType: "t3",
    jobStatus: "cdi",
    hasGuarantor: false,
    urgency: "immediate",
    description: "Chef de projet digital.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: "demo-11",
    firstName: "Chloé",
    lastName: "L.",
    city: "Paris",
    budget: 950,
    housingType: "t2",
    jobStatus: "cdi",
    hasGuarantor: true,
    urgency: "1_mois",
    description: "Designeuse UX.",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
  },
  {
    id: "demo-12",
    firstName: "Raphaël",
    lastName: "S.",
    city: "Strasbourg",
    budget: 680,
    housingType: "studio",
    jobStatus: "etudiant",
    hasGuarantor: true,
    urgency: "flexible",
    description: "Étudiant en informatique.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
];

// Constantes
const PROFILES_PER_PAGE = 6;

// Composant Avatar stylisé
function ProfileAvatar({ firstName }: { firstName: string }) {
  const initial = firstName ? firstName.charAt(0).toUpperCase() : "?";
  
  return (
    <div 
      className="avatar"
      style={{
        width: "48px",
        height: "48px",
        background: "#560591",
        color: "white",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "20px",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

// Badge Nouveau
function NewBadge() {
  return (
    <span className="absolute top-3 left-3 bg-[#10B981] text-white text-xs font-semibold px-2 py-1 rounded-full animate-pulse">
      Nouveau
    </span>
  );
}

// Composant Carte Locataire amélioré
function TenantCardImproved({ profile, delay = 0 }: { profile: any; delay?: number }) {
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

  // Vérifier si le profil est nouveau (moins de 24h)
  const isNew = profile.createdAt && (Date.now() - new Date(profile.createdAt).getTime()) < 24 * 60 * 60 * 1000;

  return (
    <div
      className="group bg-white rounded-2xl border-l-4 border-l-[#560591] shadow-luxe hover-lift overflow-hidden opacity-0 animate-fade-slide-up relative"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Badge Nouveau */}
      {isNew && <NewBadge />}
      
      {/* Badge urgence */}
      {profile.urgency === "immediate" && (
        <div className={`absolute top-3 ${isNew ? 'left-20' : 'right-3'} bg-[#F59E0B] text-white text-xs font-semibold px-3 py-1 rounded-full`}>
          🔥 {getUrgencyLabel(profile.urgency)}
        </div>
      )}

      {/* Image placeholder */}
      <div className="relative h-32 bg-gradient-to-br from-[#FAF5FF] to-[#EDE9FE]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#560591] opacity-10" />
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5">
        {/* En-tête avec avatar stylisé */}
        <div className="flex items-center gap-3 mb-3">
          <ProfileAvatar firstName={profile.firstName} />
          <div className="min-w-0">
            <h3 className="font-bold text-[#1E293B] text-lg truncate">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-[#475569] text-sm flex items-center gap-1">
              <svg className="w-4 h-4 text-[#560591] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{profile.city}</span>
            </p>
          </div>
        </div>

        {/* Budget */}
        <div className="mb-3">
          <span className="text-[#560591] font-bold text-xl">💰 {profile.budget} €</span>
          <span className="text-[#94A3B8] text-sm"> /mois</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {getHousingTypeLabel(profile.housingType) && (
            <span className="bg-[#EDE9FE] text-[#560591] text-xs font-medium px-2.5 py-1 rounded-full">
              {getHousingTypeLabel(profile.housingType)}
            </span>
          )}
          <span className="bg-[#ECFDF5] text-[#10B981] text-xs font-medium px-2.5 py-1 rounded-full">
            💼 {getJobStatusLabel(profile.jobStatus)}
          </span>
          {profile.hasGuarantor && (
            <span className="bg-[#ECFDF5] text-[#10B981] text-xs font-medium px-2.5 py-1 rounded-full">
              ✅ Garant
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/annonce/locataire/${profile.id}`}
          className="block w-full text-center bg-[#560591] text-white font-semibold py-2.5 rounded-xl transition-all duration-300 hover:bg-[#3D0466] hover:shadow-lg hover:scale-[1.02]"
        >
          Voir le profil
        </Link>
      </div>
    </div>
  );
}

// Page principale
export default function ProfilsLocatairesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  
  // Charger les profils
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch("/api/profiles?limit=100");
        if (res.ok) {
          const data = await res.json();
          if (data.profiles && data.profiles.length > 0) {
            setProfiles(data.profiles);
          } else {
            setProfiles(allDemoProfiles);
          }
        } else {
          setProfiles(allDemoProfiles);
        }
      } catch {
        setProfiles(allDemoProfiles);
      }
    };
    fetchProfiles();
  }, []);

  // Extraire les villes uniques
  const cities = useMemo(() => {
    const uniqueCities = [...new Set(profiles.map(p => p.city))];
    return uniqueCities.sort();
  }, [profiles]);

  // Filtrer par ville
  const filteredProfiles = useMemo(() => {
    if (selectedCity === "all") return profiles;
    return profiles.filter(p => p.city === selectedCity);
  }, [profiles, selectedCity]);

  // Pagination
  const totalPages = Math.ceil(filteredProfiles.length / PROFILES_PER_PAGE);
  const displayedProfiles = useMemo(() => {
    return filteredProfiles.slice(0, currentPage * PROFILES_PER_PAGE);
  }, [filteredProfiles, currentPage]);

  const hasMore = displayedProfiles.length < filteredProfiles.length;

  // Charger plus
  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsLoading(false);
    }, 300);
  };

  // Stats
  const stats = useMemo(() => {
    const newCount = profiles.filter(p => 
      p.createdAt && (Date.now() - new Date(p.createdAt).getTime()) < 24 * 60 * 60 * 1000
    ).length;
    return { total: profiles.length, new: newCount };
  }, [profiles]);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-8 bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            {/* Fil d'ariane */}
            <nav className="flex items-center gap-2 text-sm text-[#94A3B8] mb-4">
              <Link href="/" className="hover:text-[#560591]">Accueil</Link>
              <span>/</span>
              <span className="text-[#560591] font-medium">Locataires actifs</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E293B] mb-2">
                  Tous les locataires actifs
                </h1>
                <p className="text-[#475569] text-lg">
                  <span className="text-[#560591] font-semibold">{stats.total} profils</span>
                  {stats.new > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      • <span className="bg-[#10B981] text-white text-xs px-2 py-0.5 rounded-full">{stats.new} nouveaux</span>
                    </span>
                  )}
                </p>
              </div>
              
              <Link
                href="/je-cherche"
                className="inline-flex items-center gap-2 bg-[#560591] text-white font-semibold px-5 py-3 rounded-xl hover:bg-[#3D0466] transition-colors whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Publier mon profil
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filtres */}
      <section className="py-4 bg-white border-b border-[#F1F5F9] sticky top-16 md:top-20 z-40">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[#475569] text-sm font-medium">Filtrer par ville :</span>
              
              <button
                onClick={() => setSelectedCity("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCity === "all"
                    ? "bg-[#560591] text-white"
                    : "bg-[#F8FAFC] text-[#475569] hover:bg-[#FAF5FF]"
                }`}
              >
                Toutes
              </button>
              
              {cities.slice(0, 6).map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCity === city
                      ? "bg-[#560591] text-white"
                      : "bg-[#F8FAFC] text-[#475569] hover:bg-[#FAF5FF]"
                  }`}
                >
                  {city}
                </button>
              ))}
              
              {cities.length > 6 && (
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-[#F8FAFC] text-[#475569] border-0 focus:ring-2 focus:ring-[#560591]"
                >
                  <option value="all">Autres villes...</option>
                  {cities.slice(6).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grille des profils */}
      <section className="py-8">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            {displayedProfiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedProfiles.map((profile, index) => (
                    <TenantCardImproved key={profile.id} profile={profile} delay={index * 50} />
                  ))}
                </div>

                {/* Bouton Charger plus */}
                {hasMore && (
                  <div className="text-center mt-10">
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 bg-white border-2 border-[#560591] text-[#560591] font-semibold px-8 py-3 rounded-xl transition-all hover:bg-[#560591] hover:text-white disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Chargement...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          Charger plus de profils
                        </>
                      )}
                    </button>
                    
                    <p className="text-[#94A3B8] text-sm mt-3">
                      {displayedProfiles.length} sur {filteredProfiles.length} profils affichés
                    </p>
                  </div>
                )}

                {/* Indicateur de fin */}
                {!hasMore && displayedProfiles.length > PROFILES_PER_PAGE && (
                  <div className="text-center mt-10 py-6 border-t border-[#F1F5F9]">
                    <p className="text-[#94A3B8]">
                      ✓ Tous les profils ont été chargés
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* Message si aucun profil */
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#FAF5FF] flex items-center justify-center">
                  <span className="text-5xl">🏠</span>
                </div>
                <h3 className="text-xl font-bold text-[#1E293B] mb-2">
                  Aucun profil trouvé
                </h3>
                <p className="text-[#475569] mb-6">
                  {selectedCity !== "all" 
                    ? `Aucun locataire à ${selectedCity} pour le moment.`
                    : "Soyez le premier à publier votre recherche de logement !"
                  }
                </p>
                <Link
                  href="/je-cherche"
                  className="inline-flex items-center gap-2 bg-[#560591] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#3D0466] transition-colors"
                >
                  Publier mon profil
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Propriétaire */}
      <section className="py-12 bg-[#FAF5FF]">
        <div className="container-domelia text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-4">
            Vous êtes propriétaire ?
          </h2>
          <p className="text-[#475569] max-w-xl mx-auto mb-6">
            Publiez votre bien et trouvez le locataire idéal parmi nos profils vérifiés.
          </p>
          <Link
            href="/je-loue"
            className="inline-flex items-center gap-2 bg-[#560591] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#3D0466] transition-colors"
          >
            🏠 Publier votre bien
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
