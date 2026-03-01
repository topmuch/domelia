// Page d'inscription professionnelle - Domelia.fr
import Link from "next/link";
import { ProfessionalRegisterForm } from "@/components/domelia/ProfessionalRegisterForm";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";

export default function DevenirPartenairePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ECFDF5] via-white to-[#D1FAE5]">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-8">
        <div className="container-domelia">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-[#ECFDF5] text-[#10B981] font-semibold px-4 py-2 rounded-full text-sm mb-4">
              🤝 Devenez partenaire
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              Rejoignez le réseau Domelia Pro
            </h1>
            <p className="text-[#475569] text-lg mb-6">
              Déménageurs, garde-meubles, assureurs... développez votre activité en atteignant 
              des milliers de locataires en recherche de logement.
            </p>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="pb-8">
        <div className="container-domelia">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
                <div className="w-12 h-12 bg-[#10B981]/10 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">👁️</span>
                </div>
                <h3 className="font-semibold text-[#1E293B] mb-2">Visibilité maximale</h3>
                <p className="text-sm text-[#475569]">
                  Apparaissez sur la landing page et dans les recherches de milliers d'utilisateurs.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
                <div className="w-12 h-12 bg-[#560591]/10 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="font-semibold text-[#1E293B] mb-2">Compte vérifié</h3>
                <p className="text-sm text-[#475569]">
                  Badge "SIRET vérifié" pour rassurer vos clients potentiels.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
                <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold text-[#1E293B] mb-2">Tarifs transparents</h3>
                <p className="text-sm text-[#475569]">
                  5€/annonce ou 15€/mois illimité avec badge "Partenaire officiel".
                </p>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm mb-8">
              <h2 className="text-xl font-bold text-[#1E293B] mb-6 text-center">Nos offres</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-[#E2E8F0] rounded-xl p-6">
                  <h3 className="font-semibold text-[#1E293B] mb-2">À l'annonce</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-[#560591]">5 €</span>
                    <span className="text-[#475569]">/ service publié</span>
                  </div>
                  <ul className="space-y-2 text-sm text-[#475569]">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      1 service publié
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Visible 30 jours
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Demandes illimitées
                    </li>
                  </ul>
                  <p className="text-xs text-[#94A3B8] mt-4">Idéal pour tester la plateforme</p>
                </div>
                
                <div className="border-2 border-[#560591] rounded-xl p-6 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#560591] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Recommandé
                  </div>
                  <h3 className="font-semibold text-[#1E293B] mb-2">Abonnement mensuel</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-[#560591]">15 €</span>
                    <span className="text-[#475569]">/ mois</span>
                  </div>
                  <ul className="space-y-2 text-sm text-[#475569]">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Services illimités
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Badge "Partenaire officiel"
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mise en avant prioritaire
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Statistiques avancées
                    </li>
                  </ul>
                  <p className="text-xs text-[#94A3B8] mt-4">Pour les professionnels actifs</p>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#E2E8F0]">
              <h2 className="text-xl font-bold text-[#1E293B] mb-6 text-center">
                Créer mon compte professionnel
              </h2>
              
              <ProfessionalRegisterForm />
              
              <p className="text-center text-sm text-[#94A3B8] mt-6">
                Déjà inscrit ?{" "}
                <Link href="/connexion" className="text-[#560591] hover:underline">
                  Connectez-vous
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
