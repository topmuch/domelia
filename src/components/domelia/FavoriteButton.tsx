"use client";

import { useState, useEffect } from "react";

interface FavoriteButtonProps {
  targetType: "locataire" | "logement" | "coloc" | "service";
  targetId: string;
  initialFavorited?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FavoriteButton({
  targetType,
  targetId,
  initialFavorited = false,
  size = "md",
  className = "",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier si l'utilisateur a déjà mis en favori (si pas initialFavorited)
  useEffect(() => {
    if (!initialFavorited) {
      const checkFavorite = async () => {
        try {
          const res = await fetch("/api/favorites");
          if (res.ok) {
            const data = await res.json();
            const found = data.favorites?.some(
              (f: { targetType: string; targetId: string }) =>
                f.targetType === targetType && f.targetId === targetId
            );
            setIsFavorited(!!found);
          }
        } catch {
          // Ignorer les erreurs silencieusement
        }
      };
      checkFavorite();
    }
  }, [targetType, targetId, initialFavorited]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isFavorited) {
        const res = await fetch(
          `/api/favorites?targetType=${targetType}&targetId=${targetId}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          setIsFavorited(false);
        }
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetType, targetId }),
        });
        const data = await res.json();
        if (res.ok) {
          setIsFavorited(true);
        } else if (data.error === "Non authentifié") {
          // Rediriger vers connexion ou afficher message
          alert("Veuillez vous connecter pour ajouter aux favoris");
        }
      }
    } catch {
      console.error("Erreur favori");
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-base",
    md: "w-10 h-10 text-lg",
    lg: "w-12 h-12 text-xl",
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        flex items-center justify-center rounded-full
        transition-all duration-300 shadow-md
        ${
          isFavorited
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-white/90 text-gray-400 hover:text-red-400 hover:bg-white"
        }
        ${sizeClasses[size]}
        ${className}
      `}
      title={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      {isLoading ? (
        <svg
          className="w-5 h-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill={isFavorited ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
}
