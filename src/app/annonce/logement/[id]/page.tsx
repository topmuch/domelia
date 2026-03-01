// Page détail annonce logement - Domelia.fr
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";
import { ContactButton } from "@/components/domelia/ContactButton";
import ImageGallery from "./ImageGallery";

// Données de démo avec images uniques et coordonnées
const demoListings: Record<string, any> = {
  "listing-1": {
    id: "listing-1",
    type: "logement",
    title: "T2 Lumineux avec Balcon",
    description: "Magnifique T2 de 45 m² situé au 3ème étage avec ascenseur. Appartement rénové avec des matériaux de qualité, offrant un séjour lumineux avec balcon exposé sud, une cuisine équipée, une chambre avec placard intégré et une salle de bain moderne. Proche de toutes commodités (commerces, transports, écoles).",
    location: "Bordeaux Centre",
    city: "Bordeaux",
    address: "Rue Sainte-Catherine, 33000 Bordeaux",
    price: 1250,
    surface: 45,
    rooms: 2,
    photos: JSON.stringify(["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"]),
    latitude: 44.8378,
    longitude: -0.5792,
    user: { name: "Propriétaire vérifié" },
    createdAt: new Date(),
  },
  "listing-2": {
    id: "listing-2",
    type: "logement",
    title: "Studio Rénové Haussmannien",
    description: "Charmant studio de 28 m² dans un immeuble haussmannien entièrement rénové. Parquet ancien, moulures, cheminée décorative. Cuisine américaine équipée, salle de douche avec douche à l'italienne. Situé dans le 11e arrondissement, à deux pas du métro Oberkampf.",
    location: "Paris 11e",
    city: "Paris",
    address: "Rue Oberkampf, 75011 Paris",
    price: 980,
    surface: 28,
    rooms: 1,
    photos: JSON.stringify(["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"]),
    latitude: 48.8566,
    longitude: 2.3805,
    user: { name: "Agence Paris Logement" },
    createdAt: new Date(),
  },
  "listing-3": {
    id: "listing-3",
    type: "parking",
    title: "Place de Parking Sécurisée",
    description: "Place de parking en sous-sol dans un immeuble sécurisé avec vigik. Accès 24h/24. Hauteur 1,90m. Idéal pour véhicule citadin.",
    location: "Lyon 6e",
    city: "Lyon",
    address: "Boulevard des Belges, 69006 Lyon",
    price: 120,
    surface: 15,
    rooms: 0,
    photos: JSON.stringify(["https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=600&fit=crop"]),
    latitude: 45.7640,
    longitude: 4.8357,
    user: { name: "Résidence Les Belges" },
    createdAt: new Date(),
  },
  "listing-4": {
    id: "listing-4",
    type: "logement",
    title: "T3 Vue Parc",
    description: "Superbe T3 de 65 m² avec vue sur parc. Grande pièce de vie lumineuse, deux chambres, cuisine équipée. Parking inclus.",
    location: "Nantes Centre",
    city: "Nantes",
    address: "Place Royale, 44000 Nantes",
    price: 1100,
    surface: 65,
    rooms: 3,
    photos: JSON.stringify(["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"]),
    latitude: 47.2184,
    longitude: -1.5536,
    user: { name: "Nantes Habitat" },
    createdAt: new Date(),
  },
  "listing-5": {
    id: "listing-5",
    type: "logement",
    title: "Appartement Neuf",
    description: "Appartement neuf de 52 m² dans résidence récente. Terrasse, parking souterrain, ascenseur. Proche métro et commerces.",
    location: "Toulouse Borderouge",
    city: "Toulouse",
    address: "Avenue de l'Université, 31000 Toulouse",
    price: 950,
    surface: 52,
    rooms: 2,
    photos: JSON.stringify(["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"]),
    latitude: 43.6047,
    longitude: 1.4442,
    user: { name: "Toulouse Immobilier" },
    createdAt: new Date(),
  },
  "listing-6": {
    id: "listing-6",
    type: "parking",
    title: "Box Fermé",
    description: "Box fermé de 18 m², idéal pour stockage ou véhicule. Accès sécurisé, hauteur 2m.",
    location: "Marseille 8e",
    city: "Marseille",
    address: "Rue de la République, 13008 Marseille",
    price: 95,
    surface: 18,
    rooms: 0,
    photos: JSON.stringify(["https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&h=600&fit=crop"]),
    latitude: 43.2587,
    longitude: 5.3767,
    user: { name: "Park'n Store" },
    createdAt: new Date(),
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LogementPage({ params }: PageProps) {
  const { id } = await params;
  
  let listing;
  
  try {
    listing = await db.landlordListing.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true },
        },
      },
    });
    
    if (!listing && demoListings[id]) {
      listing = demoListings[id];
    }
  } catch (error) {
    listing = demoListings[id];
  }

  if (!listing) {
    notFound();
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      logement: "Logement entier",
      parking: "Parking",
      colocation: "Colocation",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      logement: "#560591",
      parking: "#7C3AED",
      colocation: "#F59E0B",
    };
    return colors[type] || "#560591";
  };

  // Parser toutes les images
  let photos: string[] = [];
  if (listing.photos) {
    try {
      photos = typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos;
    } catch {
      photos = [];
    }
  }

  // Images de fallback
  const fallbackImage = listing.type === "parking"
    ? "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=600&fit=crop"
    : "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop";

  if (photos.length === 0) {
    photos = [fallbackImage];
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-8 bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            {/* Fil d'ariane */}
            <nav className="flex items-center gap-2 text-sm text-[#94A3B8] mb-4">
              <Link href="/" className="hover:text-[#560591]">Accueil</Link>
              <span>/</span>
              <Link href="/annonces" className="hover:text-[#560591]">Annonces</Link>
              <span>/</span>
              <span className="text-[#1E293B]">{listing.title}</span>
            </nav>

            {/* Badge */}
            <div 
              className="inline-block text-white text-sm font-semibold px-4 py-1 rounded-full mb-4"
              style={{ backgroundColor: getTypeColor(listing.type) }}
            >
              {getTypeLabel(listing.type)}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              {listing.title}
            </h1>

            <p className="text-[#475569] text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-[#560591]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {listing.location || listing.city}
              {listing.surface && ` • ${listing.surface} m²`}
              {listing.rooms && listing.rooms > 0 && ` • T${listing.rooms}`}
            </p>
          </div>
        </div>
      </section>

      {/* Galerie d'images */}
      <section className="py-4">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            <ImageGallery photos={photos} title={listing.title} price={listing.price} />
          </div>
        </div>
      </section>

      {/* Contenu détaillé */}
      <section className="py-8">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-2xl shadow-luxe p-6">
                <h2 className="text-xl font-bold text-[#1E293B] mb-4">Description</h2>
                <p className="text-[#475569] leading-relaxed whitespace-pre-line">
                  {listing.description || "Aucune description fournie."}
                </p>
              </div>

              {/* Caractéristiques */}
              <div className="bg-white rounded-2xl shadow-luxe p-6">
                <h2 className="text-xl font-bold text-[#1E293B] mb-4">Caractéristiques</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#560591]">{listing.surface || "-"}</p>
                    <p className="text-sm text-[#94A3B8]">m²</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#560591]">{listing.rooms || "0"}</p>
                    <p className="text-sm text-[#94A3B8]">pièce(s)</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#560591]">{listing.price}</p>
                    <p className="text-sm text-[#94A3B8]">€/mois</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                    <p className="text-lg font-bold text-[#560591]">{getTypeLabel(listing.type)}</p>
                    <p className="text-sm text-[#94A3B8]">Type</p>
                  </div>
                </div>
              </div>

              {/* Localisation avec carte */}
              <div className="bg-white rounded-2xl shadow-luxe p-6">
                <h2 className="text-xl font-bold text-[#1E293B] mb-4">Localisation</h2>
                
                {listing.address && (
                  <p className="text-[#475569] flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-[#560591]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {listing.address}
                  </p>
                )}

                {/* Carte OpenStreetMap */}
                <div className="w-full h-48 rounded-xl overflow-hidden border border-[#F1F5F9]">
                  {listing.latitude && listing.longitude ? (
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.longitude - 0.01}%2C${listing.latitude - 0.005}%2C${listing.longitude + 0.01}%2C${listing.latitude + 0.005}&layer=mapnik&marker=${listing.latitude}%2C${listing.longitude}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      title="Localisation"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FAF5FF] to-[#EDE9FE] flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">📍</span>
                        <p className="text-[#475569] text-sm">Localisation approximative</p>
                        <p className="text-[#94A3B8] text-xs">{listing.city || listing.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CTA Contact */}
              <div className="bg-[#560591] rounded-2xl p-6 text-white sticky top-24">
                <h3 className="text-xl font-bold mb-2">Intéressé ?</h3>
                <p className="text-white/80 text-sm mb-4">
                  Contactez le propriétaire pour organiser une visite.
                </p>
                <ContactButton 
                  targetName={listing.user?.name || "le propriétaire"} 
                  targetType="proprietaire" 
                  targetId={listing.id} 
                />
                <p className="text-white/60 text-xs mt-3 text-center">
                  Annonce publiée par {listing.user?.name || "un propriétaire"}
                </p>
              </div>

              {/* Info */}
              <div className="bg-[#F8FAFC] rounded-2xl p-6 text-sm text-[#94A3B8]">
                <p>
                  Annonce publiée le {new Date(listing.createdAt).toLocaleDateString("fr-FR", {
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
