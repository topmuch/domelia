// Page détail profil locataire - Domelia.fr
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";
import { PayPalContactButton } from "@/components/domelia/PayPalContactButton";

// Données de démo pour les profils
const demoProfiles: Record<string, any> = {
  "demo-1": {
    id: "demo-1",
    firstName: "Marie",
    lastName: "L.",
    city: "Bordeaux",
    budget: 850,
    housingType: "t2",
    jobStatus: "cdi",
    hasGuarantor: true,
    urgency: "immediate",
    description: "Je suis une professionnelle travaillant dans le marketing digital. Je recherche un appartement lumineux et calme, idéalement près du centre-ville ou bien desservi par les transports. Je suis une locataire sérieuse avec des revenus stables et un garant disponible.",
    createdAt: new Date(),
    user: { name: "Marie L." },
  },
  "demo-2": {
    id: "demo-2",
    firstName: "Thomas",
    lastName: "D.",
    city: "Lyon",
    budget: 1200,
    housingType: "t3",
    jobStatus: "cdi",
    hasGuarantor: true,
    urgency: "1_mois",
    description: "Développeur dans une entreprise tech lyonnaise, je cherche un logement spacieux et moderne. Je suis non-fumeur, sans animaux, et très respectueux des lieux. Je recherche un quartier calme mais proche des commodités.",
    createdAt: new Date(),
    user: { name: "Thomas D." },
  },
  "demo-3": {
    id: "demo-3",
    firstName: "Sophie",
    lastName: "M.",
    city: "Paris",
    budget: 1500,
    housingType: "studio",
    jobStatus: "etudiant",
    hasGuarantor: true,
    urgency: "flexible",
    description: "Étudiante en médecine, je cherche un studio bien situé près des transports en commun. Mes parents peuvent se porter garants. Je suis calme et studieuse.",
    createdAt: new Date(),
    user: { name: "Sophie M." },
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LocatairePage({ params }: PageProps) {
  const { id } = await params;
  
  // Vérifier si l'utilisateur est connecté et propriétaire du profil
  const cookieStore = await cookies();
  const userId = cookieStore.get("domelia_user_id")?.value;
  let currentUser: { id: string; email: string; name: string | null; role: string } | null = null;
  if (userId) {
    currentUser = await verifyToken(userId);
  }
  
  let profile;
  
  try {
    profile = await db.tenantProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });
    
    // Si pas de profil en BDD, utiliser les données de démo
    if (!profile && demoProfiles[id]) {
      profile = demoProfiles[id];
    }
  } catch (error) {
    // En cas d'erreur, utiliser les données de démo
    profile = demoProfiles[id];
  }

  if (!profile) {
    notFound();
  }

  const getJobStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      cdi: "CDI",
      cdd: "CDD",
      etudiant: "Étudiant",
      independant: "Indépendant",
      retraite: "Retraité",
      sans_emploi: "En recherche d'emploi",
    };
    return labels[status] || status;
  };

  const getUrgencyLabel = (urgency: string) => {
    const labels: Record<string, string> = {
      immediate: "Recherche immédiate",
      "1_mois": "Dans 1 mois",
      "2_mois": "Dans 2 mois",
      flexible: "Flexible",
    };
    return labels[urgency] || urgency;
  };

  const getHousingTypeLabel = (type?: string | null) => {
    if (!type) return "Non spécifié";
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

  // CORRECTION #4: Utiliser l'initiale pour l'avatar
  const avatarInitial = profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "?";
  
  // Vérifier si l'utilisateur peut modifier ce profil
  const canEdit = currentUser && profile.userId === currentUser.id;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero du profil */}
      <section className="pt-20 pb-12 bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
        <div className="container-domelia">
          <div className="max-w-4xl mx-auto">
            {/* Fil d'ariane */}
            <nav className="flex items-center gap-2 text-sm text-[#94A3B8] mb-6">
              <Link href="/" className="hover:text-[#560591]">Accueil</Link>
              <span>/</span>
              <Link href="/profils-locataires" className="hover:text-[#560591]">Locataires</Link>
              <span>/</span>
              <span className="text-[#1E293B]">{profile.firstName}</span>
            </nav>

            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar - CORRECTION #4 */}
              <div className="w-32 h-32 rounded-3xl bg-[#560591] flex items-center justify-center text-white text-5xl font-bold shadow-luxe-lg">
                {avatarInitial}
              </div>

              {/* Infos principales */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B]">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  {profile.urgency === "immediate" && (
                    <span className="bg-[#F59E0B] text-white text-xs font-semibold px-3 py-1 rounded-full">
                      🔥 Urgent
                    </span>
                  )}
                  {/* Bouton Modifier */}
                  {canEdit && (
                    <Link
                      href={`/modifier-profil/${profile.id}`}
                      className="ml-auto inline-flex items-center gap-2 bg-[#560591] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#3D0466] transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </Link>
                  )}
                </div>
                
                <p className="text-xl text-[#475569] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#560591]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {profile.city}
                </p>

                <div className="flex flex-wrap gap-3">
                  <span className="bg-[#FAF5FF] text-[#560591] font-semibold px-4 py-2 rounded-xl">
                    💰 {profile.budget} €/mois
                  </span>
                  <span className="bg-[#EDE9FE] text-[#7C3AED] font-semibold px-4 py-2 rounded-xl">
                    🏠 {getHousingTypeLabel(profile.housingType)}
                  </span>
                  <span className="bg-[#ECFDF5] text-[#10B981] font-semibold px-4 py-2 rounded-xl">
                    💼 {getJobStatusLabel(profile.jobStatus)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu détaillé */}
      <section className="py-12">
        <div className="container-domelia">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="md:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-2xl shadow-luxe p-6">
                <h2 className="text-xl font-bold text-[#1E293B] mb-4">
                  À propos
                </h2>
                <p className="text-[#475569] leading-relaxed whitespace-pre-line">
                  {profile.description || "Aucune description fournie."}
                </p>
              </div>

              {/* Critères de recherche */}
              <div className="bg-white rounded-2xl shadow-luxe p-6">
                <h2 className="text-xl font-bold text-[#1E293B] mb-4">
                  Critères de recherche
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8FAFC] rounded-xl p-4">
                    <p className="text-sm text-[#94A3B8] mb-1">Budget</p>
                    <p className="text-lg font-semibold text-[#1E293B]">{profile.budget} €/mois</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-4">
                    <p className="text-sm text-[#94A3B8] mb-1">Type de logement</p>
                    <p className="text-lg font-semibold text-[#1E293B]">{getHousingTypeLabel(profile.housingType)}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-4">
                    <p className="text-sm text-[#94A3B8] mb-1">Ville</p>
                    <p className="text-lg font-semibold text-[#1E293B]">{profile.city}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-4">
                    <p className="text-sm text-[#94A3B8] mb-1">Disponibilité</p>
                    <p className="text-lg font-semibold text-[#1E293B]">{getUrgencyLabel(profile.urgency)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CTA Contact */}
              <div className="bg-[#560591] rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">
                  Vous avez un logement ?
                </h3>
                <p className="text-white/80 text-sm mb-4">
                  Ce profil correspond à votre bien ? Déverrouillez la messagerie pour contacter {profile.firstName} directement.
                </p>
                <PayPalContactButton 
                  tenantId={profile.id}
                  tenantName={profile.firstName}
                  city={profile.city}
                />
              </div>

              {/* Garanties */}
              <div className="bg-white rounded-2xl shadow-luxe p-6">
                <h3 className="font-bold text-[#1E293B] mb-4">Garanties</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${profile.hasGuarantor ? "bg-[#ECFDF5] text-[#10B981]" : "bg-[#FEF2F2] text-[#EF4444]"}`}>
                      {profile.hasGuarantor ? "✓" : "✕"}
                    </div>
                    <span className="text-[#475569]">
                      {profile.hasGuarantor ? "Garant disponible" : "Pas de garant"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
                      ✓
                    </div>
                    <span className="text-[#475569]">Profil vérifié</span>
                  </div>
                </div>
              </div>

              {/* Bouton Modifier (sidebar) */}
              {canEdit && (
                <Link
                  href={`/modifier-profil/${profile.id}`}
                  className="flex items-center justify-center gap-2 w-full bg-[#FAF5FF] text-[#560591] font-semibold py-3 rounded-xl border-2 border-[#560591] hover:bg-[#560591] hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier mon profil
                </Link>
              )}
              
              {/* Info */}
              <div className="bg-[#F8FAFC] rounded-2xl p-6 text-sm text-[#94A3B8]">
                <p>
                  Profil publié le {new Date(profile.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
