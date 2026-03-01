// Page d'inscription - Domelia.fr
import Link from "next/link";

export default function InscriptionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
      {/* Navigation simple */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-luxe">
        <div className="container-domelia">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#560591] flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="font-bold text-xl text-[#1E293B]">
                Domelia<span className="text-[#560591]">.fr</span>
              </span>
            </Link>
            <Link
              href="/connexion"
              className="text-[#475569] hover:text-[#560591] font-medium transition-colors"
            >
              Déjà un compte ?
            </Link>
          </div>
        </div>
      </nav>

      {/* Formulaire */}
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
              Créer un compte
            </h1>
            <p className="text-[#475569]">
              Rejoignez Domelia et trouvez votre logement idéal
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-luxe-lg p-8">
            <form action="/api/auth/register" method="POST" className="space-y-5">
              {/* Nom */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#1E293B] mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Marie Dupont"
                  className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#560591] focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1E293B] mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="marie@exemple.fr"
                  className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#560591] focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#1E293B] mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#560591] focus:border-transparent transition-all"
                  minLength={6}
                  required
                />
                <p className="text-xs text-[#94A3B8] mt-1">Minimum 6 caractères</p>
              </div>

              {/* Rôle */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-[#1E293B] mb-2">
                  Je suis
                </label>
                <select
                  id="role"
                  name="role"
                  className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591] focus:border-transparent transition-all"
                  defaultValue="locataire"
                >
                  <option value="locataire">À la recherche d'un logement</option>
                  <option value="proprietaire">Propriétaire / Loueur</option>
                </select>
              </div>

              {/* CGU */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="cgu"
                  name="cgu"
                  className="mt-1 w-4 h-4 text-[#560591] border-[#F1F5F9] rounded focus:ring-[#560591]"
                  required
                />
                <label htmlFor="cgu" className="text-sm text-[#475569]">
                  J'accepte les{" "}
                  <Link href="#" className="text-[#560591] hover:underline">
                    conditions générales
                  </Link>{" "}
                  et la{" "}
                  <Link href="#" className="text-[#560591] hover:underline">
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-[#560591] text-white font-semibold py-3.5 rounded-xl transition-all duration-300 hover:bg-[#3D0466] hover:shadow-lg btn-shimmer"
              >
                Créer mon compte
              </button>
            </form>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F1F5F9]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#94A3B8]">ou</span>
              </div>
            </div>

            {/* Google */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#F1F5F9] text-[#1E293B] font-medium py-3 rounded-xl transition-all hover:bg-[#F8FAFC]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
            </button>
          </div>

          {/* Aide */}
          <p className="text-center text-sm text-[#94A3B8] mt-6">
            Des questions ?{" "}
            <Link href="#" className="text-[#560591] hover:underline">
              Contactez-nous
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
