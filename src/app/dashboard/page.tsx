// Dashboard utilisateur - Domelia.fr
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Redirection si non connecte
  if (!user) {
    redirect("/connexion?redirect=/dashboard");
  }

  // Si l'utilisateur est locataire sans profil, proposer la creation
  const needsProfile = user.role === "locataire" && !user.tenantProfile;

  // Données de base du user
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  // Si pas de profil requis, rediriger vers creation
  if (needsProfile) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
        <Navbar />
        
        <div className="pt-24 pb-16">
          <div className="container-domelia">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-[#F1F5F9]">
                <div className="text-6xl mb-6">🏠</div>
                <h1 className="text-2xl font-bold text-[#1E293B] mb-4">
                  Bienvenue sur Domelia !
                </h1>
                <p className="text-[#475569] mb-6 text-lg">
                  Pour accéder à votre espace personnel et être visible par les propriétaires, 
                  créez votre profil de recherche de logement.
                </p>
                <div className="bg-[#FAF5FF] rounded-xl p-6 mb-6">
                  <h2 className="font-semibold text-[#1E293B] mb-3">Pourquoi créer un profil ?</h2>
                  <ul className="text-left text-[#475569] space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-[#10B981]">✓</span>
                      Les propriétaires pourront vous contacter
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#10B981]">✓</span>
                      Vous recevrez des propositions correspondant à vos critères
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#10B981]">✓</span>
                      Gagnez du temps dans votre recherche
                    </li>
                  </ul>
                </div>
                <Link
                  href="/je-cherche"
                  className="inline-flex items-center gap-2 bg-[#560591] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#3D0466] transition-colors text-lg"
                >
                  <span>📝</span>
                  Créer mon profil de recherche
                </Link>
                <p className="text-sm text-[#94A3B8] mt-4">
                  C'est gratuit et ça prend moins de 2 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </main>
    );
  }

  // Données du profil locataire
  const tenantProfileData = user.tenantProfile ? {
    id: user.tenantProfile.id,
    firstName: user.tenantProfile.firstName,
    lastName: user.tenantProfile.lastName,
    city: user.tenantProfile.city,
    budget: user.tenantProfile.budget,
    housingType: user.tenantProfile.housingType,
    jobStatus: user.tenantProfile.jobStatus,
    hasGuarantor: user.tenantProfile.hasGuarantor,
    urgency: user.tenantProfile.urgency,
    description: user.tenantProfile.description,
    phone: user.tenantProfile.phone,
    views: user.tenantProfile.views,
  } : null;

  // Charger les annonces et favoris avec try-catch
  let listingsData: any[] = [];
  let favoritesCount = 0;
  let totalViews = user.tenantProfile?.views || 0;
  let activeListings = 0;

  try {
    const [listings, colocations, services, favorites] = await Promise.all([
      db.landlordListing.findMany({
        where: { userId: user.id },
        select: { id: true, title: true, location: true, price: true, isActive: true, views: true },
      }),
      db.colocListing.findMany({
        where: { userId: user.id },
        select: { id: true, title: true, location: true, price: true, isActive: true, views: true },
      }),
      db.serviceAd.findMany({
        where: { proId: user.id },
        select: { id: true, title: true, category: true, isActive: true, views: true },
      }),
      db.favorite.count({ where: { userId: user.id } }),
    ]);

    // Calculs
    totalViews += listings.reduce((sum, l) => sum + l.views, 0);
    totalViews += colocations.reduce((sum, c) => sum + c.views, 0);
    totalViews += services.reduce((sum, s) => sum + s.views, 0);
    
    activeListings = listings.filter(l => l.isActive).length + 
                      colocations.filter(c => c.isActive).length + 
                      services.filter(s => s.isActive).length;

    // Combiner les listings
    listingsData = [
      ...listings.map(l => ({ ...l, category: "logement" })),
      ...colocations.map(c => ({ ...c, category: "colocation" })),
      ...services.map(s => ({ ...s, category: "service", location: "", price: null })),
    ];

    favoritesCount = favorites;
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
  }

  // Import dynamique du composant client
  const DashboardClient = (await import("./DashboardClient")).default;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            {/* En-tête */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
                Bonjour, {user.name || user.email} 👋
              </h1>
              <p className="text-[#475569]">
                Bienvenue sur votre espace personnel
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#F1F5F9]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#560591]/10 flex items-center justify-center text-2xl">
                    👁️
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1E293B]">{totalViews}</p>
                    <p className="text-sm text-[#475569]">Vues totales</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#F1F5F9]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1E293B]">0</p>
                    <p className="text-sm text-[#475569]">Messages</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#F1F5F9]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center text-2xl">
                    🏠
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1E293B]">{activeListings}</p>
                    <p className="text-sm text-[#475569]">Annonces actives</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#F1F5F9]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-2xl">
                    ❤️
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1E293B]">{favoritesCount}</p>
                    <p className="text-sm text-[#475569]">Favoris</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Component */}
            <DashboardClient 
              user={userData}
              tenantProfile={tenantProfileData}
              listings={listingsData}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
