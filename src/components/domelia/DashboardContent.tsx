"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Home,
  Heart,
  Settings,
  LogOut,
  Eye,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  MapPin,
  Euro,
  Building,
  Users,
  Briefcase,
  Loader2,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tenantProfile: {
    id: string;
    firstName: string;
    lastName: string | null;
    city: string;
    budget: number;
    jobStatus: string;
    description: string | null;
    views: number;
  } | null;
}

interface Listing {
  id: string;
  title: string;
  type?: string;
  category: string;
  location: string;
  price?: number;
  isActive: boolean;
  views: number;
  createdAt: string;
  photos?: string[];
}

interface DashboardData {
  user: UserProfile;
  tenantProfile: UserProfile["tenantProfile"];
  listings: Listing[];
  stats: {
    totalViews: number;
    activeListings: number;
    totalListings: number;
  };
}

interface DashboardContentProps {
  user: UserProfile;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profil");
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard/profile");
        if (response.ok) {
          const dashboardData = await response.json();
          setData(dashboardData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des donnees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la deconnexion:", error);
    }
  };

  const handleToggleListing = async (listingId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        // Recharger les donnees
        const profileResponse = await fetch("/api/dashboard/profile");
        if (profileResponse.ok) {
          const newData = await profileResponse.json();
          setData(newData);
        }
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Etes-vous sur de vouloir supprimer cette annonce ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Recharger les donnees
        const profileResponse = await fetch("/api/dashboard/profile");
        if (profileResponse.ok) {
          const newData = await profileResponse.json();
          setData(newData);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const tabs = [
    { id: "profil", label: "Mon profil", icon: User },
    { id: "annonces", label: "Mes annonces", icon: Home },
    { id: "favoris", label: "Mes favoris", icon: Heart },
    { id: "parametres", label: "Parametres", icon: Settings },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "logement":
        return Building;
      case "colocation":
        return Users;
      case "service":
        return Briefcase;
      default:
        return Home;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "logement":
        return "Logement";
      case "colocation":
        return "Colocation";
      case "service":
        return "Service";
      default:
        return category;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-luxe sticky top-0 z-50">
        <div className="container-domelia">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#560591] flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="font-bold text-xl text-[#1E293B]">
                Domelia<span className="text-[#560591]">.fr</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-[#475569] hidden sm:block">
                Bonjour, <span className="font-semibold text-[#1E293B]">{user.name || user.email}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-[#475569] hover:text-[#560591] transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Deconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-domelia py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-luxe p-6 hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#560591]/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-[#560591]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E293B]">{data?.stats.totalViews || 0}</p>
                <p className="text-sm text-[#475569]">Vues totales</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-luxe p-6 hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E293B]">0</p>
                <p className="text-sm text-[#475569]">Messages</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-luxe p-6 hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                <Home className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E293B]">{data?.stats.activeListings || 0}</p>
                <p className="text-sm text-[#475569]">Annonces actives</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-luxe p-6 hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E293B]">0</p>
                <p className="text-sm text-[#475569]">Favoris</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-luxe mb-6 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-[#F1F5F9]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-[#560591] border-b-2 border-[#560591] bg-[#FAF5FF]"
                      : "text-[#475569] hover:text-[#1E293B] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-luxe p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#560591]" />
            </div>
          ) : (
            <>
              {/* Mon Profil Tab */}
              {activeTab === "profil" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1E293B]">Mon profil</h2>
                    <Link
                      href={data?.tenantProfile ? `/modifier-profil/${data.tenantProfile.id}` : "/je-cherche"}
                      className="flex items-center gap-2 bg-[#560591] text-white px-4 py-2 rounded-xl hover:bg-[#3D0466] transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      {data?.tenantProfile ? "Modifier mon profil" : "Creer mon profil de recherche"}
                    </Link>
                  </div>

                  {data?.tenantProfile ? (
                    <div className="bg-[#FAF5FF] rounded-xl p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-[#475569]">Prenom</p>
                          <p className="font-semibold text-[#1E293B]">{data.tenantProfile.firstName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#475569]">Nom</p>
                          <p className="font-semibold text-[#1E293B]">{data.tenantProfile.lastName || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#475569]">Ville recherchee</p>
                          <p className="font-semibold text-[#1E293B]">{data.tenantProfile.city}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#475569]">Budget</p>
                          <p className="font-semibold text-[#1E293B]">{data.tenantProfile.budget} EUR/mois</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#475569]">Situation professionnelle</p>
                          <p className="font-semibold text-[#1E293B]">{data.tenantProfile.jobStatus}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#475569]">Vues du profil</p>
                          <p className="font-semibold text-[#1E293B]">{data.tenantProfile.views}</p>
                        </div>
                      </div>
                      {data.tenantProfile.description && (
                        <div>
                          <p className="text-sm text-[#475569]">Description</p>
                          <p className="text-[#1E293B]">{data.tenantProfile.description}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <User className="w-16 h-16 mx-auto text-[#94A3B8] mb-4" />
                      <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                        Aucun profil de recherche cree
                      </h3>
                      <p className="text-[#475569] mb-6">
                        Creez votre profil de recherche pour etre visible par les proprietaires
                      </p>
                      <Link
                        href="/je-cherche"
                        className="inline-flex items-center gap-2 bg-[#560591] text-white px-6 py-3 rounded-xl hover:bg-[#3D0466] transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Creer mon profil de recherche
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Mes Annonces Tab */}
              {activeTab === "annonces" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1E293B]">Mes annonces</h2>
                    <Link
                      href="/je-loue"
                      className="flex items-center gap-2 bg-[#560591] text-white px-4 py-2 rounded-xl hover:bg-[#3D0466] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Publier une annonce
                    </Link>
                  </div>

                  {data?.listings && data.listings.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {data.listings.map((listing) => {
                        const CategoryIcon = getCategoryIcon(listing.category);
                        return (
                          <div
                            key={listing.id}
                            className={`border rounded-xl p-4 transition-all ${
                              listing.isActive
                                ? "border-[#EDE9FE] bg-white hover:shadow-luxe"
                                : "border-[#F1F5F9] bg-[#F8FAFC]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  listing.isActive ? "bg-[#560591]/10" : "bg-[#94A3B8]/10"
                                }`}>
                                  <CategoryIcon className={`w-6 h-6 ${
                                    listing.isActive ? "text-[#560591]" : "text-[#94A3B8]"
                                  }`} />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-[#1E293B]">{listing.title}</h3>
                                  <div className="flex items-center gap-4 mt-1 text-sm text-[#475569]">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {listing.location}
                                    </span>
                                    {listing.price && (
                                      <span className="flex items-center gap-1">
                                        <Euro className="w-4 h-4" />
                                        {listing.price} EUR
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-4 h-4" />
                                      {listing.views} vues
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      listing.isActive
                                        ? "bg-[#10B981]/10 text-[#10B981]"
                                        : "bg-[#94A3B8]/10 text-[#94A3B8]"
                                    }`}>
                                      {listing.isActive ? "Actif" : "Inactif"}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED]">
                                      {getCategoryLabel(listing.category)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/annonce/logement/${listing.id}`}
                                  className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#475569] hover:text-[#560591] transition-colors"
                                  title="Voir"
                                >
                                  <Eye className="w-5 h-5" />
                                </Link>
                                <button
                                  onClick={() => handleToggleListing(listing.id, listing.isActive)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    listing.isActive
                                      ? "hover:bg-red-50 text-[#475569] hover:text-red-600"
                                      : "hover:bg-green-50 text-[#475569] hover:text-green-600"
                                  }`}
                                  title={listing.isActive ? "Desactiver" : "Activer"}
                                >
                                  {listing.isActive ? (
                                    <PowerOff className="w-5 h-5" />
                                  ) : (
                                    <Power className="w-5 h-5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteListing(listing.id)}
                                  className="p-2 rounded-lg hover:bg-red-50 text-[#475569] hover:text-red-600 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Home className="w-16 h-16 mx-auto text-[#94A3B8] mb-4" />
                      <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                        Aucune annonce publiee
                      </h3>
                      <p className="text-[#475569] mb-6">
                        Publiez votre premiere annonce pour trouver des locataires
                      </p>
                      <Link
                        href="/je-loue"
                        className="inline-flex items-center gap-2 bg-[#560591] text-white px-6 py-3 rounded-xl hover:bg-[#3D0466] transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Publier une annonce
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Favoris Tab */}
              {activeTab === "favoris" && (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 mx-auto text-[#94A3B8] mb-4" />
                  <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                    Aucun favori enregistre
                  </h3>
                  <p className="text-[#475569]">
                    Les annonces que vous aimez apparaitront ici
                  </p>
                </div>
              )}

              {/* Parametres Tab */}
              {activeTab === "parametres" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#1E293B]">Parametres du compte</h2>

                  <div className="space-y-4">
                    <div className="bg-[#FAF5FF] rounded-xl p-4">
                      <h3 className="font-semibold text-[#1E293B] mb-2">Informations personnelles</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-[#475569]">Email:</span> {user.email}</p>
                        <p><span className="text-[#475569]">Nom:</span> {user.name || "Non defini"}</p>
                        <p><span className="text-[#475569]">Role:</span> {user.role}</p>
                      </div>
                    </div>

                    <div className="bg-[#FAF5FF] rounded-xl p-4">
                      <h3 className="font-semibold text-[#1E293B] mb-2">Notifications</h3>
                      <p className="text-sm text-[#475569]">
                        Gerez vos preferences de notifications (bientot disponible)
                      </p>
                    </div>

                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <h3 className="font-semibold text-red-700 mb-2">Zone de danger</h3>
                      <p className="text-sm text-red-600 mb-4">
                        Ces actions sont irreversibles
                      </p>
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                        Supprimer mon compte
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
