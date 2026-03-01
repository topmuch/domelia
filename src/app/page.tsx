// Landing Page Domelia.fr - Module 1 Wahoo Luxe + Sections Logements/Colocation/Services
import { db } from "@/lib/db";
import { Navbar } from "@/components/domelia/Navbar";
import { HeroSection } from "@/components/domelia/HeroSection";
import { TenantCard } from "@/components/domelia/TenantCard";
import { ListingCard } from "@/components/domelia/ListingCard";
import { ColocationCard } from "@/components/domelia/ColocationCard";
import { ProServiceCard } from "@/components/domelia/ProServiceCard";
import { Footer } from "@/components/domelia/Footer";
import Link from "next/link";

// ============================================
// DONNÉES DE DÉMO
// ============================================

const demoProfiles = [
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
    description: "Je recherche un appartement lumineux près du centre-ville.",
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
    description: "Actif dans la tech, je cherche un logement calme.",
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
    description: "Étudiante en médecine, je cherche un studio bien situé.",
  },
];

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
    photos: JSON.stringify(["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"]),
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
    photos: JSON.stringify(["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop"]),
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
    photos: JSON.stringify(["https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&h=300&fit=crop"]),
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
    photos: JSON.stringify(["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"]),
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
    photos: JSON.stringify(["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"]),
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
    photos: JSON.stringify(["https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&h=300&fit=crop"]),
  },
];

const demoColocations = [
  {
    id: "coloc-1",
    type: "chambre" as const,
    title: "Chambre dans T4 Spacieux",
    city: "Paris 18e",
    budget: 550,
    surface: 14,
    photos: JSON.stringify(["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"]),
    latitude: 48.8935,
    longitude: 2.3467,
  },
  {
    id: "coloc-2",
    type: "recherche_coloc" as const,
    firstName: "Léa",
    city: "Lyon",
    budget: 450,
    description: "Cherche colocataire calme et respectueux",
    photos: null,
  },
  {
    id: "coloc-3",
    type: "chambre" as const,
    title: "Chambre Lumineuse Colocation",
    city: "Bordeaux",
    budget: 480,
    surface: 12,
    photos: JSON.stringify(["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"]),
    latitude: 44.8507,
    longitude: -0.5708,
  },
];

const demoServices = [
  {
    id: "service-1",
    companyName: "Déménagement Express",
    category: "demenagement",
    title: "Déménagement professionnel",
    description: "Déménagement complet partout en France. Service clé en main avec emballage inclus.",
    price: 350,
    zone: "France entière",
    siretVerified: true,
    rating: 4.8,
    available247: false,
  },
  {
    id: "service-2",
    companyName: "StockPro",
    category: "stockage",
    title: "Garde-meubles sécurisé",
    description: "Stockage de meubles et affaires personnelles en box sécurisé 24/7.",
    price: 49,
    zone: "Grandes villes",
    siretVerified: true,
    rating: 4.9,
    available247: true,
  },
  {
    id: "service-3",
    companyName: "AssurHabitat",
    category: "assurance",
    title: "Assurance habitation",
    description: "Assurance locataire adaptée à vos besoins. Couverture complète à prix compétitif.",
    price: 12,
    zone: "France",
    siretVerified: true,
    rating: 4.7,
    available247: false,
  },
  {
    id: "service-4",
    companyName: "HandyServices",
    category: "bricolage",
    title: "Petits travaux & Bricolage",
    description: "Installation, montage de meubles, petites réparations. Intervention rapide.",
    price: 35,
    zone: "Île-de-France",
    siretVerified: true,
    rating: 4.6,
    available247: false,
  },
  {
    id: "service-5",
    companyName: "HomeClean Pro",
    category: "menage",
    title: "Nettoyage professionnel",
    description: "Ménage régulier ou ponctuel. État des lieux de sortie inclus.",
    price: 25,
    zone: "Grandes métropoles",
    siretVerified: true,
    rating: 4.8,
    available247: false,
  },
  {
    id: "service-6",
    companyName: "Mobeel",
    category: "demenagement",
    title: "Location utilitaire",
    description: "Location de camions et utilitaires pour déménagement auto.",
    price: 59,
    zone: "France",
    siretVerified: true,
    rating: 4.5,
    available247: true,
  },
];

// ============================================
// SECTIONS
// ============================================

// Section Locataires
async function TenantSection() {
  let profiles;
  
  try {
    profiles = await db.tenantProfile.findMany({
      where: { 
        isActive: true,
        user: { isActive: true } // Vérifier que l'utilisateur est actif
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    });
    
    if (profiles.length === 0) {
      profiles = demoProfiles;
    }
  } catch (error) {
    profiles = demoProfiles;
  }

  return (
    <section id="locataires" className="py-16 md:py-24 bg-gradient-to-b from-white to-[#FAF5FF]/30">
      <div className="container-domelia">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
            Qui cherche un logement ?
          </h2>
          <p className="text-[#475569] text-lg max-w-2xl mx-auto">
            Découvrez les profils des locataires actifs. Vous avez un bien ? Contactez-les directement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile, index) => (
            <TenantCard key={profile.id} profile={profile} delay={index * 100} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/profils-locataires"
            className="inline-flex items-center gap-2 text-[#560591] font-semibold hover:text-[#3D0466] transition-colors"
          >
            Voir tous les profils
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Section Logements
async function ListingSection() {
  let listings;
  
  try {
    listings = await db.landlordListing.findMany({
      where: { 
        isActive: true,
        user: { isActive: true } // Vérifier que l'utilisateur est actif
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });
    
    if (listings.length === 0) {
      listings = demoListings;
    }
  } catch (error) {
    listings = demoListings;
  }

  return (
    <section id="logements" className="py-16 md:py-24 bg-white">
      <div className="container-domelia">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#EDE9FE] text-[#560591] font-semibold px-4 py-2 rounded-full text-sm mb-4">
            Des biens vérifiés par nos équipes
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
            Logements, parkings & colocations disponibles
          </h2>
          <p className="text-[#475569] text-lg max-w-2xl mx-auto">
            Parcourez les annonces déposées par nos propriétaires partenaires.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, index) => (
            <ListingCard key={listing.id} listing={listing} delay={index * 100} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/annonces"
            className="inline-flex items-center gap-2 text-[#560591] font-semibold hover:text-[#3D0466] transition-colors"
          >
            Voir toutes les annonces
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Section Colocation
async function ColocationSection() {
  let colocations;
  
  try {
    const dbColocs = await db.colocListing.findMany({
      where: { 
        isActive: true,
        user: { isActive: true } // Vérifier que l'utilisateur est actif
      },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true },
        },
      },
    });
    
    if (dbColocs.length === 0) {
      colocations = demoColocations;
    } else {
      // Mapper les données de la BDD au format attendu par le composant
      colocations = dbColocs.map(c => ({
        id: c.id,
        type: c.type as "chambre" | "recherche_coloc",
        title: c.title,
        city: c.location,
        budget: c.price,
        surface: c.surface || undefined,
        photos: c.photos,
        firstName: c.user?.name?.split(' ')[0] || undefined,
        latitude: c.latitude,
        longitude: c.longitude,
        createdAt: c.createdAt,
      }));
    }
  } catch (error) {
    colocations = demoColocations;
  }

  return (
    <section id="colocation" className="py-16 md:py-24 bg-[#FAF5FF]/50">
      <div className="container-domelia">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#FFF7ED] text-[#F59E0B] font-semibold px-4 py-2 rounded-full text-sm mb-4">
            🛏️ Économisez sur votre loyer
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
            Colocations & sous-locations
          </h2>
          <p className="text-[#475569] text-lg max-w-2xl mx-auto">
            Trouvez une chambre ou un colocataire idéal. Des offres vérifiées pour une colocation sereine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colocations.map((listing, index) => (
            <ColocationCard key={listing.id} listing={listing} delay={index * 100} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/colocation"
            className="inline-flex items-center gap-2 text-[#560591] font-semibold hover:text-[#3D0466] transition-colors"
          >
            Voir toutes les colocations
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Section Services Professionnels
async function ServiceSection() {
  let services: {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    priceType: string;
    photos: string[];
    zone: string | null;
    category: string;
    views: number;
    pro: {
      id: string;
      companyName: string;
      logo: string | null;
      zone: string;
      isVerified: boolean;
      partnerBadge: boolean;
    };
  }[] = [];
  
  try {
    // D'abord essayer les services professionnels
    const proServices = await db.proService.findMany({
      where: { 
        isActive: true,
        isPaid: true,
        pro: { 
          isApproved: true,
          isVerified: true,
        },
      },
      take: 6,
      orderBy: [
        { pro: { partnerBadge: "desc" } },
        { views: "desc" },
      ],
      include: {
        pro: {
          select: {
            id: true,
            companyName: true,
            logo: true,
            zone: true,
            isVerified: true,
            partnerBadge: true,
          },
        },
      },
    });
    
    if (proServices.length > 0) {
      services = proServices.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        price: s.price,
        priceType: s.priceType,
        photos: s.photos ? JSON.parse(s.photos) : [],
        zone: s.zone,
        category: s.category,
        views: s.views,
        pro: {
          id: s.pro.id,
          companyName: s.pro.companyName,
          logo: s.pro.logo,
          zone: s.pro.zone,
          isVerified: s.pro.isVerified,
          partnerBadge: s.pro.partnerBadge,
        },
      }));
    } else {
      // Fallback vers les anciens services (ServiceAd)
      const dbServices = await db.serviceAd.findMany({ 
        where: { isActive: true, isVerified: true },
        take: 6,
        orderBy: { createdAt: "desc" },
      });
      
      services = dbServices.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        price: s.price,
        priceType: "fixed",
        photos: s.photo ? [s.photo] : [],
        zone: s.zone,
        category: s.category,
        views: s.views,
        pro: {
          id: s.proId,
          companyName: s.company || "Professionnel",
          logo: null,
          zone: s.zone || "France",
          isVerified: s.isVerified,
          partnerBadge: false,
        },
      }));
    }
    
    if (services.length === 0) {
      // Utiliser les données de démo
      services = demoServices.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        price: s.price,
        priceType: "from",
        photos: [],
        zone: s.zone,
        category: s.category,
        views: 0,
        pro: {
          id: "demo-pro",
          companyName: s.companyName,
          logo: null,
          zone: s.zone,
          isVerified: s.siretVerified,
          partnerBadge: false,
        },
      }));
    }
  } catch (error) {
    console.error("Erreur chargement services:", error);
    services = demoServices.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      price: s.price,
      priceType: "from",
      photos: [],
      zone: s.zone,
      category: s.category,
      views: 0,
      pro: {
        id: "demo-pro",
        companyName: s.companyName,
        logo: null,
        zone: s.zone,
        isVerified: s.siretVerified,
        partnerBadge: false,
      },
    }));
  }

  return (
    <section id="services" className="py-16 md:py-24 bg-gradient-to-b from-[#ECFDF5]/30 to-white">
      <div className="container-domelia">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#ECFDF5] text-[#10B981] font-semibold px-4 py-2 rounded-full text-sm mb-4">
            📦 Simplifiez votre déménagement
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
            Services pratiques pour votre installation
          </h2>
          <p className="text-[#475569] text-lg max-w-2xl mx-auto">
            Des professionnels vérifiés pour vous accompagner : déménagement, garde-meubles, assurance...
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ProServiceCard key={service.id} service={service} />
          ))}
        </div>

        <div className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-[#10B981] font-semibold hover:text-[#059669] transition-colors"
          >
            Voir tous les services
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <span className="text-[#94A3B8]">ou</span>
          <Link
            href="/devenir-partenaire"
            className="inline-flex items-center gap-2 bg-[#10B981] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#059669] transition-colors"
          >
            🤝 Devenir partenaire
          </Link>
        </div>
      </div>
    </section>
  );
}

// Section Comment ça marche
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Publiez votre profil",
      description: "Créez votre profil locataire en quelques minutes. Décrivez votre recherche idéale : ville, budget, type de logement.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Les propriétaires vous trouvent",
      description: "Votre profil est visible par tous les propriétaires. Ceux qui ont un bien correspondant vous contactent directement.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Choisissez votre logement",
      description: "Comparez les offres reçues, visitez les biens et choisissez le logement qui vous correspond parfaitement.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-domelia">
        <div className="text-center mb-16">
          <span className="inline-block bg-[#FAF5FF] text-[#560591] font-semibold px-4 py-2 rounded-full text-sm mb-4">
            Simple et efficace
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-[#475569] text-lg max-w-2xl mx-auto">
            Fini les recherches interminables. Sur Domelia, vous publiez et les propriétaires vous contactent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#560591]/30 to-[#7C3AED]/30" />
              )}
              
              <div className="relative bg-white rounded-2xl p-8 shadow-luxe hover-lift text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#560591] text-white font-bold text-sm px-4 py-1 rounded-full">
                  {step.number}
                </div>
                
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#FAF5FF] to-[#EDE9FE] flex items-center justify-center text-[#560591]">
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-bold text-[#1E293B] mb-3">{step.title}</h3>
                <p className="text-[#475569]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section CTA finale
function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-[#560591]">
      <div className="container-domelia text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Prêt à trouver votre logement ?
        </h2>
        <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
          Rejoignez les centaines de locataires qui ont trouvé leur logement grâce à Domelia.
        </p>
        <Link
          href="/je-cherche"
          className="inline-flex items-center gap-2 bg-white text-[#560591] font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          Créer mon profil gratuit
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

// ============================================
// PAGE PRINCIPALE
// ============================================

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      
      {/* Section 1: Locataires */}
      <TenantSection />
      
      {/* Section 2: Logements */}
      <ListingSection />
      
      {/* Section 3: Colocation */}
      <ColocationSection />
      
      {/* Section 4: Services */}
      <ServiceSection />
      
      {/* Section 5: Comment ça marche */}
      <HowItWorksSection />
      
      {/* Section 6: CTA */}
      <CTASection />
      
      <Footer />
    </main>
  );
}
