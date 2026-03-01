// Page colocation - Domelia.fr
import Link from "next/link";
import { Navbar } from "@/components/domelia/Navbar";
import { ColocationCard } from "@/components/domelia/ColocationCard";
import { Footer } from "@/components/domelia/Footer";
import { ColocationListClient } from "./ColocationListClient";

// Données de démo pour les colocations
const demoColocations = [
  {
    id: "coloc-1",
    type: "chambre" as const,
    title: "Chambre dans T4 Spacieux",
    location: "Paris 18e",
    price: 550,
    surface: 14,
    photos: JSON.stringify(["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"]),
    latitude: 48.8935,
    longitude: 2.3467,
    user: { name: "Marie D.", initials: "M" },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "coloc-2",
    type: "recherche_coloc" as const,
    title: "Léa cherche un colocataire",
    location: "Lyon 7e",
    price: 450,
    surface: 12,
    photos: null,
    user: { name: "Léa M.", initials: "L" },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "coloc-3",
    type: "chambre" as const,
    title: "Chambre Lumineuse Colocation",
    location: "Bordeaux",
    price: 480,
    surface: 12,
    photos: JSON.stringify(["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"]),
    latitude: 44.8507,
    longitude: -0.5708,
    user: { name: "Thomas B.", initials: "T" },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "coloc-4",
    type: "chambre" as const,
    title: "Colocation T5 - Chambre Privative",
    location: "Toulouse",
    price: 420,
    surface: 15,
    photos: JSON.stringify(["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"]),
    latitude: 43.6047,
    longitude: 1.4442,
    user: { name: "Sophie L.", initials: "S" },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "coloc-5",
    type: "recherche_coloc" as const,
    title: "Marc cherche un colocataire",
    location: "Nantes",
    price: 380,
    surface: 14,
    photos: null,
    user: { name: "Marc P.", initials: "M" },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "coloc-6",
    type: "chambre" as const,
    title: "Chambre Meublée Centre-Ville",
    location: "Marseille",
    price: 390,
    surface: 11,
    photos: JSON.stringify(["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop"]),
    latitude: 43.2965,
    longitude: 5.3698,
    user: { name: "Julie R.", initials: "J" },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
];

export default function ColocationPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-24 pb-8 bg-gradient-to-br from-[#FFF7ED] via-white to-[#FEF3C7]">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-[#94A3B8] mb-4">
              <Link href="/" className="hover:text-[#560591]">Accueil</Link>
              <span>/</span>
              <span className="text-[#560591] font-medium">Colocation</span>
            </nav>

            <div className="inline-block bg-[#FFF7ED] text-[#F59E0B] font-semibold px-4 py-2 rounded-full text-sm mb-4">
              🛏️ Économisez sur votre loyer
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              Colocations & sous-locations
            </h1>
            <p className="text-[#475569] text-lg max-w-2xl">
              Trouvez une chambre ou un colocataire idéal. Des offres vérifiées pour une colocation sereine.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            {/* Composant client avec filtres et liste */}
            <ColocationListClient demoColocations={demoColocations} />

            {/* Lien pour déposer une annonce */}
            <div className="mt-8 text-center">
              <Link
                href="/deposer-colocation"
                className="inline-flex items-center gap-2 bg-[#560591] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#3D0466] transition-all hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Déposer une annonce
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
