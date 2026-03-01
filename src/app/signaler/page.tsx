// Page de signalement
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const REPORT_REASONS = [
  { value: "contenu_inapproprie", label: "Contenu inapproprié", icon: "🚫" },
  { value: "arnaque", label: "Arnaque suspectée", icon: "⚠️" },
  { value: "fausse_annonce", label: "Fausse annonce", icon: "📝" },
  { value: "harcelement", label: "Harcèlement", icon: "🛑" },
  { value: "discrimination", label: "Discrimination", icon: "⚖️" },
  { value: "spam", label: "Spam", icon: "📧" },
  { value: "autre", label: "Autre", icon: "❓" },
];

const TYPE_LABELS: { [key: string]: string } = {
  locataire: "Profil locataire",
  logement: "Annonce logement",
  coloc: "Annonce colocation",
  service: "Service professionnel",
  user: "Utilisateur",
};

function SignalerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    targetType: searchParams.get("type") || "",
    targetId: searchParams.get("id") || "",
    reason: "",
    description: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Vérifier l'authentification
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/connexion?redirect=/signaler");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason) {
      setError("Veuillez sélectionner une raison");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du signalement");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#560591]"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEF3C7] via-white to-[#FDE68A] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Signalement envoyé</h2>
          <p className="text-gray-600 mb-6">
            Merci pour votre signalement. Notre équipe va l&apos;examiner dans les plus brefs délais.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-[#560591] text-white font-semibold rounded-xl hover:bg-[#3D0466] transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF3C7] via-white to-[#FDE68A]">
      <div className="container-domelia py-8">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Signaler un contenu</h1>
            <p className="text-gray-600 mt-2">
              Signalez tout contenu inapproprié ou suspect
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Type et ID cible (cachés si fournis) */}
            {!formData.targetType && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de contenu à signaler
                </label>
                <select
                  value={formData.targetType}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#560591]"
                  required
                >
                  <option value="">Sélectionner un type</option>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.targetType && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type :</span> {TYPE_LABELS[formData.targetType]}
                </p>
              </div>
            )}

            {/* Raison */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Raison du signalement
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, reason: reason.value })}
                    className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${
                      formData.reason === reason.value
                        ? "border-[#560591] bg-purple-50 text-[#560591]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl">{reason.icon}</span>
                    <span className="text-sm font-medium">{reason.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnelle)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez le problème en détail..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#560591] resize-none"
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !formData.reason}
                className="flex-1 py-3 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Envoi en cours..." : "Envoyer le signalement"}
              </button>
            </div>
          </form>

          {/* Info */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Votre signalement sera examiné par notre équipe de modération.
            <br />
            Toutes les informations restent confidentielles.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignalerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#560591]"></div>
      </div>
    }>
      <SignalerForm />
    </Suspense>
  );
}
