// Formulaire multi-étapes pour déposer un service - Domelia.fr
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { id: "demenagement", label: "Déménagement", icon: "🚚" },
  { id: "assurance", label: "Assurance", icon: "🛡️" },
  { id: "bricolage", label: "Bricolage", icon: "🔧" },
  { id: "menage", label: "Ménage", icon: "🧹" },
  { id: "stockage", label: "Stockage", icon: "📦" },
  { id: "autre", label: "Autre", icon: "📋" },
];

const zones = [
  "France entière",
  "Île-de-France",
  "Grandes villes",
  "Paris",
  "Lyon",
  "Marseille",
  "Bordeaux",
  "Toulouse",
  "Nice",
  "Nantes",
  "Strasbourg",
];

interface FormData {
  category: string;
  company: string;
  siret: string;
  title: string;
  description: string;
  zone: string;
  price: string;
  priceOnQuote: boolean;
  photo: string;
}

export function ServiceForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    category: "",
    company: "",
    siret: "",
    title: "",
    description: "",
    zone: "",
    price: "",
    priceOnQuote: false,
    photo: "",
  });

  const progress = (step / 3) * 100;

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.category) {
          setError("Veuillez sélectionner une catégorie");
          return false;
        }
        if (!formData.company.trim()) {
          setError("Le nom de l'entreprise est requis");
          return false;
        }
        break;
      case 2:
        if (!formData.title.trim()) {
          setError("Le titre est requis");
          return false;
        }
        if (!formData.zone) {
          setError("Veuillez sélectionner une zone d'intervention");
          return false;
        }
        break;
      case 3:
        if (!formData.priceOnQuote && !formData.price) {
          setError("Veuillez indiquer un prix ou cocher 'Sur devis'");
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du service");
      }

      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-luxe p-6 md:p-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#475569]">Étape {step} sur 3</span>
          <span className="text-sm text-[#94A3B8]">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-[#F8FAFC]" />
      </div>

      {/* Étape 1: Type de service */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B] mb-2">
              Type de service
            </h2>
            <p className="text-[#475569]">
              Sélectionnez la catégorie de votre service et renseignez les informations de votre entreprise.
            </p>
          </div>

          {/* Catégorie */}
          <div>
            <Label className="text-sm font-semibold text-[#475569] mb-3 block">
              Catégorie de service *
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateField("category", cat.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    formData.category === cat.id
                      ? "border-[#10B981] bg-[#ECFDF5]"
                      : "border-[#E2E8F0] bg-white hover:border-[#10B981]/50"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{cat.icon}</span>
                  <span className="font-medium text-[#1E293B]">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nom entreprise */}
          <div>
            <Label htmlFor="company" className="text-sm font-semibold text-[#475569] mb-2 block">
              Nom de l&apos;entreprise *
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => updateField("company", e.target.value)}
              placeholder="Ex: Déménagement Express"
              className="w-full"
            />
          </div>

          {/* SIRET */}
          <div>
            <Label htmlFor="siret" className="text-sm font-semibold text-[#475569] mb-2 block">
              Numéro SIRET (optionnel)
            </Label>
            <Input
              id="siret"
              value={formData.siret}
              onChange={(e) => updateField("siret", e.target.value)}
              placeholder="Ex: 123 456 789 00012"
              className="w-full"
            />
            <p className="text-xs text-[#94A3B8] mt-1">
              Le SIRET permet de vérifier votre entreprise et renforce la confiance des utilisateurs.
            </p>
          </div>
        </div>
      )}

      {/* Étape 2: Détails */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B] mb-2">
              Description du service
            </h2>
            <p className="text-[#475569]">
              Décrivez en détail votre service pour attirer les clients.
            </p>
          </div>

          {/* Titre */}
          <div>
            <Label htmlFor="title" className="text-sm font-semibold text-[#475569] mb-2 block">
              Titre de l&apos;annonce *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Ex: Déménagement professionnel complet"
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-semibold text-[#475569] mb-2 block">
              Description détaillée
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Décrivez vos services, vos tarifs, vos garanties..."
              rows={5}
              className="w-full"
            />
          </div>

          {/* Zone */}
          <div>
            <Label className="text-sm font-semibold text-[#475569] mb-2 block">
              Zone d&apos;intervention *
            </Label>
            <Select value={formData.zone} onValueChange={(v) => updateField("zone", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez une zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Étape 3: Prix et photo */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B] mb-2">
              Tarification et visuel
            </h2>
            <p className="text-[#475569]">
              Définissez vos tarifs et ajoutez une photo pour votre annonce.
            </p>
          </div>

          {/* Prix */}
          <div>
            <Label className="text-sm font-semibold text-[#475569] mb-3 block">
              Tarification
            </Label>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="priceOnQuote"
                  checked={formData.priceOnQuote}
                  onCheckedChange={(checked) => {
                    updateField("priceOnQuote", checked === true);
                    if (checked) updateField("price", "");
                  }}
                />
                <Label htmlFor="priceOnQuote" className="text-sm text-[#475569]">
                  Sur devis uniquement
                </Label>
              </div>
            </div>

            {!formData.priceOnQuote && (
              <div className="flex items-center gap-3">
                <span className="text-[#475569]">À partir de</span>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder="350"
                  className="w-32"
                />
                <span className="text-[#475569]">€</span>
              </div>
            )}
          </div>

          {/* Photo */}
          <div>
            <Label htmlFor="photo" className="text-sm font-semibold text-[#475569] mb-2 block">
              Photo / Logo (optionnel)
            </Label>
            <Input
              id="photo"
              type="url"
              value={formData.photo}
              onChange={(e) => updateField("photo", e.target.value)}
              placeholder="https://exemple.com/votre-logo.png"
              className="w-full"
            />
            <p className="text-xs text-[#94A3B8] mt-1">
              Entrez l&apos;URL d&apos;une image ou logo pour votre entreprise.
            </p>
          </div>

          {/* Récapitulatif */}
          <div className="bg-[#ECFDF5] rounded-xl p-4 border border-[#10B981]/20">
            <h3 className="font-semibold text-[#1E293B] mb-3">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-[#475569]">Catégorie:</span>
                <span className="font-medium text-[#1E293B]">
                  {categories.find((c) => c.id === formData.category)?.label}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-[#475569]">Entreprise:</span>
                <span className="font-medium text-[#1E293B]">{formData.company}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-[#475569]">Titre:</span>
                <span className="font-medium text-[#1E293B]">{formData.title}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-[#475569]">Zone:</span>
                <span className="font-medium text-[#1E293B]">{formData.zone}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-[#475569]">Prix:</span>
                <span className="font-medium text-[#1E293B]">
                  {formData.priceOnQuote ? "Sur devis" : `${formData.price} €`}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E2E8F0]">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={isSubmitting}
          >
            ← Précédent
          </Button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <Button
            onClick={nextStep}
            className="bg-[#10B981] text-white hover:bg-[#059669]"
          >
            Suivant →
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#10B981] text-white hover:bg-[#059669]"
          >
            {isSubmitting ? "Publication en cours..." : "Publier mon annonce"}
          </Button>
        )}
      </div>
    </div>
  );
}
