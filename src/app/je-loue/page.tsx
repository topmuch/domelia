// Page Je Loue - Formulaire annonce propriétaire - Domelia.fr
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function JeLouePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    // Informations compte
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    // Informations du bien
    type: "logement",
    title: "",
    description: "",
    location: "",
    address: "",
    price: "",
    surface: "",
    rooms: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gestion de l'upload d'images
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < Math.min(files.length, 5 - images.length); i++) {
      const file = files[i];
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} est trop volumineux (max 5MB)`);
        continue;
      }

      // Convertir en base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      newImages.push(base64);
    }

    setImages((prev) => [...prev, ...newImages].slice(0, 5));
    setUploading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Créer le compte utilisateur propriétaire
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
          role: "proprietaire",
        }),
      });

      if (!registerRes.ok) {
        const error = await registerRes.json();
        alert(error.error || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      // 2. Créer l'annonce avec les images
      const listingRes = await fetch("/api/listings", {
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
          rooms: formData.rooms ? parseInt(formData.rooms) : null,
          photos: images.length > 0 ? JSON.stringify(images) : null,
        }),
      });

      if (listingRes.ok) {
        router.push("/annonces?success=true");
      } else {
        const error = await listingRes.json();
        alert(error.error || "Erreur lors de la publication");
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
          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 bg-[#560591]/10 text-[#560591] rounded-full px-4 py-2 text-sm font-medium mb-4">
              🏠 Je suis propriétaire
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2">
              Publiez votre bien
            </h1>
            <p className="text-[#475569]">
              Trouvez le locataire idéal parmi nos profils vérifiés
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
              {step === 1 && "Vos informations"}
              {step === 2 && "Votre bien"}
              {step === 3 && "Détails & Prix"}
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
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                      required
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

            {/* Étape 2: Le bien */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-[#1E293B] mb-6">
                  Décrivez votre bien
                </h2>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Type de bien *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "logement", label: "🏠 Logement", desc: "Appartement, maison" },
                      { value: "parking", label: "🅿️ Parking", desc: "Box, place" },
                      { value: "colocation", label: "🛏️ Colocation", desc: "Chambre" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, type: option.value }))}
                        className={`py-4 px-3 rounded-xl border-2 text-center transition-all ${
                          formData.type === option.value
                            ? "border-[#560591] bg-[#FAF5FF]"
                            : "border-[#F1F5F9] hover:border-[#560591]/50"
                        }`}
                      >
                        <span className="text-2xl block mb-1">{option.label.split(" ")[0]}</span>
                        <span className="text-sm font-medium text-[#1E293B] block">{option.label.split(" ")[1]}</span>
                        <span className="text-xs text-[#94A3B8]">{option.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Titre de l'annonce *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: T2 Lumineux avec Balcon"
                    className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                    required
                  />
                </div>

                {/* Upload d'images */}
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Photos du bien ({images.length}/5)
                  </label>
                  
                  {/* Images uploadées */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                      {images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl border border-[#F1F5F9]"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bouton upload */}
                  {images.length < 5 && (
                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      uploading 
                        ? "border-[#560591] bg-[#FAF5FF]" 
                        : "border-[#F1F5F9] hover:border-[#560591] hover:bg-[#FAF5FF]/50"
                    }`}>
                      {uploading ? (
                        <div className="flex flex-col items-center text-[#560591]">
                          <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm mt-2">Chargement...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-[#94A3B8]">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm mt-2">Cliquez ou glissez vos photos</span>
                          <span className="text-xs mt-1">JPG, PNG (max 5MB)</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                  
                  <p className="text-xs text-[#94A3B8] mt-2">
                    Ajoutez jusqu&apos;à 5 photos. La première photo sera utilisée comme image principale.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Décrivez votre bien : atouts, équipements, quartier..."
                    className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591] resize-none"
                  />
                </div>

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
              </div>
            )}

            {/* Étape 3: Détails & Prix */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-[#1E293B] mb-6">
                  Détails et prix
                </h2>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Adresse précise
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Ex: 15 Rue de la Paix, 75001 Paris"
                    className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      Loyer mensuel *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
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
                      Surface (m²)
                    </label>
                    <input
                      type="number"
                      name="surface"
                      value={formData.surface}
                      onChange={handleChange}
                      placeholder="45"
                      className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                    />
                  </div>
                </div>

                {formData.type === "logement" && (
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      Nombre de pièces
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, rooms: n.toString() }))}
                          className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            formData.rooms === n.toString()
                              ? "border-[#560591] bg-[#FAF5FF] text-[#560591]"
                              : "border-[#F1F5F9] text-[#475569] hover:border-[#560591]/50"
                          }`}
                        >
                          {n === 1 ? "1 p." : `${n} p.`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Récapitulatif avec image */}
                <div className="bg-[#FAF5FF] rounded-xl p-4 mt-6">
                  <h3 className="font-semibold text-[#1E293B] mb-3">Récapitulatif</h3>
                  <div className="flex gap-4">
                    {/* Image principale */}
                    {images.length > 0 ? (
                      <img
                        src={images[0]}
                        alt="Photo principale"
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-[#EDE9FE] rounded-xl flex items-center justify-center text-[#560591]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Infos */}
                    <div className="flex-1 space-y-1 text-sm text-[#475569]">
                      <p className="font-semibold text-[#1E293B]">{formData.title || "Titre de l'annonce"}</p>
                      <p>📍 <strong>{formData.location || "Ville"}</strong></p>
                      <p>💰 <strong>{formData.price ? `${formData.price} €/mois` : "Prix"}</strong></p>
                      <p>🏠 {formData.type === "logement" ? "Logement entier" : formData.type === "parking" ? "Parking" : "Colocation"}</p>
                      {images.length > 0 && (
                        <p className="text-[#10B981]">📷 {images.length} photo{images.length > 1 ? "s" : ""}</p>
                      )}
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
                  {loading ? "Publication en cours..." : "Publier mon annonce"}
                </button>
              )}
            </div>
          </form>

          {/* Info */}
          <p className="text-center text-[#94A3B8] text-sm mt-6">
            En publiant, vous acceptez nos conditions d&apos;utilisation.
            <br />
            Votre annonce sera visible par tous les locataires inscrits.
          </p>
        </div>
      </div>
    </main>
  );
}
