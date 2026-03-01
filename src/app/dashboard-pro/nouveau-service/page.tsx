// Page de création de service professionnel - Domelia.fr
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";
import { NewServiceForm } from "./NewServiceForm";

export default async function NewServicePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion?redirect=/dashboard-pro/nouveau-service");
  }

  if (user.role !== "professionnel") {
    redirect("/devenir-partenaire");
  }

  const proAccount = await db.professionalAccount.findUnique({
    where: { userId: user.id },
  });

  if (!proAccount) {
    redirect("/devenir-partenaire");
  }

  if (!proAccount.isApproved) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#ECFDF5] via-white to-[#D1FAE5]">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container-domelia">
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">⏳</span>
              </div>
              <h1 className="text-2xl font-bold text-[#1E293B] mb-4">
                Compte en attente d'approbation
              </h1>
              <p className="text-[#475569] mb-6">
                Votre compte professionnel est en cours de vérification. Vous pourrez publier des services dès que votre compte sera approuvé.
              </p>
              <a
                href="/dashboard-pro"
                className="inline-block px-6 py-3 bg-[#10B981] text-white rounded-xl font-medium hover:bg-[#059669] transition-colors"
              >
                Retour au dashboard
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Vérifier si l'utilisateur a un abonnement actif
  const hasActiveSubscription = proAccount.subscriptionType === "monthly" &&
    (!proAccount.subscriptionEnd || new Date(proAccount.subscriptionEnd) > new Date());

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ECFDF5] via-white to-[#D1FAE5]">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container-domelia">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <a
                href="/dashboard-pro"
                className="inline-flex items-center gap-2 text-[#10B981] hover:underline mb-4"
              >
                ← Retour au dashboard
              </a>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B]">
                Publier un nouveau service
              </h1>
              <p className="text-[#475569] mt-2">
                Décrivez votre service pour attirer de nouveaux clients sur Domelia.
              </p>
            </div>

            {/* Info abonnement */}
            {hasActiveSubscription ? (
              <div className="mb-6 p-4 bg-[#ECFDF5] rounded-xl border border-[#10B981]/30">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="font-semibold text-[#10B981]">Abonnement mensuel actif</p>
                    <p className="text-sm text-[#475569]">
                      Vous pouvez publier autant de services que vous souhaitez, sans frais supplémentaire.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-[#FEF3C7] rounded-xl border border-[#F59E0B]/30">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="font-semibold text-[#D97706]">Publication payante</p>
                    <p className="text-sm text-[#475569]">
                      Ce service sera soumis à un paiement de <strong>5€</strong> après création.
                      Ou optez pour l'abonnement mensuel à <strong>15€/mois</strong> pour des services illimités.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Formulaire */}
            <NewServiceForm
              proId={proAccount.id}
              hasActiveSubscription={hasActiveSubscription}
              defaultZone={proAccount.zone}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
