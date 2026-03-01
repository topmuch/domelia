// Composant Modal de contact - Domelia.fr
"use client";

import { useState } from "react";

interface ContactButtonProps {
  targetName: string;
  targetType: "locataire" | "proprietaire" | "colocataire" | "pro";
  targetId?: string;
}

export function ContactButton({ targetName, targetType, targetId }: ContactButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const getButtonText = () => {
    switch (targetType) {
      case "locataire":
        return `Contacter ${targetName}`;
      case "proprietaire":
        return "Contacter le propriétaire";
      case "colocataire":
        return "Contacter ce coloc";
      case "pro":
        return "Contacter ce professionnel";
      default:
        return "Contacter";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Simuler l'envoi
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSending(false);
    setSent(true);

    // Fermer après 2 secondes
    setTimeout(() => {
      setShowModal(false);
      setSent(false);
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-white text-[#560591] font-semibold py-3 rounded-xl transition-all hover:shadow-lg hover:scale-[1.02]"
      >
        {getButtonText()}
      </button>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {sent ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#ECFDF5] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#1E293B] mb-2">Message envoyé !</h3>
                <p className="text-[#475569]">
                  Votre message a bien été envoyé. Vous recevrez une réponse rapidement.
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-[#F1F5F9]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1E293B]">Contacter {targetName}</h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-[#94A3B8] hover:text-[#1E293B]"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      Votre nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      Votre email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                      placeholder="votre@email.fr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591]"
                      placeholder="06 XX XX XX XX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591] resize-none"
                      placeholder="Présentez-vous et expliquez votre intérêt..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-3 border border-[#F1F5F9] text-[#475569] rounded-xl font-medium hover:bg-[#F8FAFC]"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={sending}
                      className="flex-1 px-4 py-3 bg-[#560591] text-white rounded-xl font-semibold hover:bg-[#3D0466] disabled:opacity-50"
                    >
                      {sending ? "Envoi..." : "Envoyer"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
