// Page détail prestataire - Domelia.fr
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";
import { ServiceDetailCard } from "@/components/domelia/ServiceDetailCard";
import { ServiceReviews } from "@/components/domelia/ServiceReviews";

// Données de démo pour le fallback
const demoServices: Record<string, any> = {
  "service-1": {
    id: "service-1",
    company: "Déménagement Express",
    category: "demenagement",
    title: "Déménagement professionnel",
    description: `Déménagement complet partout en France. Service clé en main avec emballage inclus.

Notre équipe expérimentée prend en charge tous vos biens avec le plus grand soin. Nous proposons des formules adaptées à tous les budgets et toutes les distances.

Nos services inclus :
- Emballage et protection de vos biens
- Chargement et déchargement
- Démontage et remontage des meubles
- Assurance tous risques`,
    price: 350,
    zone: "France entière",
    siret: "123 456 789 00012",
    isVerified: true,
    views: 1234,
    createdAt: new Date("2023-01-15"),
    reviews: [
      { id: "r1", rating: 5, comment: "Excellent service, très professionnel !", createdAt: new Date("2024-01-10"), userId: "u1" },
      { id: "r2", rating: 4, comment: "Bien, mais un peu de retard sur le rendez-vous.", createdAt: new Date("2024-01-05"), userId: "u2" },
    ],
  },
  "service-2": {
    id: "service-2",
    company: "StockPro",
    category: "stockage",
    title: "Garde-meubles sécurisé",
    description: `Stockage de meubles et affaires personnelles en box sécurisé 24/7. 

Accès libre à votre box, surveillance vidéo, assurance incluse. Différentes tailles de box disponibles selon vos besoins.

- Box de 3m² à 20m²
- Accès 24h/24, 7j/7
- Surveillance vidéo
- Assurance incluse`,
    price: 49,
    zone: "Grandes villes",
    siret: "234 567 890 00023",
    isVerified: true,
    views: 856,
    createdAt: new Date("2023-03-20"),
    reviews: [
      { id: "r3", rating: 5, comment: "Box propre et sécurisé. Je recommande !", createdAt: new Date("2024-02-15"), userId: "u3" },
    ],
  },
  "service-3": {
    id: "service-3",
    company: "AssurHabitat",
    category: "assurance",
    title: "Assurance habitation",
    description: `Assurance locataire adaptée à vos besoins. Couverture complète à prix compétitif. 

Souscription 100% en ligne en quelques minutes. Nous couvrons les dégâts des eaux, incendies, vols et responsabilités civiles.

Nos garanties :
- Dégâts des eaux
- Incendie et explosion
- Vol et vandalisme
- Responsabilité civile
- Recours des voisins`,
    price: 12,
    zone: "France",
    siret: "345 678 901 00034",
    isVerified: true,
    views: 2341,
    createdAt: new Date("2023-02-10"),
    reviews: [
      { id: "r4", rating: 4, comment: "Bonne assurance, souscription rapide.", createdAt: new Date("2024-01-20"), userId: "u4" },
      { id: "r5", rating: 5, comment: "Prix très compétitif et excellent service client.", createdAt: new Date("2024-02-01"), userId: "u5" },
    ],
  },
  "service-4": {
    id: "service-4",
    company: "HandyServices",
    category: "bricolage",
    title: "Petits travaux & Bricolage",
    description: `Installation, montage de meubles, petites réparations. Intervention rapide.

Nos prestations :
- Montage de meubles (IKEA, Conforama, etc.)
- Installation de luminaires
- Pose de tringles à rideaux
- Petites réparations
- Peinture et retouches`,
    price: 35,
    zone: "Île-de-France",
    siret: "456 789 012 00045",
    isVerified: true,
    views: 567,
    createdAt: new Date("2023-06-05"),
    reviews: [],
  },
  "service-5": {
    id: "service-5",
    company: "HomeClean Pro",
    category: "menage",
    title: "Nettoyage professionnel",
    description: `Ménage régulier ou ponctuel. État des lieux de sortie inclus.

Nos services de nettoyage :
- Ménage régulier
- Grand ménage de printemps
- État des lieux de sortie
- Nettoyage après travaux
- Repassage`,
    price: 25,
    zone: "Grandes villes",
    siret: "567 890 123 00056",
    isVerified: true,
    views: 1892,
    createdAt: new Date("2023-04-15"),
    reviews: [
      { id: "r6", rating: 5, comment: "Mon appartement est impeccable ! Merci !", createdAt: new Date("2024-02-10"), userId: "u6" },
    ],
  },
  "service-6": {
    id: "service-6",
    company: "Mobeel",
    category: "demenagement",
    title: "Location utilitaire",
    description: `Location de camions et utilitaires pour déménagement auto.

Véhicules disponibles :
- Utilitaires 3m³
- Camions 10m³
- Camions 20m³
- Fourgons avec hayon

Inclus : kilométrage illimité, assurance, assistance 24h/24`,
    price: 59,
    zone: "France",
    siret: "678 901 234 00067",
    isVerified: true,
    views: 723,
    createdAt: new Date("2023-07-20"),
    reviews: [],
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PrestatairePage({ params }: PageProps) {
  const { id } = await params;

  let service = null;
  let reviews: any[] = [];
  let avgRating: number | null = null;

  try {
    // Essayer de récupérer depuis la BDD
    const dbService = await db.serviceAd.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviews: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (dbService) {
      service = dbService;
      reviews = dbService.reviews;

      // Incrémenter les vues
      await db.serviceAd.update({
        where: { id },
        data: { views: { increment: 1 } },
      });

      // Calculer la note moyenne
      if (reviews.length > 0) {
        avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      }
    }
  } catch (error) {
    console.error("Erreur BDD:", error);
  }

  // Fallback vers les données de démo
  if (!service && demoServices[id]) {
    service = demoServices[id];
    reviews = service.reviews || [];
    if (reviews.length > 0) {
      avgRating = reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length;
    }
  }

  if (!service) {
    notFound();
  }

  // Adapter les données pour les composants
  const serviceData = {
    id: service.id,
    company: service.company,
    siret: service.siret,
    category: service.category,
    title: service.title,
    description: service.description,
    price: service.price,
    zone: service.zone,
    photo: service.photo,
    isVerified: service.isVerified,
    views: service.views,
    avgRating,
    reviewCount: reviews.length,
    createdAt: service.createdAt,
    user: service.user,
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-8 bg-gradient-to-br from-[#ECFDF5] via-white to-[#D1FAE5]">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            {/* Fil d'ariane */}
            <nav className="flex items-center gap-2 text-sm text-[#94A3B8] mb-6">
              <Link href="/" className="hover:text-[#10B981]">Accueil</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-[#10B981]">Services</Link>
              <span>/</span>
              <span className="text-[#1E293B]">{service.company || "Professionnel"}</span>
            </nav>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-8">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              <ServiceDetailCard service={serviceData} />
              <ServiceReviews
                serviceId={service.id}
                avgRating={avgRating}
                reviewCount={reviews.length}
                reviews={reviews.map((r: any) => ({
                  id: r.id,
                  rating: r.rating,
                  comment: r.comment,
                  createdAt: r.createdAt,
                  userId: r.userId,
                }))}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Ce bloc est déjà inclus dans ServiceDetailCard mais on peut ajouter d'autres infos ici */}
                <div className="bg-[#F8FAFC] rounded-2xl p-6 text-sm text-[#475569]">
                  <h3 className="font-semibold text-[#1E293B] mb-3">Besoin d&apos;aide ?</h3>
                  <p className="mb-4">
                    Notre équipe est disponible pour répondre à vos questions.
                  </p>
                  <Link
                    href="/contact"
                    className="text-[#10B981] font-medium hover:underline"
                  >
                    Contacter le support →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
