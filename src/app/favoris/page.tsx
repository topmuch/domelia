// Page Favoris - Domelia.fr
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";

export default async function FavorisPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion?redirect=/favoris");
  }

  // Si l'utilisateur est locataire sans profil, afficher message
  const needsProfile = user.role === "locataire" && !user.tenantProfile;

  if (needsProfile) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container-domelia">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-[#F1F5F9]">
                <div className="text-6xl mb-6">❤️</div>
                <h1 className="text-2xl font-bold text-[#1E293B] mb-4">
                  Creez votre profil pour utiliser les favoris
                </h1>
                <p className="text-[#475569] mb-6">
                  Pour sauvegarder des annonces et etre contacte par les proprietaires, 
                  creez d&apos;abord votre profil de recherche.
                </p>
                <Link
                  href="/je-cherche"
                  className="inline-flex items-center gap-2 bg-[#560591] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#3D0466] transition-colors"
                >
                  <span>📝</span>
                  Creer mon profil
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Récupérer les favoris
  let favorites: any[] = [];
  try {
    favorites = await db.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Erreur lors de la recuperation des favoris:", error);
  }

  // Enrichir chaque favori avec les details
  const enrichedFavorites: any[] = [];
  
  for (const fav of favorites) {
    try {
      let details: any = null;

      switch (fav.targetType) {
        case "locataire":
          details = await db.tenantProfile.findUnique({
            where: { id: fav.targetId },
            select: { id: true, firstName: true, city: true, budget: true },
          });
          break;
        case "logement":
          details = await db.landlordListing.findUnique({
            where: { id: fav.targetId },
            select: { id: true, title: true, location: true, price: true },
          });
          break;
        case "coloc":
          details = await db.colocListing.findUnique({
            where: { id: fav.targetId },
            select: { id: true, title: true, location: true, price: true },
          });
          break;
        case "service":
          details = await db.serviceAd.findUnique({
            where: { id: fav.targetId },
            select: { id: true, title: true, category: true, price: true, zone: true },
          });
          break;
      }

      if (details) {
        enrichedFavorites.push({
          id: fav.id,
          targetType: fav.targetType,
          targetId: fav.targetId,
          details,
        });
      }
    } catch {
      // Ignorer les erreurs individuelles
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            {/* En-tête */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
                ❤️ Mes favoris
              </h1>
              <p className="text-[#475569]">
                {enrichedFavorites.length} element{enrichedFavorites.length > 1 ? "s" : ""} sauvegarde{enrichedFavorites.length > 1 ? "s" : ""}
              </p>
            </div>

            {/* Liste des favoris */}
            {enrichedFavorites.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-[#F1F5F9]">
                <div className="text-6xl mb-4">💔</div>
                <h3 className="text-xl font-bold text-[#1E293B] mb-2">
                  Aucun favori
                </h3>
                <p className="text-[#475569] mb-6">
                  Vous n&apos;avez pas encore sauvegarde d&apos;elements
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-[#560591] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#3D0466] transition-colors"
                >
                  Decouvrir les annonces
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrichedFavorites.map((fav) => {
                  const getLink = () => {
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

                  const getTitle = () => {
                    const d = fav.details;
                    switch (fav.targetType) {
                      case "locataire":
                        return d.firstName ? `${d.firstName} - ${d.city || ""}` : "Profil";
                      case "logement":
                      case "coloc":
                        return d.title || "Sans titre";
                      case "service":
                        return d.title || "Service";
                      default:
                        return "Sans titre";
                    }
                  };

                  const getPrice = () => {
                    const d = fav.details;
                    return d.price ? `${d.price} EUR/mois` : "Prix sur devis";
                  };

                  const getLocation = () => {
                    const d = fav.details;
                    return d.city || d.location || d.zone || "";
                  };

                  const getTypeBadge = () => {
                    const badges: Record<string, { label: string; color: string }> = {
                      locataire: { label: "👤 Locataire", color: "bg-pink-100 text-pink-600" },
                      logement: { label: "🏠 Logement", color: "bg-blue-100 text-blue-600" },
                      coloc: { label: "🛏️ Colocation", color: "bg-orange-100 text-orange-600" },
                      service: { label: "🔧 Service", color: "bg-green-100 text-green-600" },
                    };
                    return badges[fav.targetType] || { label: fav.targetType, color: "bg-gray-100 text-gray-600" };
                  };

                  const badge = getTypeBadge();

                  return (
                    <div
                      key={fav.id}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#F1F5F9] hover:shadow-md transition-shadow"
                    >
                      <div className="p-5">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>

                        <h3 className="font-bold text-[#1E293B] mt-3 line-clamp-2">
                          {getTitle()}
                        </h3>

                        <div className="flex items-center gap-2 mt-2 text-[#475569] text-sm">
                          📍 {getLocation()}
                        </div>

                        <p className="text-[#560591] font-bold mt-3">
                          {getPrice()}
                        </p>

                        <div className="flex gap-2 mt-4">
                          <Link
                            href={getLink()}
                            className="flex-1 text-center bg-[#560591] text-white py-2 rounded-xl font-medium hover:bg-[#3D0466] transition-colors"
                          >
                            Voir
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
