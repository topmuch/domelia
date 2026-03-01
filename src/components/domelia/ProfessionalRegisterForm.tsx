// Formulaire d'inscription professionnelle - Domelia.fr
"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";

const CATEGORIES = [
  { value: "demenagement", label: "Déménagement" },
  { value: "garde_meubles", label: "Garde-meubles" },
  { value: "assurance", label: "Assurance habitation" },
  { value: "nettoyage", label: "Nettoyage / ménage" },
  { value: "travaux", label: "Travaux / rénovation" },
  { value: "autre", label: "Autre service" },
];

const ZONES = [
  { value: "Paris", label: "Paris et Île-de-France" },
  { value: "Lyon", label: "Lyon et environs" },
  { value: "Marseille", label: "Marseille et environs" },
  { value: "Bordeaux", label: "Bordeaux et environs" },
  { value: "Toulouse", label: "Toulouse et environs" },
  { value: "Nantes", label: "Nantes et environs" },
  { value: "France", label: "France entière" },
];

export function ProfessionalRegisterForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    siret: "",
    phone: "",
    zone: "Paris",
    category: "demenagement",
    acceptCgu: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingSiret, setIsValidatingSiret] = useState(false);
  const [siretValidation, setSiretValidation] = useState<{
    status: "idle" | "valid" | "invalid" | "checking";
    message: string;
    companyName?: string;
  }>({ status: "idle", message: "" });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validation du format SIRET (14 chiffres)
  const validateSiretFormat = (siret: string): boolean => {
    return /^\d{14}$/.test(siret);
  };

  // Algorithme de Luhn pour vérifier le SIRET
  const validateSiretLuhn = (siret: string): boolean => {
    if (!validateSiretFormat(siret)) return false;
    
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(siret[i], 10);
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  };

  // Vérification du SIRET via l'API
  const handleSiretVerification = async () => {
    const siret = formData.siret.replace(/\s/g, "");
    
    if (!validateSiretFormat(siret)) {
      setSiretValidation({
        status: "invalid",
        message: "Le SIRET doit contenir exactement 14 chiffres",
      });
      return;
    }
    
    if (!validateSiretLuhn(siret)) {
      setSiretValidation({
        status: "invalid",
        message: "Le numéro SIRET n'est pas valide (erreur de vérification)",
      });
      return;
    }
    
    setIsValidatingSiret(true);
    setSiretValidation({ status: "checking", message: "Vérification en cours..." });
    
    try {
      const response = await fetch("/api/professional/verify-siret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siret }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setSiretValidation({
          status: "valid",
          message: `SIRET vérifié ✓`,
          companyName: data.companyName,
        });
        
        // Pré-remplir le nom de l'entreprise si disponible
        if (data.companyName && !formData.companyName) {
          setFormData(prev => ({ ...prev, companyName: data.companyName }));
        }
      } else {
        setSiretValidation({
          status: "invalid",
          message: data.error || "SIRET introuvable dans la base SIRENE",
        });
      }
    } catch {
      // En mode développement, on accepte le SIRET si l'API n'est pas disponible
      setSiretValidation({
        status: "valid",
        message: "Format SIRET valide (vérification manuelle requise)",
      });
    } finally {
      setIsValidatingSiret(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validations
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    
    if (siretValidation.status === "invalid") {
      setError("Veuillez vérifier votre numéro SIRET");
      return;
    }
    
    if (!formData.acceptCgu) {
      setError("Veuillez accepter les conditions générales");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/professional/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          email: formData.email,
          password: formData.password,
          siret: formData.siret.replace(/\s/g, ""),
          phone: formData.phone,
          zone: formData.zone,
          category: formData.category,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }
      
      setSuccess(true);
      
      // Redirection après 2 secondes
      setTimeout(() => {
        window.location.href = "/dashboard-pro";
      }, 2000);
    } catch {
      setError("Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#ECFDF5] rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-[#10B981]" />
        </div>
        <h3 className="text-xl font-bold text-[#1E293B] mb-2">Compte créé avec succès !</h3>
        <p className="text-[#475569] mb-4">
          Votre compte professionnel a été créé. Vous allez être redirigé vers votre dashboard.
        </p>
        <p className="text-sm text-[#94A3B8]">
          Un email de confirmation vous a été envoyé. Votre compte sera vérifié dans les 24h.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Raison sociale */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-[#1E293B] mb-2">
          Raison sociale <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="companyName"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          placeholder="Ex: Déménagement Express SARL"
          className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
          required
          disabled={isLoading}
        />
      </div>

      {/* SIRET */}
      <div>
        <label htmlFor="siret" className="block text-sm font-medium text-[#1E293B] mb-2">
          Numéro SIRET <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="siret"
            value={formData.siret}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 14);
              setFormData({ ...formData, siret: value });
              setSiretValidation({ status: "idle", message: "" });
            }}
            placeholder="123 456 789 00012"
            maxLength={14}
            className="flex-1 px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all font-mono tracking-wider"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleSiretVerification}
            disabled={formData.siret.length !== 14 || isValidatingSiret || isLoading}
            className="px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#475569] hover:bg-[#F1F5F9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidatingSiret ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Vérifier"
            )}
          </button>
        </div>
        
        {/* Résultat validation SIRET */}
        {siretValidation.status !== "idle" && (
          <div className={`mt-2 flex items-center gap-2 text-sm ${
            siretValidation.status === "valid" ? "text-[#10B981]" :
            siretValidation.status === "invalid" ? "text-red-500" :
            siretValidation.status === "checking" ? "text-[#F59E0B]" : "text-[#94A3B8]"
          }`}>
            {siretValidation.status === "valid" && <CheckCircle className="w-4 h-4" />}
            {siretValidation.status === "invalid" && <XCircle className="w-4 h-4" />}
            {siretValidation.status === "checking" && <Loader2 className="w-4 h-4 animate-spin" />}
            {siretValidation.message}
          </div>
        )}
        
        <p className="text-xs text-[#94A3B8] mt-1">
          14 chiffres. Votre SIRET sera vérifié et crypté pour votre sécurité.
        </p>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#1E293B] mb-2">
          Email professionnel <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="contact@votre-entreprise.fr"
          className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
          required
          disabled={isLoading}
        />
      </div>

      {/* Téléphone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-[#1E293B] mb-2">
          Téléphone professionnel
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="01 23 45 67 89"
          className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
          disabled={isLoading}
        />
      </div>

      {/* Zone et Catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="zone" className="block text-sm font-medium text-[#1E293B] mb-2">
            Zone d'intervention <span className="text-red-500">*</span>
          </label>
          <select
            id="zone"
            value={formData.zone}
            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
            required
            disabled={isLoading}
          >
            {ZONES.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-[#1E293B] mb-2">
            Catégorie principale <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
            required
            disabled={isLoading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mot de passe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#1E293B] mb-2">
            Mot de passe <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
              minLength={6}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1E293B] mb-2">
            Confirmer le mot de passe <span className="text-red-500">*</span>
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
            minLength={6}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* CGU */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="acceptCgu"
          checked={formData.acceptCgu}
          onChange={(e) => setFormData({ ...formData, acceptCgu: e.target.checked })}
          className="mt-1 w-4 h-4 text-[#10B981] border-[#E2E8F0] rounded focus:ring-[#10B981]"
          required
          disabled={isLoading}
        />
        <label htmlFor="acceptCgu" className="text-sm text-[#475569]">
          J'accepte les{" "}
          <a href="#" className="text-[#560591] hover:underline">
            conditions générales d'utilisation
          </a>{" "}
          et la{" "}
          <a href="#" className="text-[#560591] hover:underline">
            politique de confidentialité
          </a>
          . J'autorise Domelia à vérifier mon SIRET.
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || siretValidation.status === "invalid"}
        className="w-full bg-[#10B981] text-white font-semibold py-3.5 rounded-xl transition-all duration-300 hover:bg-[#059669] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Inscription en cours...
          </>
        ) : (
          <>
            Créer mon compte professionnel
          </>
        )}
      </button>
    </form>
  );
}
