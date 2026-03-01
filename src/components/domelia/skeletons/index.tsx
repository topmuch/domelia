// Skeleton loaders - Domelia.fr
// Composants skeleton avec animation shimmer pour le chargement

import { cn } from "@/lib/utils";

// Base skeleton avec animation shimmer
function SkeletonBase({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-gray-200 dark:bg-slate-700",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r",
        "before:from-transparent before:via-white/20 before:to-transparent",
        className
      )}
    />
  );
}

// Skeleton pour TenantCard
export function TenantCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border-l-4 border-l-gray-200 dark:border-l-slate-600 shadow-sm overflow-hidden">
      {/* Image placeholder */}
      <div className="relative h-40 bg-gray-100 dark:bg-slate-700">
        <SkeletonBase className="absolute inset-0 rounded-none" />
      </div>

      {/* Contenu */}
      <div className="p-5">
        {/* En-tête avec avatar */}
        <div className="flex items-center gap-3 mb-4">
          <SkeletonBase className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <SkeletonBase className="h-5 w-24 mb-2" />
            <SkeletonBase className="h-4 w-32" />
          </div>
        </div>

        {/* Budget */}
        <div className="mb-3">
          <SkeletonBase className="h-7 w-28" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <SkeletonBase className="h-6 w-16 rounded-full" />
          <SkeletonBase className="h-6 w-20 rounded-full" />
          <SkeletonBase className="h-6 w-14 rounded-full" />
        </div>

        {/* CTA */}
        <SkeletonBase className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

// Skeleton pour ListingCard
export function ListingCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Image */}
      <div className="relative h-48">
        <SkeletonBase className="absolute inset-0 rounded-none" />
        {/* Badge placeholder */}
        <div className="absolute top-3 left-3">
          <SkeletonBase className="h-6 w-24 rounded-full" />
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5">
        {/* Titre */}
        <SkeletonBase className="h-6 w-3/4 mb-3" />

        {/* Localisation */}
        <div className="flex items-center gap-2 mb-3">
          <SkeletonBase className="h-4 w-4 rounded-full" />
          <SkeletonBase className="h-4 w-40" />
        </div>

        {/* Prix */}
        <div className="mb-4">
          <SkeletonBase className="h-7 w-24" />
        </div>

        {/* CTA */}
        <SkeletonBase className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

// Skeleton pour ServiceCard
export function ServiceCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header avec logo */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-4">
          <SkeletonBase className="w-16 h-16 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <SkeletonBase className="h-5 w-32 mb-2" />
            <SkeletonBase className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 pb-3">
        <SkeletonBase className="h-4 w-full mb-2" />
        <SkeletonBase className="h-4 w-2/3" />
      </div>

      {/* Badges */}
      <div className="px-5 pb-3 flex flex-wrap gap-2">
        <SkeletonBase className="h-5 w-20 rounded-full" />
        <SkeletonBase className="h-5 w-12 rounded-full" />
        <SkeletonBase className="h-5 w-16 rounded-full" />
      </div>

      {/* Prix et CTA */}
      <div className="px-5 pb-5 flex items-center justify-between gap-3">
        <SkeletonBase className="h-5 w-28" />
        <SkeletonBase className="h-11 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

// Skeleton pour ColocationCard
export function ColocationCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Image ou Avatar */}
      <div className="relative h-40 bg-gray-100 dark:bg-slate-700">
        <SkeletonBase className="absolute inset-0 rounded-none" />
        {/* Badge */}
        <div className="absolute top-3 left-3">
          <SkeletonBase className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5">
        {/* Titre */}
        <SkeletonBase className="h-6 w-full mb-2" />

        {/* Localisation */}
        <div className="flex items-center gap-2 mb-3">
          <SkeletonBase className="h-4 w-4 rounded-full" />
          <SkeletonBase className="h-4 w-32" />
        </div>

        {/* Budget */}
        <div className="mb-4">
          <SkeletonBase className="h-7 w-20" />
        </div>

        {/* CTA */}
        <SkeletonBase className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

// Skeleton pour la navbar
export function NavbarSkeleton() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md">
      <div className="container-domelia">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <SkeletonBase className="w-10 h-10 rounded-xl" />
            <SkeletonBase className="h-6 w-24" />
          </div>

          {/* Liens navigation */}
          <div className="hidden md:flex items-center gap-6">
            <SkeletonBase className="h-4 w-16" />
            <SkeletonBase className="h-4 w-20" />
            <SkeletonBase className="h-4 w-14" />
            <SkeletonBase className="h-4 w-16" />
          </div>

          {/* Boutons */}
          <div className="flex items-center gap-3">
            <SkeletonBase className="h-9 w-20 rounded-lg hidden sm:block" />
            <SkeletonBase className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    </nav>
  );
}

// Grille de skeletons pour les listes
interface SkeletonGridProps {
  count?: number;
  skeleton: "tenant" | "listing" | "service" | "colocation";
  className?: string;
}

export function SkeletonGrid({ count = 6, skeleton, className = "" }: SkeletonGridProps) {
  const skeletons = {
    tenant: TenantCardSkeleton,
    listing: ListingCardSkeleton,
    service: ServiceCardSkeleton,
    colocation: ColocationCardSkeleton,
  };

  const SkeletonComponent = skeletons[skeleton];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
}

// Skeleton pour HeroSection
export function HeroSkeleton() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gray-100 dark:bg-slate-900">
      <div className="container-domelia relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <SkeletonBase className="h-10 w-48 rounded-full mx-auto mb-8" />

          {/* Titre principal */}
          <SkeletonBase className="h-16 w-full max-w-2xl mx-auto mb-6" />

          {/* Sous-titre */}
          <SkeletonBase className="h-8 w-full max-w-xl mx-auto mb-10" />

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SkeletonBase className="h-14 w-56 rounded-2xl" />
            <SkeletonBase className="h-14 w-48 rounded-2xl" />
          </div>

          {/* Statistiques */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto">
            <SkeletonBase className="h-20 w-full" />
            <SkeletonBase className="h-20 w-full" />
            <SkeletonBase className="h-20 w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
