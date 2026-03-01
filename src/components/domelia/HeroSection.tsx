// Section Hero - Design Wahoo Luxe
"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay violet profond pour lisibilité - CORRECTION #2 */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(86, 5, 145, 0.2) 0%, rgba(86, 5, 145, 0.5) 100%)"
          }}
        />
        {/* Overlay blanc léger pour le texte - dark mode */}
        <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/60" />
      </div>

      {/* Contenu */}
      <div className="container-domelia relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-luxe dark:shadow-slate-900/50 opacity-0 animate-fade-slide-up">
            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">
              Nouveau concept de location
            </span>
          </div>

          {/* Titre principal */}
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight opacity-0 animate-fade-slide-up delay-100 drop-shadow-lg" style={{ animationFillMode: "forwards" }}>
            Sur Domelia, le logement
            <br />
            <span className="text-white">vient à vous.</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-white/90 dark:text-slate-200 text-lg sm:text-xl md:text-2xl mb-10 max-w-2xl mx-auto opacity-0 animate-fade-slide-up delay-200 drop-shadow" style={{ animationFillMode: "forwards" }}>
            Publiez votre recherche. Les bons logements vous contactent.
          </p>

          {/* CTA principal */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-slide-up delay-300" style={{ animationFillMode: "forwards" }}>
            <Link
              href="/je-cherche"
              className="group relative inline-flex items-center justify-center bg-[#560591] dark:bg-violet-600 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-[#3D0466] dark:hover:bg-violet-700 hover:shadow-xl hover:scale-105 btn-shimmer overflow-hidden"
            >
              <span className="relative z-10">Je cherche un logement</span>
              <svg
                className="relative z-10 ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <Link
              href="/je-loue"
              className="group relative inline-flex items-center justify-center bg-white dark:bg-slate-800 text-[#560591] dark:text-violet-400 font-bold text-lg px-8 py-4 rounded-2xl border-2 border-white dark:border-slate-700 transition-all duration-300 hover:bg-[#FAF5FF] dark:hover:bg-slate-700 hover:shadow-xl hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10">🏠 Je suis propriétaire</span>
            </Link>
          </div>

          {/* Lien connexion */}
          <div className="mt-6 opacity-0 animate-fade-slide-up delay-400" style={{ animationFillMode: "forwards" }}>
            <Link
              href="/connexion"
              className="text-white dark:text-slate-300 hover:text-white/80 dark:hover:text-slate-400 font-medium transition-colors px-6 py-2 drop-shadow"
            >
              Déjà un compte ? <span className="underline">Se connecter</span>
            </Link>
          </div>

          {/* Statistiques */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto opacity-0 animate-fade-slide-up delay-500" style={{ animationFillMode: "forwards" }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white drop-shadow">500+</div>
              <div className="text-white/80 dark:text-slate-300 text-sm mt-1">Locataires actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white drop-shadow">200+</div>
              <div className="text-white/80 dark:text-slate-300 text-sm mt-1">Logements</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white drop-shadow">50+</div>
              <div className="text-white/80 dark:text-slate-300 text-sm mt-1">Villes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
