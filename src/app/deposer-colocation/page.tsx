// Page Déposer une colocation - Formulaire multi-étapes - Domelia.fr
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/domelia/Navbar";

export default function DeposerColocationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    location: "",
    address: "",
    price: "",
    surface: "",
    photos: [] as string[],
  });

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          router.push("/connexion?redirect=/deposer-colocation");
        }
      } catch {
        router.push("/connexion?redirect=/deposer-colocation");
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, type }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - formData.photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, base64].slice(0, 5),
        }));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        return formData.type !== "" && formData.title.trim() !== "";
      case 2:
        return formData.location.trim() !== "" && formData.price !== "";
      case 3:
        return true; // Photos are optional
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/colocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          address: formData.address,
          price: parseInt(formData.price),
          surface: formData.surface ? parseInt(formData.surface) : null,
          photos: formData.photos.length > 0 ? formData.photos : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de la création de l'annonce");
        setLoading(false);
        return;
      }

      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] via-white to-[#FEF3C7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#560591] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#475569]">Vérification de l'authentification...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] via-white to-[#FEF3C7]">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="inline-block bg-[#FFF7ED] text-[#F59E0B] font-semibold px-4 py-2 rounded-full text-sm mb-4">
              🛏️ Colocation
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-2">
              Déposer une annonce de colocation
            </h1>
            <p className="text-[#475569]">
              {user?.name ? `Connecté en tant que ${user.name}` : "Créez votre annonce en quelques étapes"}
            </p>
          </div>

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
              {step === 1 && "Type et description"}
              {step === 2 && "Localisation et budget"}
              {step === 3 && "Photos"}
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-luxe-lg p-6 md:p-8">
            {/* Étape 1: Type et description */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#1E293B] mb-6">
                  Quel type d'annonce souhaitez-vous déposer ?
                </h2>

                {/* Type sélection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleTypeSelect("chambre")}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      formData.type === "chambre"
                        ? "border-[#F59E0B] bg-[#FFF7ED]"
                        : "border-[#F1F5F9] hover:border-[#F59E0B]/50"
                    }`}
                  >
                    <div className="text-3xl mb-3">🛏️</div>
                    <h3 className="font-bold text-[#1E293B] mb-2">Chambre en colocation</h3>
                    <p className="text-sm text-[#475569]">
                      Vous proposez une chambre à louer dans une colocation existante
                    </p>
                    <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                      Offre
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeSelect("recherche_coloc")}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      formData.type === "recherche_coloc"
                        ? "border-blue-500 bg-blue-50"
                        : "border-[#F1F5F9] hover:border-blue-300"
                    }`}
                  >
                    <div className="text-3xl mb-3">🔍</div>
                    <h3 className="font-bold text-[#1E293B] mb-2">Recherche colocataire</h3>
                    <p className="text-sm text-[#475569]">
                      Vous cherchez un(e) colocataire pour chercher un logement ensemble
                    </p>
                    <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                      Demande
                    </div>
                  </button>
                </div>

                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Titre de l'annonce *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={
                      formData.type === "chambre"
                        ? "Ex: Chambre lumineuse dans T4 centre-ville"
                        : "Ex: Je cherche un colocataire pour T3"
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Décrivez votre annonce en détail..."
                    className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591] resize-none"
                  />
                </div>
              </div>
            )}

            {/* Étape 2: Localisation et budget */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#1E293B] mb-6">
                  Localisation et budget
                </h2>

                {/* Ville */}
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Paris, Lyon, Bordeaux..."
                    className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                    required
                  />
                </div>

                {/* Adresse */}
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Adresse précise (optionnel)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Ex: 12 rue de la Paix, 75002 Paris"
                    className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                  />
                </div>

                {/* Budget et Surface */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      {formData.type === "chambre" ? "Loyer mensuel *" : "Budget mensuel *"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="450"
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      Surface (m²)
                    </label>
                    <input
                      type="number"
                      name="surface"
                      value={formData.surface}
                      onChange={handleChange}
                      placeholder="15"
                      className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3: Photos */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#1E293B] mb-6">
                  Ajoutez des photos
                </h2>

                <p className="text-[#475569] text-sm mb-4">
                  Ajoutez jusqu'à 5 photos de votre chambre ou appartement. Les photos augmentent
                  la visibilité de votre annonce.
                </p>

                {/* Upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E2E8F0] rounded-2xl p-8 text-center cursor-pointer hover:border-[#560591] hover:bg-[#FAF5FF]/30 transition-all"
                >
                  <div className="text-4xl mb-3">📷</div>
                  <p className="text-[#1E293B] font-medium mb-1">
                    Cliquez pour ajouter des photos
                  </p>
                  <p className="text-sm text-[#94A3B8]">
                    PNG, JPG jusqu'à 5 Mo • Max 5 photos
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={formData.photos.length >= 5}
                  />
                </div>

                {/* Prévisualisation */}
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-[#560591] text-white text-xs px-2 py-0.5 rounded">
                            Principale
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Récapitulatif */}
                <div className="bg-[#F8FAFC] rounded-xl p-4 mt-6">
                  <h3 className="font-semibold text-[#1E293B] mb-3">Récapitulatif</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#475569]">Type:</span>
                      <span className="font-medium text-[#1E293B]">
                        {formData.type === "chambre" ? "Chambre en colocation" : "Recherche colocataire"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#475569]">Titre:</span>
                      <span className="font-medium text-[#1E293B] truncate max-w-48">
                        {formData.title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#475569]">Ville:</span>
                      <span className="font-medium text-[#1E293B]">{formData.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#475569]">Budget:</span>
                      <span className="font-medium text-[#560591]">{formData.price} €/mois</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#475569]">Photos:</span>
                      <span className="font-medium text-[#1E293B]">{formData.photos.length} / 5</span>
                    </div>
                  </div>
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
                  href="/colocation"
                  className="px-6 py-3 rounded-xl border border-[#F1F5F9] text-[#475569] font-medium hover:bg-[#F8FAFC] transition-all"
                >
                  Annuler
                </Link>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={!validateStep()}
                  className="px-8 py-3 rounded-xl bg-[#560591] text-white font-semibold transition-all hover:bg-[#3D0466] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-[#560591] text-white font-semibold transition-all hover:bg-[#3D0466] hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? "Publication en cours..." : "Publier l'annonce"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
