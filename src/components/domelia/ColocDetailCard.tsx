// Composant carte détaillée colocation - Domelia.fr
"use client";

interface ColocDetailCardProps {
  listing: {
    id: string;
    type: string;
    title: string;
    description?: string | null;
    location: string;
    address?: string | null;
    price: number;
    surface?: number | null;
    photos?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    createdAt: Date;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      initials?: string;
      isVerified?: boolean;
    } | null;
  };
}

export function ColocDetailCard({ listing }: ColocDetailCardProps) {
  const isChambre = listing.type === "chambre";
  const photos = listing.photos ? JSON.parse(listing.photos) : [];
  const mainPhoto = photos[0] || null;

  // Badge style
  const getBadgeStyle = () => {
    if (isChambre) {
      return { bg: "bg-orange-500", label: "🛏️ Chambre en colocation" };
    }
    return { bg: "bg-blue-500", label: "🔍 Recherche colocataire" };
  };
  const badge = getBadgeStyle();

  return (
    <div className="space-y-6">
      {/* Créateur */}
      {listing.user && (
        <div className="bg-white rounded-2xl shadow-luxe p-6">
          <h3 className="text-lg font-bold text-[#1E293B] mb-4">Publié par</h3>
          <div className="flex items-center gap-4">
            {/* Avatar avec initiale */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#560591] to-[#7C3AED] flex items-center justify-center text-white text-xl font-bold">
              {listing.user.initials || listing.user.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1E293B]">
                  {listing.user.name || "Anonyme"}
                </span>
                {/* Badge vérifié */}
                {listing.user.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-[#ECFDF5] text-[#10B981] text-xs font-medium px-2 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Vérifié
                  </span>
                )}
              </div>
              <p className="text-sm text-[#94A3B8]">
                Membre depuis le {new Date(listing.createdAt).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informations clés */}
      <div className="bg-white rounded-2xl shadow-luxe p-6">
        <h3 className="text-lg font-bold text-[#1E293B] mb-4">Informations clés</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#560591]">{listing.price}€</p>
            <p className="text-sm text-[#94A3B8]">/mois</p>
          </div>
          {listing.surface && (
            <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#560591]">{listing.surface}</p>
              <p className="text-sm text-[#94A3B8]">m²</p>
            </div>
          )}
          <div className="bg-[#F8FAFC] rounded-xl p-4 text-center col-span-2">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-[#560591]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium text-[#1E293B]">{listing.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Type badge */}
      <div className={`inline-flex items-center gap-2 ${badge.bg} text-white font-semibold px-4 py-2 rounded-full`}>
        {badge.label}
      </div>
    </div>
  );
}
