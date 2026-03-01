// Page modification profil locataire - Domelia.fr
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/domelia/Navbar";
import { Footer } from "@/components/domelia/Footer";

export default function ModifierProfilPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    budget: "",
    housingType: "",
    jobStatus: "",
    hasGuarantor: false,
    urgency: "flexible",
    description: "",
    phone: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profiles/${id}`);
      if (res.ok) {
        const data = await res.json();
        const profile = data.profile;
        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          city: profile.city || "",
          budget: profile.budget?.toString() || "",
          housingType: profile.housingType || "",
          jobStatus: profile.jobStatus || "cdi",
          hasGuarantor: profile.hasGuarantor || false,
          urgency: profile.urgency || "flexible",
          description: profile.description || "",
          phone: profile.phone || "",
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          budget: parseInt(formData.budget),
        }),
      });

      if (res.ok) {
        router.push(`/annonce/locataire/${id}`);
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#560591] border-t-transparent" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Fil d'ariane */}
          <nav className="flex items-center gap-2 text-sm text-[#94A3B8] mb-6">
            <Link href="/" className="hover:text-[#560591]">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/profils-locataires" className="hover:text-[#560591]">
              Locataires
            </Link>
            <span>/</span>
            <span className="text-[#560591] font-medium">Modifier le profil</span>
          </nav>

          <div className="bg-white rounded-2xl shadow-luxe-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#1E293B]">
                  Modifier mon profil
                </h1>
                <p className="text-[#475569] mt-1">
                  Mettez à jour vos informations de recherche
                </p>
              </div>
              <Link
                href={`/annonce/locataire/${id}`}
                className="text-[#560591] hover:underline text-sm font-medium"
              >
                ← Retour au profil
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div>
                <h2 className="text-lg font-semibold text-[#1E293B] mb-4">
                  Informations personnelles
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
              </div>

              {/* Coordonnées */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Ville recherchée *
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

              {/* Recherche */}
              <div>
                <h2 className="text-lg font-semibold text-[#1E293B] mb-4">
                  Votre recherche
                </h2>
                <div className="grid grid-cols-2 gap-4">
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
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                        €
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      Type de bien
                    </label>
                    <select
                      name="housingType"
                      value={formData.housingType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                    >
                      <option value="">Non spécifié</option>
                      <option value="studio">Studio</option>
                      <option value="t1">T1</option>
                      <option value="t2">T2</option>
                      <option value="t3">T3</option>
                      <option value="t4">T4</option>
                      <option value="appartement">Appartement</option>
                      <option value="maison">Maison</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Situation */}
              <div>
                <h2 className="text-lg font-semibold text-[#1E293B] mb-4">
                  Votre situation
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      Situation professionnelle *
                    </label>
                    <select
                      name="jobStatus"
                      value={formData.jobStatus}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                      required
                    >
                      <option value="cdi">CDI</option>
                      <option value="cdd">CDD</option>
                      <option value="etudiant">Étudiant</option>
                      <option value="independant">Indépendant</option>
                      <option value="retraite">Retraité</option>
                      <option value="sans_emploi">En recherche d'emploi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      Urgence de recherche
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                    >
                      <option value="immediate">🔥 Immédiate</option>
                      <option value="1_mois">📅 Dans 1 mois</option>
                      <option value="2_mois">📅 Dans 2 mois</option>
                      <option value="flexible">⏳ Flexible</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Garant */}
              <div className="flex items-center gap-3 py-2">
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-2">
                  Description / Présentation
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Présentez-vous aux propriétaires..."
                  className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591] resize-none"
                />
              </div>

              {/* Boutons */}
              <div className="flex justify-between pt-6 border-t border-[#F1F5F9]">
                <Link
                  href={`/annonce/locataire/${id}`}
                  className="px-6 py-3 rounded-xl border border-[#F1F5F9] text-[#475569] font-medium hover:bg-[#F8FAFC] transition-all"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 rounded-xl bg-[#560591] text-white font-semibold transition-all hover:bg-[#3D0466] hover:shadow-lg disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
