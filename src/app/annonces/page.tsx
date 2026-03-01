// Page toutes les annonces - Domelia.fr
import { db } from "@/lib/db";
import Link from "next/link";
import { Navbar } from "@/components/domelia/Navbar";
import { ListingCard } from "@/components/domelia/ListingCard";
import { Footer } from "@/components/domelia/Footer";

const demoListings = [
  {
    id: "listing-1",
    type: "logement" as const,
    title: "T2 Lumineux avec Balcon",
    location: "Bordeaux Centre",
    city: "Bordeaux",
    price: 1250,
    surface: 45,
    rooms: 2,
    photos: null,
  },
  {
    id: "listing-2",
    type: "logement" as const,
    title: "Studio Rénové Haussmannien",
    location: "Paris 11e",
    city: "Paris",
    price: 980,
    surface: 28,
    rooms: 1,
    photos: null,
  },
  {
    id: "listing-3",
    type: "parking" as const,
    title: "Place de Parking Sécurisée",
    location: "Lyon 6e",
    city: "Lyon",
    price: 120,
    surface: 15,
    rooms: 0,
    photos: null,
  },
  {
    id: "listing-4",
    type: "logement" as const,
    title: "T3 Vue Parc",
    location: "Nantes Centre",
    city: "Nantes",
    price: 1100,
    surface: 65,
    rooms: 3,
    photos: null,
  },
  {
    id: "listing-5",
    type: "logement" as const,
    title: "Appartement Neuf",
    location: "Toulouse Borderouge",
    city: "Toulouse",
    price: 950,
    surface: 52,
    rooms: 2,
    photos: null,
  },
  {
    id: "listing-6",
    type: "parking" as const,
    title: "Box Fermé",
    location: "Marseille 8e",
    city: "Marseille",
    price: 95,
    surface: 18,
    rooms: 0,
    photos: null,
  },
];

interface PageProps {
  searchParams: Promise<{ success?: string }>;
}

export default async function AnnoncesPage({ searchParams }: PageProps) {
  const { success } = await searchParams;
  
  let listings;
  
  try {
    const dbListings = await db.landlordListing.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (dbListings.length === 0) {
      listings = demoListings;
    } else {
      listings = dbListings.map((l) => ({
        id: l.id,
        type: l.type as "logement" | "parking" | "colocation",
        title: l.title,
        location: l.location,
        city: l.location,
        price: l.price,
        surface: l.surface || undefined,
        rooms: l.rooms || undefined,
        photos: l.photos,
      }));
    }
  } catch (error) {
    listings = demoListings;
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-24 pb-8 bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-[#94A3B8] mb-4">
              <Link href="/" className="hover:text-[#560591]">Accueil</Link>
              <span>/</span>
              <span className="text-[#560591] font-medium">Annonces</span>
            </nav>

            {/* Message de succès */}
            {success && (
              <div className="mb-6 bg-[#ECFDF5] border border-[#10B981] text-[#065F46] px-6 py-4 rounded-xl flex items-center gap-3 animate-fade-in">
                <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">Annonce publiée avec succès !</p>
                  <p className="text-sm text-[#047857]">Votre bien est maintenant visible par tous les locataires.</p>
                </div>
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              Toutes les annonces
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-[#475569] text-lg">
                {listings.length} logements et parkings disponibles
              </p>
              <Link
                href="/je-loue"
                className="inline-flex items-center gap-2 bg-[#560591] text-white font-semibold px-5 py-3 rounded-xl hover:bg-[#3D0466] transition-colors whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Publier votre bien
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing, index) => (
                <ListingCard key={listing.id} listing={listing} delay={index * 50} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Propriétaire */}
      <section className="py-12 bg-[#FAF5FF]">
        <div className="container-domelia text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-4">
            Vous avez un bien à louer ?
          </h2>
          <p className="text-[#475569] max-w-xl mx-auto mb-6">
            Publiez votre annonce gratuitement et trouvez le locataire idéal parmi nos profils vérifiés.
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
