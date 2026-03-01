// Page de succès de paiement - Domelia.fr
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ paymentId?: string }>;
}

export default async function PaiementSuccesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const { paymentId } = await searchParams;

  if (!user) {
    redirect("/connexion");
  }

  let payment: { id: string; targetId: string; amount: number; status: string } | null = null;
  let tenantProfile: { id: string; firstName: string; lastName: string | null; city: string } | null = null;

  if (paymentId) {
    payment = await db.payment.findUnique({
      where: { id: paymentId },
    });

    if (payment && payment.targetId) {
      tenantProfile = await db.tenantProfile.findUnique({
        where: { id: payment.targetId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          city: true,
        },
      });
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container-domelia">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-[#F1F5F9]">
              {/* Icône de succès */}
              <div className="w-20 h-20 mx-auto mb-6 bg-[#ECFDF5] rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-[#1E293B] mb-2">
                Paiement réussi !
              </h1>

              <p className="text-[#475569] mb-6">
                Votre paiement de <span className="font-semibold">2,00 €</span> a été traité avec succès.
              </p>

              {tenantProfile && (
                <div className="bg-[#FAF5FF] rounded-xl p-4 mb-6">
                  <p className="text-sm text-[#475569] mb-2">Contact déverrouillé :</p>
                  <p className="font-semibold text-[#1E293B]">
                    {tenantProfile.firstName} {tenantProfile.lastName}
                  </p>
                  <p className="text-sm text-[#475569]">
                    📍 {tenantProfile.city}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {tenantProfile && (
                  <Link
                    href={`/messagerie?contact=${tenantProfile.id}`}
                    className="block w-full bg-[#560591] text-white font-semibold py-3 rounded-xl hover:bg-[#3D0466] transition-colors"
                  >
                    💬 Envoyer un message
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  className="block w-full bg-[#F1F5F9] text-[#475569] font-medium py-3 rounded-xl hover:bg-[#E2E8F0] transition-colors"
                >
                  Retour au dashboard
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-[#F1F5F9]">
                <p className="text-xs text-[#94A3B8]">
                  Un email de confirmation vous a été envoyé.
                  <br />
                  En cas de problème, contactez-nous à{" "}
                  <a href="mailto:support@domelia.fr" className="text-[#560591]">
                    support@domelia.fr
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
