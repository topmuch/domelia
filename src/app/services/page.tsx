// Page services - Domelia.fr (Design épuré)
import Link from "next/link";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";
import { ServiceListClient } from "./ServiceListClient";

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#FAFCFF]">
      <Navbar />

      {/* Hero */}
      <section className="py-12 bg-gradient-to-br from-[#F0F9FF] to-[#EFF6FF]">
        <div className="container-domelia">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              Services professionnels pour votre déménagement
            </h1>
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto mb-6">
              Des pros vérifiés pour vous accompagner dans toutes les étapes de votre installation : déménagement, assurance, ménage, bricolage et plus.
            </p>
            <Link
              href="/devenir-partenaire"
              className="inline-flex items-center gap-2 bg-[#560591] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#430477] transition-colors"
            >
              Déposer mon service
            </Link>
          </div>
        </div>
      </section>

      {/* Liste des services */}
      <ServiceListClient />

      {/* CTA Professionnels */}
      <section className="py-16 bg-gradient-to-br from-[#F0F9FF] to-[#EFF6FF]">
        <div className="container-domelia text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-4">
            Vous êtes un professionnel ?
          </h2>
          <p className="text-[#64748B] max-w-xl mx-auto mb-6">
            Inscrivez votre entreprise sur Domelia et proposez vos services à notre communauté de locataires.
          </p>
          <Link
            href="/devenir-partenaire"
            className="inline-flex items-center gap-2 bg-[#560591] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#430477] transition-colors"
          >
            Déposer mon service →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
