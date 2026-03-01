// Page détail annonce colocation - Domelia.fr
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";
import { ContactButton } from "@/components/domelia/ContactButton";
import { ColocDetailCard } from "@/components/domelia/ColocDetailCard";

// Données de démo pour les colocations
const demoColocations: Record<string, Record<string, unknown>> = {
  "coloc-1": {
    id: "coloc-1",
    type: "chambre",
    title: "Chambre dans T4 Spacieux",
    description: "Grande chambre de 14 m² dans un appartement T4 partagé avec 3 autres colocataires. L'appartement est lumineux, bien agencé avec une grande cuisine équipée, un salon confortable et une salle de bain rénovée. Les charges incluent l'électricité, le chauffage et l'internet fibre.\n\nL'immeuble est situé dans un quartier calme et résidentiel, proche de toutes les commodités : métro à 5 min, supermarché, pharmacie et parc public à proximité.\n\nNous cherchons une personne respectueuse, propre et ouverte d'esprit pour partager notre colocation conviviale.",
    location: "Paris 18e",
    address: "Rue du Simplon, 75018 Paris",
    price: 550,
    surface: 14,
    charges: 80,
    deposit: 550,
    availableFrom: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    photos: null,
    latitude: 48.8935,
    longitude: 2.3467,
    amenities: ["Meublé", "Internet fibre", "Lave-linge", "Cuisine équipée"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    user: { name: "Marie D.", initials: "M", isVerified: true },
  },
  "coloc-2": {
    id: "coloc-2",
    type: "recherche_coloc",
    title: "Léa cherche un colocataire",
    description: "Je suis une jeune professionnelle de 26 ans travaillant dans le marketing. Je cherche un(e) colocataire calme et respectueux(se) pour partager un T3 lumineux dans le 7e arrondissement de Lyon.\n\nJ'aime cuisiner, regarder des séries et faire du sport. Je suis respectueuse des espaces communs et je cherche quelqu'un avec qui partager de bons moments tout en respectant l'intimité de chacun.",
    location: "Lyon 7e",
    price: 450,
    desiredSurface: 12,
    lifestyle: ["Non-fumeur", "Pas d'animaux", "Calme"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    user: { name: "Léa M.", initials: "L", isVerified: true },
  },
  "coloc-3": {
    id: "coloc-3",
    type: "chambre",
    title: "Chambre Lumineuse Colocation",
    description: "Belle chambre lumineuse de 12 m² avec vue sur parc, disponible dans une colocation de 4 personnes. L'appartement dispose d'une grande cuisine ouverte, d'un salon confortable et de deux salles de bain.\n\nIdéalement situé près du tramway et du centre-ville. Quartier étudiant avec tous les commerces à proximité.\n\nColocation mixte, ambiance conviviale mais respectueuse. Idéal pour étudiant ou jeune actif.",
    location: "Bordeaux",
    address: "Cours de l'Yser, 33000 Bordeaux",
    price: 480,
    surface: 12,
    charges: 60,
    deposit: 480,
    availableFrom: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    photos: null,
    latitude: 44.8507,
    longitude: -0.5708,
    amenities: ["Meublé", "Internet", "Balcon", "Parking vélo"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    user: { name: "Thomas B.", initials: "T", isVerified: false },
  },
  "coloc-4": {
    id: "coloc-4",
    type: "chambre",
    title: "Colocation T5 - Chambre Privative",
    description: "Chambre spacieuse de 15 m² dans un T5 récent avec terrasse. L'appartement est entièrement meublé et équipé. La chambre dispose d'un grand placard et d'un bureau.\n\nColocation dynamique de 4 personnes, ambiance jeune et chaleureuse. Nous organisons régulièrement des repas partagés et des soirées jeux.\n\nProche de l'université et des transports en commun.",
    location: "Toulouse",
    address: "Avenue de l'Université, 31000 Toulouse",
    price: 420,
    surface: 15,
    charges: 50,
    deposit: 420,
    availableFrom: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    photos: null,
    latitude: 43.6047,
    longitude: 1.4442,
    amenities: ["Meublé", "Terrasse", "Lave-linge", "Climatisation"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    user: { name: "Sophie L.", initials: "S", isVerified: true },
  },
  "coloc-5": {
    id: "coloc-5",
    type: "recherche_coloc",
    title: "Marc cherche un colocataire",
    description: "Je suis un jeune ingénieur de 28 ans. Je cherche un colocataire pour un T3 que j'ai trouvé dans le centre de Nantes. L'appartement est très lumineux avec une grande terrasse.\n\nJe suis quelqu'un de calme en semaine mais j'aime profiter du week-end. Je cherche quelqu'un de sympa avec qui créer une vraie colocation, pas juste partager un toit.",
    location: "Nantes",
    price: 380,
    desiredSurface: 14,
    lifestyle: ["Non-fumeur", "Calme en semaine", "Écologique"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    user: { name: "Marc P.", initials: "M", isVerified: false },
  },
  "coloc-6": {
    id: "coloc-6",
    type: "chambre",
    title: "Chambre Meublée Centre-Ville",
    description: "Chambre meublée de 11 m² au cœur de Marseille, à deux pas de la Canebière. L'appartement T4 a été rénové récemment et dispose de tout le confort nécessaire.\n\nIdéal pour étudiant ou jeune actif. Ambiance familiale et respectueuse. Les colocataires actuels sont des étudiants en médecine.\n\nDisponible immédiatement.",
    location: "Marseille",
    address: "Rue de la République, 13001 Marseille",
    price: 390,
    surface: 11,
    charges: 40,
    deposit: 390,
    availableFrom: new Date(),
    photos: null,
    latitude: 43.2965,
    longitude: 5.3698,
    amenities: ["Meublé", "Internet", "Proche métro"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    user: { name: "Julie R.", initials: "J", isVerified: true },
  },
};

// Fallbacks uniques par type
const getFallbackImage = (type: string, id: string) => {
  const fallbacks: Record<string, string[]> = {
    chambre: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    ],
    recherche_coloc: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop",
    ],
  };

  const images = fallbacks[type] || fallbacks.chambre;
  const index = Math.abs(hashCode(id)) % images.length;
  return images[index];
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

interface ColocData {
  id: string;
  type: string;
  title: string;
  description: string | null;
  location: string;
  address: string | null;
  price: number;
  surface: number | null;
  photos: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  user: {
    id?: string;
    name?: string | null;
    email?: string;
    initials?: string;
    isVerified?: boolean;
  } | null;
  amenities?: string[];
  lifestyle?: string[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ColocPage({ params }: PageProps) {
  const { id } = await params;

  let coloc: ColocData | null = null;

  try {
    // Chercher dans la base de données d'abord
    const dbColoc = await db.colocListing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            tenantProfile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (dbColoc) {
      coloc = {
        id: dbColoc.id,
        type: dbColoc.type,
        title: dbColoc.title,
        description: dbColoc.description,
        location: dbColoc.location,
        address: dbColoc.address,
        price: dbColoc.price,
        surface: dbColoc.surface,
        photos: dbColoc.photos,
        latitude: dbColoc.latitude,
        longitude: dbColoc.longitude,
        createdAt: dbColoc.createdAt,
        user: {
          id: dbColoc.user.id,
          name: dbColoc.user.name,
          email: dbColoc.user.email,
          initials: dbColoc.user.name
            ? dbColoc.user.name.charAt(0).toUpperCase()
            : "?",
          isVerified: dbColoc.user.tenantProfile !== null,
        },
      };
    }
  } catch (error) {
    console.error("Erreur DB:", error);
  }

  // Si pas en BDD, utiliser les données de démo
  if (!coloc && demoColocations[id]) {
    coloc = demoColocations[id] as unknown as ColocData;
  }

  if (!coloc) {
    notFound();
    return null; // TypeScript needs this
  }

  // Maintenant TypeScript sait que coloc n'est pas null
  const isChambre = coloc.type === "chambre";
  const imageUrl = coloc.photos
    ? JSON.parse(coloc.photos)[0]
    : getFallbackImage(coloc.type, coloc.id);

  // Badge style
  const getBadgeStyle = () => {
    if (isChambre) {
      return { bg: "bg-orange-500", label: "🛏️ Chambre en colocation" };
    }
    return { bg: "bg-blue-500", label: "🔍 Recherche colocataire" };
  };
  const badge = getBadgeStyle();

  // Données utilisateur
  const userData = coloc.user;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-8 bg-gradient-to-br from-[#FFF7ED] via-white to-[#FAF5FF]">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            {/* Fil d'ariane */}
            <nav className="flex items-center gap-2 text-sm text-[#94A3B8] mb-4">
              <Link href="/" className="hover:text-[#560591]">Accueil</Link>
              <span>/</span>
              <Link href="/colocation" className="hover:text-[#560591]">Colocation</Link>
              <span>/</span>
              <span className="text-[#1E293B]">{isChambre ? coloc.title : (userData?.name || "Profil")}</span>
            </nav>

            {/* Badge */}
            <div className={`inline-block text-white text-sm font-semibold px-4 py-1 rounded-full mb-4 ${badge.bg}`}>
              {badge.label}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              {isChambre ? coloc.title : `${userData?.name || "Quelqu'un"} cherche un colocataire`}
            </h1>

            <p className="text-[#475569] text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-[#560591]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {coloc.location}
              {coloc.surface && ` • ${coloc.surface} m²`}
            </p>
          </div>
        </div>
      </section>

      {/* Image principale */}
      <section className="py-4">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-luxe-lg">
              {isChambre ? (
                <img
                  src={imageUrl}
                  alt={coloc.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#FAF5FF] to-[#EDE9FE] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#560591] to-[#7C3AED] flex items-center justify-center text-white text-5xl font-bold mb-4">
                      {userData?.initials || "?"}
                    </div>
                    <p className="text-[#1E293B] font-semibold text-lg">{userData?.name || "Anonyme"}</p>
                    {userData?.isVerified && (
                      <span className="inline-flex items-center gap-1 mt-2 bg-[#ECFDF5] text-[#10B981] text-sm font-medium px-3 py-1 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Profil vérifié
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Prix overlay */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg">
                <span className="text-[#560591] font-bold text-2xl">{coloc.price} €</span>
                <span className="text-[#475569] text-sm"> /mois</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-8">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-2xl shadow-luxe p-6">
                <h2 className="text-xl font-bold text-[#1E293B] mb-4">Description</h2>
                <p className="text-[#475569] leading-relaxed whitespace-pre-line">
                  {coloc.description || "Aucune description fournie."}
                </p>
              </div>

              {/* Caractéristiques */}
              {isChambre && (
                <div className="bg-white rounded-2xl shadow-luxe p-6">
                  <h2 className="text-xl font-bold text-[#1E293B] mb-4">Caractéristiques</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-[#560591]">{coloc.surface || "-"}</p>
                      <p className="text-sm text-[#94A3B8]">m²</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-[#560591]">{coloc.price}€</p>
                      <p className="text-sm text-[#94A3B8]">Loyer</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Équipements */}
              {isChambre && coloc.amenities && coloc.amenities.length > 0 && (
                <div className="bg-white rounded-2xl shadow-luxe p-6">
                  <h2 className="text-xl font-bold text-[#1E293B] mb-4">Équipements inclus</h2>
                  <div className="flex flex-wrap gap-2">
                    {coloc.amenities.map((amenity: string, index: number) => (
                      <span key={index} className="bg-[#EDE9FE] text-[#560591] px-3 py-1 rounded-full text-sm font-medium">
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Style de vie */}
              {!isChambre && coloc.lifestyle && coloc.lifestyle.length > 0 && (
                <div className="bg-white rounded-2xl shadow-luxe p-6">
                  <h2 className="text-xl font-bold text-[#1E293B] mb-4">Style de vie recherché</h2>
                  <div className="flex flex-wrap gap-2">
                    {coloc.lifestyle.map((item: string, index: number) => (
                      <span key={index} className="bg-[#ECFDF5] text-[#10B981] px-3 py-1 rounded-full text-sm font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Localisation avec carte */}
              <div className="bg-white rounded-2xl shadow-luxe p-6">
                <h2 className="text-xl font-bold text-[#1E293B] mb-4">Localisation</h2>

                {coloc.address && (
                  <p className="text-[#475569] flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-[#560591]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {coloc.address}
                  </p>
                )}

                {/* Carte OpenStreetMap */}
                <div className="w-full h-48 rounded-xl overflow-hidden border border-[#F1F5F9]">
                  {coloc.latitude && coloc.longitude ? (
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${coloc.longitude - 0.01}%2C${coloc.latitude - 0.005}%2C${coloc.longitude + 0.01}%2C${coloc.latitude + 0.005}&layer=mapnik&marker=${coloc.latitude}%2C${coloc.longitude}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FAF5FF] to-[#EDE9FE] flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">📍</span>
                        <p className="text-[#475569] text-sm">Localisation approximative</p>
                        <p className="text-[#94A3B8] text-xs">{coloc.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Carte détaillée avec info créateur */}
              <ColocDetailCard listing={coloc} />

              {/* CTA Contact */}
              <div className="bg-[#560591] rounded-2xl p-6 text-white sticky top-24">
                <h3 className="text-xl font-bold mb-2">
                  {isChambre ? "Intéressé par cette chambre ?" : "Contactez ce colocataire"}
                </h3>
                <p className="text-white/80 text-sm mb-4">
                  {isChambre
                    ? "Envoyez un message au colocataire actuel pour organiser une visite."
                    : "Envoyez une demande de contact pour discuter de la colocation."}
                </p>

                <ContactButton
                  targetName={isChambre ? coloc.title : (userData?.name || "ce colocataire")}
                  targetType="colocataire"
                  targetId={coloc.id}
                />
              </div>

              {/* Info */}
              <div className="bg-[#F8FAFC] rounded-2xl p-6 text-sm text-[#94A3B8]">
                <p>
                  Annonce publiée le {new Date(coloc.createdAt).toLocaleDateString("fr-FR", {
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
