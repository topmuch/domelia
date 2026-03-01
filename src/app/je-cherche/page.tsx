// Page Je Cherche - Formulaire profil locataire - Domelia.fr
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function JeCherchePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    city: "",
    budget: "",
    housingType: "",
    jobStatus: "",
    hasGuarantor: false,
    urgency: "flexible",
    description: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Appel unique : inscription + création profil en une seule requête
      const res = await fetch("/api/tenant-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      // Rediriger vers le profil créé
      if (data.profile?.id) {
        router.push(`/annonce/locataire/${data.profile.id}`);
      } else {
        router.push("/profils-locataires");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
      {/* Navigation */}
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

      {/* Formulaire multi-étapes */}
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      s <= step
                        ? "bg-[#560591] text-white"
                        : "bg-[#F1F5F9] text-[#94A3B8]"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 rounded-full transition-all ${
                        s < step ? "bg-[#560591]" : "bg-[#F1F5F9]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-3 text-sm text-[#475569]">
              {step === 1 && "Vos informations"}
              {step === 2 && "Votre recherche"}
              {step === 3 && "Votre situation"}
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-luxe-lg p-8">
            {/* Étape 1: Informations personnelles */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-[#1E293B] mb-6">
                  Vos informations personnelles
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="06 XX XX XX XX"
                    className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                  />
                </div>
              </div>
            )}

            {/* Étape 2: Recherche */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-[#1E293B] mb-6">
                  Votre recherche de logement
                </h2>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Ville souhaitée *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Paris, Lyon, Bordeaux..."
                    className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Budget mensuel *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="800"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">€</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Type de logement
                  </label>
                  <select
                    name="housingType"
                    value={formData.housingType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="studio">Studio</option>
                    <option value="t1">T1</option>
                    <option value="t2">T2</option>
                    <option value="t3">T3</option>
                    <option value="appartement">Appartement</option>
                    <option value="maison">Maison</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Urgence
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "immediate", label: "🔥 Immédiate" },
                      { value: "1_mois", label: "📅 1 mois" },
                      { value: "2_mois", label: "📅 2 mois" },
                      { value: "flexible", label: "⏳ Flexible" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, urgency: option.value }))}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.urgency === option.value
                            ? "border-[#560591] bg-[#FAF5FF] text-[#560591]"
                            : "border-[#F1F5F9] text-[#475569] hover:border-[#560591]/50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3: Situation */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-[#1E293B] mb-6">
                  Votre situation professionnelle
                </h2>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Situation professionnelle *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "cdi", label: "💼 CDI" },
                      { value: "cdd", label: "📄 CDD" },
                      { value: "etudiant", label: "🎓 Étudiant" },
                      { value: "independant", label: "🚀 Indépendant" },
                      { value: "retraite", label: "🏖️ Retraité" },
                      { value: "sans_emploi", label: "🔍 En recherche" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, jobStatus: option.value }))}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.jobStatus === option.value
                            ? "border-[#560591] bg-[#FAF5FF] text-[#560591]"
                            : "border-[#F1F5F9] text-[#475569] hover:border-[#560591]/50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 py-4">
                  <input
                    type="checkbox"
                    id="hasGuarantor"
                    name="hasGuarantor"
                    checked={formData.hasGuarantor}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#560591] border-[#F1F5F9] rounded focus:ring-[#560591]"
                  />
                  <label htmlFor="hasGuarantor" className="text-[#1E293B] font-medium">
                    ✅ Je peux fournir un garant
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Description (optionnel)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Présentez-vous brièvement aux propriétaires..."
                    className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591] resize-none"
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-[#F1F5F9]">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 rounded-xl border border-[#F1F5F9] text-[#475569] font-medium hover:bg-[#F8FAFC] transition-all"
                >
                  ← Retour
                </button>
              ) : (
                <Link
                  href="/"
                  className="px-6 py-3 rounded-xl border border-[#F1F5F9] text-[#475569] font-medium hover:bg-[#F8FAFC] transition-all"
                >
                  Annuler
                </Link>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-8 py-3 rounded-xl bg-[#560591] text-white font-semibold transition-all hover:bg-[#3D0466] hover:shadow-lg"
                >
                  Continuer →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-[#560591] text-white font-semibold transition-all hover:bg-[#3D0466] hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? "Création en cours..." : "Publier mon profil"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
