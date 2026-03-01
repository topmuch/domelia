// Skeleton Cards - Domelia.fr

export function TenantCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxe overflow-hidden animate-pulse">
      <div className="h-40 bg-gradient-to-br from-[#FAF5FF] to-[#EDE9FE] dark:from-slate-700 dark:to-slate-600" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16" />
          </div>
        </div>
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-3" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-16" />
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-12" />
        </div>
        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxe overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-slate-700" />
      <div className="p-5">
        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-3" />
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-20" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxe p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-slate-700" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-2" />
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32" />
        </div>
      </div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-16" />
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-20" />
      </div>
    </div>
  );
}

export function ColocCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-luxe overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200 dark:bg-slate-700" />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-full w-16" />
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-full w-12" />
        </div>
        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-3" />
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-20" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

// Grille de skeletons
export function TenantGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <TenantCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
