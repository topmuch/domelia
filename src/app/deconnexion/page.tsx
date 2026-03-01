// Page de déconnexion dédiée - Domelia.fr
// Cette page force un rechargement complet pour garantir que l'UI se met à jour
"use client";

import { useEffect, useState } from "react";

export default function DeconnexionPage() {
  const [status, setStatus] = useState("Déconnexion en cours...");

  useEffect(() => {
    const logout = async () => {
      try {
        // Appeler l'API de déconnexion
        await fetch("/api/auth/logout", { method: "POST" });
        setStatus("Déconnexion réussie. Redirection...");

        // Forcer un rechargement complet vers la page d'accueil
        // Utiliser replace pour ne pas garder la page de déconnexion dans l'historique
        setTimeout(() => {
          window.location.replace("/");
        }, 500);
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        setStatus("Erreur lors de la déconnexion. Redirection...");
        setTimeout(() => {
          window.location.replace("/");
        }, 1000);
      }
    };

    logout();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 border-4 border-[#560591] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg text-[#1E293B] font-medium">{status}</p>
      </div>
    </main>
  );
}
