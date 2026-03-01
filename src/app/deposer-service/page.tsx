// Page dépôt annonce service - Domelia.fr
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";
import { ServiceForm } from "@/components/domelia/ServiceForm";
import { db } from "@/lib/db";

export default async function DeposerServicePage() {
  // Vérifier l'authentification
  const cookieStore = await cookies();
  const userId = cookieStore.get("domelia_user_id")?.value;

  if (!userId) {
    redirect("/connexion?redirect=/deposer-service");
  }

  // Récupérer l'utilisateur
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/connexion?redirect=/deposer-service");
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-8 bg-gradient-to-br from-[#ECFDF5] via-white to-[#D1FAE5]">
        <div className="container-domelia">
          <div className="max-w-3xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-[#94A3B8] mb-4">
              <Link href="/" className="hover:text-[#10B981]">Accueil</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-[#10B981]">Services</Link>
              <span>/</span>
              <span className="text-[#1E293B]">Déposer un service</span>
            </nav>

            <div className="inline-block bg-[#ECFDF5] text-[#10B981] font-semibold px-4 py-2 rounded-full text-sm mb-4">
              📋 Nouveau service
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              Déposer votre service
            </h1>
            <p className="text-[#475569] text-lg">
              Proposez vos services professionnels à notre communauté de locataires.
            </p>
          </div>
        </div>
      </section>

      {/* Formulaire */}
      <section className="py-8 pb-16">
        <div className="container-domelia">
          <div className="max-w-3xl mx-auto">
            {/* Info utilisateur */}
            <div className="bg-[#F8FAFC] rounded-xl p-4 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-white font-semibold">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-medium text-[#1E293B]">{user.name || "Utilisateur"}</p>
                <p className="text-sm text-[#94A3B8]">{user.email}</p>
              </div>
            </div>

            {/* Formulaire multi-étapes */}
            <ServiceForm />

            {/* Info légale */}
            <div className="mt-6 p-4 bg-[#FFF7ED] rounded-xl text-sm text-[#92400E]">
              <p className="font-medium mb-1">💡 Bon à savoir</p>
              <p>
                Votre annonce sera soumise à vérification avant d&apos;être publiée. 
                Le délai de traitement est généralement de 24 à 48h.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
