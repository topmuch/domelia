// Page services - Domelia.fr
import Link from "next/link";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";
import { ServiceListClient } from "./ServiceListClient";

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-8 bg-gradient-to-br from-[#ECFDF5] via-white to-[#D1FAE5]">
        <div className="container-domelia">
          <div className="max-w-5xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-[#94A3B8] mb-4">
              <Link href="/" className="hover:text-[#560591]">Accueil</Link>
              <span>/</span>
              <span className="text-[#10B981] font-medium">Services</span>
            </nav>

            <div className="inline-block bg-[#ECFDF5] text-[#10B981] font-semibold px-4 py-2 rounded-full text-sm mb-4">
              📦 Simplifiez votre installation
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              Services professionnels pour votre déménagement
            </h1>
            <p className="text-[#475569] text-lg max-w-2xl">
              Des professionnels vérifiés pour vous accompagner dans toutes les étapes de votre installation : déménagement, assurance, ménage, bricolage et plus.
            </p>
          </div>
        </div>
      </section>

      {/* Liste des services */}
      <section className="py-8">
        <div className="container-domelia">
          <div className="max-w-6xl mx-auto">
            <ServiceListClient />
          </div>
        </div>
      </section>

      {/* CTA Propriétaires */}
      <section className="py-12 bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5]">
        <div className="container-domelia text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-4">
            Vous êtes un professionnel ?
          </h2>
          <p className="text-[#475569] max-w-xl mx-auto mb-6">
            Inscrivez votre entreprise sur Domelia et proposez vos services à notre communauté de locataires.
          </p>
          <Link
            href="/deposer-service"
            className="inline-flex items-center gap-2 bg-[#10B981] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#059669] transition-colors"
          >
            Déposer mon service
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
