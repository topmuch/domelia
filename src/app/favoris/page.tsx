// Page Favoris - Domelia.fr
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";
import FavoritesClient from "./FavoritesClient";

export default async function FavorisPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion?redirect=/favoris");
  }

  // Récupérer les favoris avec détails
  const favorites = await db.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Enrichir chaque favori avec les détails
  const enrichedFavorites = await Promise.all(
    favorites.map(async (fav) => {
      let details: any = null;

      try {
        switch (fav.targetType) {
          case "locataire":
            details = await db.tenantProfile.findUnique({
              where: { id: fav.targetId },
              select: {
                id: true,
                firstName: true,
                city: true,
                budget: true,
                housingType: true,
                jobStatus: true,
                hasGuarantor: true,
              },
            });
            break;
          case "logement":
            details = await db.landlordListing.findUnique({
              where: { id: fav.targetId },
              select: {
                id: true,
                title: true,
                location: true,
                price: true,
                surface: true,
                type: true,
                photos: true,
              },
            });
            break;
          case "coloc":
            details = await db.colocListing.findUnique({
              where: { id: fav.targetId },
              select: {
                id: true,
                title: true,
                location: true,
                price: true,
                surface: true,
                type: true,
                photos: true,
              },
            });
            break;
          case "service":
            details = await db.serviceAd.findUnique({
              where: { id: fav.targetId },
              select: {
                id: true,
                title: true,
                company: true,
                category: true,
                price: true,
                zone: true,
              },
            });
            break;
        }
      } catch {
        // L'élément n'existe peut-être plus
      }

      return {
        ...fav,
        details,
        createdAt: fav.createdAt.toISOString(),
      };
    })
  );

  // Filtrer les favoris dont l'élément n'existe plus
  const validFavorites = enrichedFavorites.filter((f) => f.details !== null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
              ❤️ Mes favoris
            </h1>
            <p className="text-[#475569] mb-8">
              {validFavorites.length} élément{validFavorites.length > 1 ? "s" : ""} sauvegardé{validFavorites.length > 1 ? "s" : ""}
            </p>
            <FavoritesClient favorites={validFavorites} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
