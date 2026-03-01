"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NewServiceFormProps {
  proId: string;
  hasActiveSubscription: boolean;
  defaultZone: string;
}

const CATEGORIES = [
  { value: "demenagement", label: "🚚 Déménagement", description: "Transport de meubles et cartons" },
  { value: "garde_meubles", label: "📦 Garde-meubles", description: "Stockage sécurisé" },
  { value: "assurance", label: "🛡️ Assurance habitation", description: "Protection logement" },
  { value: "nettoyage", label: "🧹 Nettoyage", description: "Ménage et remise en état" },
  { value: "travaux", label: "🔧 Travaux", description: "Rénovation et réparation" },
  { value: "autre", label: "📋 Autre service", description: "Autre type de service" },
];

const PRICE_TYPES = [
  { value: "fixed", label: "Prix fixe" },
  { value: "from", label: "À partir de" },
  { value: "on_quote", label: "Sur devis uniquement" },
];

export function NewServiceForm({ proId, hasActiveSubscription, defaultZone }: NewServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [createdService, setCreatedService] = useState<{ id: string; title: string } | null>(null);

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    price: "",
    priceType: "fixed",
    zone: defaultZone,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validations
    const newErrors: Record<string, string> = {};
    if (!formData.category) newErrors.category = "Veuillez sélectionner une catégorie";
    if (!formData.title.trim()) newErrors.title = "Le titre est obligatoire";
    if (formData.title.length < 5) newErrors.title = "Le titre doit contenir au moins 5 caractères";
    if (formData.priceType !== "on_quote" && !formData.price) {
      newErrors.price = "Le prix est obligatoire (sauf sur devis)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/professional/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.category,
          title: formData.title,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : null,
          priceType: formData.priceType,
          zone: formData.zone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error || "Erreur lors de la création" });
        return;
      }

      if (data.requiresPayment) {
        // Service créé mais nécessite un paiement
        setCreatedService({ id: data.service.id, title: data.service.title });
      } else {
        // Service publié directement (abonnement actif)
        router.push("/dashboard-pro?tab=services&success=1");
      }
    } catch (error) {
      setErrors({ submit: "Erreur de connexion" });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentType: "per_ad" | "monthly") => {
    setPaymentLoading(true);

    try {
      // Créer la commande PayPal
      const orderRes = await fetch("/api/professional/services/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: createdService?.id,
          paymentType,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.error || "Erreur lors de la création du paiement");
        setPaymentLoading(false);
        return;
      }

      // En mode mock, simuler le succès directement
      if (orderData.mockMode) {
        // Capturer le paiement
        const captureRes = await fetch("/api/professional/services/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.orderId,
            serviceId: createdService?.id,
          }),
        });

        const captureData = await captureRes.json();

        if (captureData.success) {
          router.push("/dashboard-pro?tab=services&payment=success");
        } else {
          alert("Erreur lors de la validation du paiement");
        }
      } else {
        // En production, rediriger vers PayPal
        // Note: Dans une vraie implémentation, on utiliserait le SDK PayPal côté client
        alert(`Redirection vers PayPal pour le paiement de ${orderData.amount}€ (ID: ${orderData.orderId})`);

        // Pour la démo, on simule le succès
        const captureRes = await fetch("/api/professional/services/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.orderId,
            serviceId: createdService?.id,
          }),
        });

        const captureData = await captureRes.json();

        if (captureData.success) {
          router.push("/dashboard-pro?tab=services&payment=success");
        }
      }
    } catch (error) {
      console.error("Erreur paiement:", error);
      alert("Erreur lors du paiement");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Afficher le formulaire de paiement si le service est créé mais non payé
  if (createdService) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#E2E8F0]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-[#1E293B]">Service créé !</h2>
          <p className="text-[#475569] mt-2">
            <strong>"{createdService.title}"</strong> est prêt à être publié.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="font-semibold text-[#1E293B]">Choisissez votre option de paiement :</h3>

          <button
            onClick={() => handlePayment("per_ad")}
            disabled={paymentLoading}
            className="w-full p-4 border border-[#E2E8F0] rounded-xl hover:border-[#10B981] hover:bg-[#F0FDF4] transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#1E293B] group-hover:text-[#10B981]">
                  Paiement à l'annonce
                </p>
                <p className="text-sm text-[#475569]">
                  1 service publié pendant 30 jours
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#10B981]">5 €</p>
                <p className="text-xs text-[#94A3B8]">paiement unique</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handlePayment("monthly")}
            disabled={paymentLoading}
            className="w-full p-4 border-2 border-[#560591] rounded-xl bg-[#FAF5FF] text-left relative overflow-hidden disabled:opacity-50"
          >
            <div className="absolute top-3 right-3 bg-[#560591] text-white text-xs px-2 py-0.5 rounded-full">
              Recommandé
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#1E293B]">Abonnement mensuel</p>
                <p className="text-sm text-[#475569]">
                  Services illimités + badge "Partenaire officiel"
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#560591]">15 €</p>
                <p className="text-xs text-[#94A3B8]">/ mois</p>
              </div>
            </div>
          </button>
        </div>

        {paymentLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#10B981] border-t-transparent mx-auto"></div>
            <p className="text-[#475569] mt-2">Traitement du paiement...</p>
          </div>
        )}

        <button
          onClick={() => router.push("/dashboard-pro")}
          className="w-full py-3 text-[#475569] hover:text-[#1E293B] transition-colors"
        >
          Annuler et retourner au dashboard
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 border border-[#E2E8F0]">
      {/* Catégorie */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#1E293B] mb-3">
          Catégorie de service *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.value })}
              className={`p-4 rounded-xl border text-left transition-all ${
                formData.category === cat.value
                  ? "border-[#10B981] bg-[#F0FDF4] shadow-sm"
                  : "border-[#E2E8F0] hover:border-[#10B981]/50 hover:bg-[#F8FAFC]"
              }`}
            >
              <p className="font-medium text-[#1E293B]">{cat.label}</p>
              <p className="text-xs text-[#475569]">{cat.description}</p>
            </button>
          ))}
        </div>
        {errors.category && (
          <p className="text-red-500 text-sm mt-2">{errors.category}</p>
        )}
      </div>

      {/* Titre */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#1E293B] mb-2">
          Titre du service *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Déménagement clé en main - Paris et région parisienne"
          className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          maxLength={100}
        />
        <p className="text-xs text-[#94A3B8] mt-1">{formData.title.length}/100 caractères</p>
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#1E293B] mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Décrivez votre service en détail : ce qui est inclus, vos avantages, votre expérience..."
          className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent min-h-[120px] resize-y"
          maxLength={1000}
        />
        <p className="text-xs text-[#94A3B8] mt-1">{formData.description.length}/1000 caractères</p>
      </div>

      {/* Prix */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#1E293B] mb-2">
          Tarification *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <select
              value={formData.priceType}
              onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            >
              {PRICE_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>
          {formData.priceType !== "on_quote" && (
            <div className="relative">
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 pr-12 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569]">€</span>
            </div>
          )}
        </div>
        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
      </div>

      {/* Zone */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-[#1E293B] mb-2">
          Zone d'intervention
        </label>
        <input
          type="text"
          value={formData.zone}
          onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
          placeholder="Ex: Paris et Île-de-France, France entière..."
          className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
        />
        <p className="text-xs text-[#94A3B8] mt-1">
          Par défaut : votre zone principale ({defaultZone})
        </p>
      </div>

      {/* Erreur générale */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 rounded-xl text-red-600 text-sm">
          {errors.submit}
        </div>
      )}

      {/* Boutons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.push("/dashboard-pro")}
          className="flex-1 py-3 px-6 border border-[#E2E8F0] rounded-xl font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-6 bg-[#10B981] text-white rounded-xl font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Création...
            </>
          ) : hasActiveSubscription ? (
            "Publier le service"
          ) : (
            "Créer et continuer"
          )}
        </button>
      </div>
    </form>
  );
}
