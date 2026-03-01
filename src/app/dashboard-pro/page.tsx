// Dashboard Professionnel - Domelia.fr
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";
import { ProDashboardClient } from "./ProDashboardClient";

export default async function DashboardProPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion?redirect=/dashboard-pro");
  }

  // Vérifier que l'utilisateur a un compte professionnel
  if (!user.professionalAccount) {
    // Si l'utilisateur n'a pas de compte pro, le rediriger vers l'inscription
    if (user.role !== "professionnel") {
      redirect("/devenir-partenaire");
    }
  }

  const proAccount = user.professionalAccount;
  const userId = user.id;
  const userName = user.name || user.email;

  // Récupérer les données du compte professionnel
  const [services, requests, payments] = await Promise.all([
    // Services publiés
    db.proService.findMany({
      where: { proId: proAccount?.id },
      orderBy: { createdAt: "desc" },
    }),
    // Demandes reçues (30 derniers jours)
    db.serviceRequest.findMany({
      where: {
        proId: proAccount?.id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    // Historique des paiements
    db.proSubscriptionPayment.findMany({
      where: { proId: proAccount?.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Calculer les statistiques
  const stats = {
    totalViews: proAccount?.totalViews || 0,
    totalRequests: proAccount?.totalRequests || 0,
    activeServices: services.filter((s) => s.isActive && s.isPaid).length,
    pendingRequests: requests.filter((r) => r.status === "nouveau").length,
    thisMonthViews: services.reduce((sum, s) => sum + s.views, 0),
  };

  // Formatter les données pour le client
  const servicesData = services.map((s) => ({
    id: s.id,
    category: s.category,
    title: s.title,
    description: s.description,
    price: s.price,
    priceType: s.priceType,
    photos: s.photos ? JSON.parse(s.photos) : [],
    zone: s.zone,
    isActive: s.isActive,
    isPaid: s.isPaid,
    views: s.views,
    createdAt: s.createdAt.toISOString(),
  }));

  const requestsData = requests.map((r) => ({
    id: r.id,
    requesterName: r.requesterName,
    requesterEmail: r.requesterEmail,
    requesterPhone: r.requesterPhone,
    message: r.message,
    status: r.status,
    proNotes: r.proNotes,
    serviceName: services.find((s) => s.id === r.serviceId)?.title || "Service",
    createdAt: r.createdAt.toISOString(),
  }));

  const paymentsData = payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    type: p.type,
    status: p.status,
    startDate: p.startDate.toISOString(),
    endDate: p.endDate?.toISOString() || null,
  }));

  const proData = {
    id: proAccount?.id || "",
    companyName: proAccount?.companyName || "",
    phone: proAccount?.phone || "",
    zone: proAccount?.zone || "",
    logo: proAccount?.logo || "",
    description: proAccount?.description || "",
    isVerified: proAccount?.isVerified || false,
    isApproved: proAccount?.isApproved || false,
    subscriptionType: proAccount?.subscriptionType || "none",
    subscriptionEnd: proAccount?.subscriptionEnd?.toISOString() || null,
    partnerBadge: proAccount?.partnerBadge || false,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ECFDF5] via-white to-[#D1FAE5]">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container-domelia">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-[#10B981] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {proAccount?.companyName?.charAt(0).toUpperCase() || "P"}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B]">
                    {proAccount?.companyName || "Mon Dashboard Pro"}
                  </h1>
                  <div className="flex items-center gap-2 text-sm">
                    {proAccount?.isVerified ? (
                      <span className="text-[#10B981] flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        SIRET vérifié
                      </span>
                    ) : (
                      <span className="text-[#F59E0B] flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        En attente de vérification
                      </span>
                    )}
                    {proAccount?.partnerBadge && (
                      <span className="bg-[#560591] text-white text-xs px-2 py-0.5 rounded-full ml-2">
                        ⭐ Partenaire officiel
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-2xl">
                    👁️
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1E293B]">{stats.totalViews}</p>
                    <p className="text-sm text-[#475569]">Vues totales</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#560591]/10 flex items-center justify-center text-2xl">
                    📩
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1E293B]">{stats.totalRequests}</p>
                    <p className="text-sm text-[#475569]">Demandes reçues</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center text-2xl">
                    📋
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1E293B]">{stats.activeServices}</p>
                    <p className="text-sm text-[#475569]">Services actifs</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl">
                    🔔
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1E293B]">{stats.pendingRequests}</p>
                    <p className="text-sm text-[#475569]">Nouvelles demandes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Component */}
            <ProDashboardClient
              proData={proData}
              services={servicesData}
              requests={requestsData}
              payments={paymentsData}
              stats={stats}
              userEmail={user.email}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
