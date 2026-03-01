// Formulaire d'inscription - Domelia.fr
"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("locataire");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      // Redirection vers le dashboard avec rechargement complet
      window.location.href = "/dashboard";
    } catch {
      setError("Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Nom */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[#1E293B] mb-2">
          Nom complet
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Marie Dupont"
          className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#560591] focus:border-transparent transition-all"
          required
          disabled={isLoading}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#1E293B] mb-2">
          Adresse email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="marie@exemple.fr"
          className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#560591] focus:border-transparent transition-all"
          required
          disabled={isLoading}
        />
      </div>

      {/* Mot de passe */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#1E293B] mb-2">
          Mot de passe
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-12 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#560591] focus:border-transparent transition-all"
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
        <p className="text-xs text-[#94A3B8] mt-1">Minimum 6 caractères</p>
      </div>

      {/* Rôle */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-[#1E293B] mb-2">
          Je suis
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#560591] focus:border-transparent transition-all"
          disabled={isLoading}
        >
          <option value="locataire">À la recherche d'un logement</option>
          <option value="proprietaire">Propriétaire / Loueur</option>
        </select>
      </div>

      {/* CGU */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="cgu"
          name="cgu"
          className="mt-1 w-4 h-4 text-[#560591] border-[#F1F5F9] rounded focus:ring-[#560591]"
          required
          disabled={isLoading}
        />
        <label htmlFor="cgu" className="text-sm text-[#475569]">
          J'accepte les{" "}
          <a href="#" className="text-[#560591] hover:underline">
            conditions générales
          </a>{" "}
          et la{" "}
          <a href="#" className="text-[#560591] hover:underline">
            politique de confidentialité
          </a>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#560591] text-white font-semibold py-3.5 rounded-xl transition-all duration-300 hover:bg-[#3D0466] hover:shadow-lg btn-shimmer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Inscription en cours...
          </>
        ) : (
          "Créer mon compte"
        )}
      </button>
    </form>
  );
}
