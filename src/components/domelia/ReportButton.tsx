// Bouton de signalement
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ReportButtonProps {
  targetType: "locataire" | "logement" | "coloc" | "service" | "user";
  targetId: string;
  size?: "sm" | "md";
}

export function ReportButton({ targetType, targetId, size = "md" }: ReportButtonProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    const params = new URLSearchParams({
      type: targetType,
      id: targetId,
    });
    router.push(`/signaler?${params.toString()}`);
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 ${
        isHovered
          ? "bg-yellow-100 text-yellow-600"
          : "bg-gray-100 text-gray-400"
      }`}
      title="Signaler"
    >
      <svg className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </button>
  );
}
