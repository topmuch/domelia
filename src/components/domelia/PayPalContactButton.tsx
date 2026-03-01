// Composant Bouton de contact avec paiement PayPal - Domelia.fr
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PayPalContactButtonProps {
  tenantId: string;
  tenantName: string;
  city: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export function PayPalContactButton({ tenantId, tenantName, city }: PayPalContactButtonProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Vérifier l'authentification et le statut du contact
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Vérifier l'utilisateur
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          setUser(authData.user);

          // Vérifier si le contact est déjà déverrouillé
          const accessRes = await fetch(`/api/paypal/check-access?tenantId=${tenantId}`);
          if (accessRes.ok) {
            const accessData = await accessRes.json();
            setAlreadyUnlocked(accessData.unlocked || false);
          }
        }
      } catch (error) {
        console.error("Erreur vérification accès:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [tenantId]);

  const handleContactClick = () => {
    if (!user) {
      // Non connecté -> rediriger vers connexion
      router.push(`/connexion?redirect=/annonce/locataire/${tenantId}`);
      return;
    }

    if (user.role !== "proprietaire" && user.role !== "admin") {
      // Pas propriétaire -> message d'erreur
      alert("Seuls les propriétaires peuvent contacter ce locataire.");
      return;
    }

    if (alreadyUnlocked) {
      // Déjà déverrouillé -> aller à la messagerie
      router.push(`/messagerie?contact=${tenantId}`);
      return;
    }

    // Ouvrir la modal de paiement
    setShowModal(true);
  };

  const handlePayment = async () => {
    if (!user) return;

    setProcessing(true);

    try {
      // Créer la commande PayPal
      const createRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });

      const createData = await createRes.json();

      if (createData.error) {
        alert(createData.error);
        setProcessing(false);
        return;
      }

      if (createData.alreadyUnlocked) {
        setAlreadyUnlocked(true);
        setShowModal(false);
        router.push(`/messagerie?contact=${tenantId}`);
        return;
      }

      // Capturer le paiement
      const captureRes = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createData.orderId,
          paymentId: createData.paymentId,
        }),
      });

      const captureData = await captureRes.json();

      if (captureData.success) {
        setPaymentSuccess(true);
        setAlreadyUnlocked(true);

        // Fermer la modal après 2 secondes et rediriger
        setTimeout(() => {
          setShowModal(false);
          router.push(`/messagerie?contact=${tenantId}`);
        }, 2000);
      } else {
        alert("Erreur lors du paiement. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur paiement:", error);
      alert("Erreur lors du paiement. Veuillez réessayer.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="w-full bg-white/50 text-[#560591] font-semibold py-3 rounded-xl"
      >
        Chargement...
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleContactClick}
        className="w-full bg-white text-[#560591] font-semibold py-3 rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        {alreadyUnlocked ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Envoyer un message
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Contacter – 2 €
          </>
        )}
      </button>

      {/* Modal de paiement */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !processing) setShowModal(false);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {paymentSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#ECFDF5] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#1E293B] mb-2">Paiement réussi !</h3>
                <p className="text-[#475569]">
                  Vous pouvez maintenant échanger avec {tenantName}.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-[#560591] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Déverrouiller la messagerie</h2>
                    <button
                      onClick={() => setShowModal(false)}
                      disabled={processing}
                      className="text-white/80 hover:text-white disabled:opacity-50"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  {/* Récapitulatif */}
                  <div className="bg-[#F8FAFC] rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#560591] flex items-center justify-center text-white font-bold text-lg">
                        {tenantName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#1E293B]">{tenantName}</p>
                        <p className="text-sm text-[#94A3B8]">{city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ce qui est inclus */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-[#1E293B] mb-3">Ce qui est inclus :</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-[#475569]">
                        <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Accès à la messagerie privée
                      </li>
                      <li className="flex items-center gap-2 text-[#475569]">
                        <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Contact illimité dans le temps
                      </li>
                      <li className="flex items-center gap-2 text-[#475569]">
                        <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Pas d'abonnement, paiement unique
                      </li>
                    </ul>
                  </div>

                  {/* Prix */}
                  <div className="bg-[#FAF5FF] rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[#475569]">Déverrouillage du contact</span>
                      <span className="text-2xl font-bold text-[#560591]">2,00 €</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-2">
                      Paiement sécurisé • Aucune donnée bancaire stockée
                    </p>
                  </div>

                  {/* Bouton PayPal */}
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-3 bg-[#0070BA] hover:bg-[#005ea6] text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.679l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H7.72a.483.483 0 0 1-.477-.558L7.418 21h1.518l.95-6.02h1.385c4.678 0 7.75-2.203 8.796-6.502zm-2.96-5.09c.762.868.983 1.81.752 3.285-.019.123-.04.24-.062.36-.735 3.773-3.089 5.446-6.956 5.446H8.957c-.63 0-1.174.414-1.354 1.002l-.014-.002-.93 5.89H3.121a.051.051 0 0 1-.05-.06l2.598-16.51A.95.95 0 0 1 6.607 2h5.976c2.183 0 3.716.469 4.523 1.388z" />
                        </svg>
                        Payer avec PayPal
                      </>
                    )}
                  </button>

                  {/* Mode développement */}
                  <p className="text-center text-xs text-[#94A3B8] mt-4">
                    Mode développement - Paiement simulé
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
