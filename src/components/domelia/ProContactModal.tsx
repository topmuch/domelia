// Modal de contact pour les services professionnels - Domelia.fr
"use client";

import { useState } from "react";

interface ProContactModalProps {
  service: {
    id: string;
    title: string;
    proId: string;
    companyName: string;
  };
  onClose: () => void;
}

export function ProContactModal({ service, onClose }: ProContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/professional/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          proId: service.proId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      setIsSuccess(true);
      
      // Fermer après 2 secondes
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch {
      setError("Erreur lors de l'envoi de la demande");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-md p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-[#ECFDF5] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#1E293B] mb-2">Demande envoyée !</h3>
          <p className="text-[#475569]">
            {service.companyName} vous contactera dans les plus brefs délais.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#10B981] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Contacter ce pro</h2>
              <p className="text-white/80 text-sm">{service.companyName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#1E293B] mb-2">
              Votre nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Marie Dupont"
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1E293B] mb-2">
              Votre email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="marie@exemple.fr"
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#1E293B] mb-2">
              Téléphone (optionnel)
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="06 12 34 56 78"
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-[#1E293B] mb-2">
              Votre message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={`Bonjour, je suis intéressé(e) par votre service "${service.title}"...`}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent resize-none"
              required
              disabled={isLoading}
            />
          </div>

          <div className="bg-[#ECFDF5] rounded-xl p-4">
            <p className="text-sm text-[#475569]">
              <span className="font-medium text-[#10B981]">💡 Bon à savoir :</span>{" "}
              Ce service est gratuit pour vous. Le professionnel paie pour être visible sur Domelia.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#10B981] text-white font-semibold py-3 rounded-xl transition-all hover:bg-[#059669] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              "Envoyer ma demande"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
