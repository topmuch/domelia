'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Professional {
  id: string;
  companyName: string;
  phone: string | null;
  zone: string;
  logo: string | null;
  isVerified: boolean;
  isApproved: boolean;
  partnerBadge: boolean;
  subscriptionType: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
    isActive: boolean;
  };
  services: Array<{
    id: string;
    title: string;
    category: string;
    isActive: boolean;
    isPaid: boolean;
  }>;
  _count: {
    services: number;
    requests: number;
  };
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  verified: number;
  partners: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  demenagement: "🚚",
  garde_meubles: "📦",
  assurance: "🛡️",
  nettoyage: "🧹",
  travaux: "🔧",
  autre: "📋",
};

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [search, setSearch] = useState('');
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState<{ action: string; pro: Professional } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchProfessionals();
  }, [filter, search]);

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/professionals?${params}`);
      const data = await res.json();
      setProfessionals(data.professionals || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (proId: string, action: string, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/professionals/${proId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });

      if (res.ok) {
        fetchProfessionals();
        setShowReasonModal(null);
        setRejectReason('');
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de l\'action');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (proId: string, companyName: string) => {
    if (!confirm(`Supprimer définitivement ${companyName} ? Cette action est irréversible.`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/professionals/${proId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchProfessionals();
        setSelectedPro(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (pro: Professional) => {
    if (!pro.user.isActive) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Suspendu</span>;
    }
    if (!pro.isApproved) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">En attente</span>;
    }
    if (pro.partnerBadge) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">⭐ Partenaire</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Approuvé</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Professionnels</h1>
          <p className="text-gray-500">Gérez les comptes professionnels de la plateforme</p>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ← Retour
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-yellow-200 bg-yellow-50">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-yellow-600">En attente</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-green-200 bg-green-50">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-sm text-green-600">Approuvés</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-blue-200 bg-blue-50">
            <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
            <p className="text-sm text-blue-600">Vérifiés</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-purple-200 bg-purple-50">
            <p className="text-2xl font-bold text-purple-600">{stats.partners}</p>
            <p className="text-sm text-purple-600">Partenaires</p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'pending', label: 'En attente' },
            { key: 'approved', label: 'Approuvés' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
        </div>
      ) : professionals.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-gray-500">Aucun professionnel trouvé</p>
        </div>
      ) : (
        <div className="space-y-4">
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {pro.logo ? (
                    <img src={pro.logo} alt={pro.companyName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🏢</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{pro.companyName}</h3>
                    {getStatusBadge(pro)}
                    {pro.isVerified && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        SIRET vérifié
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{pro.user.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>📍 {pro.zone}</span>
                    <span>📋 {pro._count.services} services</span>
                    <span>📩 {pro._count.requests} demandes</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Inscrit le {new Date(pro.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {!pro.isApproved ? (
                    <>
                      <button
                        onClick={() => handleAction(pro.id, 'approve')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50"
                      >
                        ✓ Approuver
                      </button>
                      <button
                        onClick={() => setShowReasonModal({ action: 'reject', pro })}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 disabled:opacity-50"
                      >
                        ✕ Rejeter
                      </button>
                    </>
                  ) : (
                    <>
                      {pro.user.isActive ? (
                        <button
                          onClick={() => setShowReasonModal({ action: 'suspend', pro })}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 disabled:opacity-50"
                        >
                          Suspendre
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(pro.id, 'activate')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-100 text-green-600 text-sm rounded-lg hover:bg-green-200 disabled:opacity-50"
                        >
                          Réactiver
                        </button>
                      )}
                      {!pro.partnerBadge ? (
                        <button
                          onClick={() => handleAction(pro.id, 'grant_partner')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-purple-100 text-purple-600 text-sm rounded-lg hover:bg-purple-200 disabled:opacity-50"
                        >
                          ⭐ Partenaire
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(pro.id, 'revoke_partner')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                          Retirer badge
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => setSelectedPro(pro)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
                  >
                    👁️ Détails
                  </button>
                </div>
              </div>

              {/* Services */}
              {pro.services.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Services publiés:</p>
                  <div className="flex flex-wrap gap-2">
                    {pro.services.slice(0, 5).map((service) => (
                      <span
                        key={service.id}
                        className={`px-3 py-1 text-xs rounded-full ${
                          service.isActive && service.isPaid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {CATEGORY_ICONS[service.category] || '📋'} {service.title}
                      </span>
                    ))}
                    {pro.services.length > 5 && (
                      <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-500">
                        +{pro.services.length - 5} autres
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal détails */}
      {selectedPro && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPro(null);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">{selectedPro.companyName}</h2>
                <button
                  onClick={() => setSelectedPro(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedPro.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{selectedPro.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Zone d'intervention</p>
                  <p className="font-medium">{selectedPro.zone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Abonnement</p>
                  <p className="font-medium">
                    {selectedPro.subscriptionType === 'monthly'
                      ? 'Mensuel'
                      : selectedPro.subscriptionType === 'per_ad'
                      ? 'À l\'annonce'
                      : 'Aucun'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                {selectedPro.isVerified && (
                  <span className="flex items-center gap-2 text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    SIRET vérifié
                  </span>
                )}
                {selectedPro.partnerBadge && (
                  <span className="flex items-center gap-2 text-purple-600">
                    ⭐ Partenaire officiel
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-semibold mb-3">Actions rapides</h3>
                <div className="flex flex-wrap gap-2">
                  {!selectedPro.isVerified && (
                    <button
                      onClick={() => handleAction(selectedPro.id, 'verify')}
                      className="px-4 py-2 bg-blue-100 text-blue-600 text-sm rounded-lg hover:bg-blue-200"
                    >
                      Vérifier SIRET
                    </button>
                  )}
                  {!selectedPro.partnerBadge && selectedPro.isApproved && (
                    <button
                      onClick={() => handleAction(selectedPro.id, 'grant_partner')}
                      className="px-4 py-2 bg-purple-100 text-purple-600 text-sm rounded-lg hover:bg-purple-200"
                    >
                      Accorder badge partenaire
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedPro.id, selectedPro.companyName)}
                    className="px-4 py-2 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal raison (pour rejet/suspension) */}
      {showReasonModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReasonModal(null);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {showReasonModal.action === 'reject' ? 'Rejeter le compte' : 'Suspendre le compte'}
            </h2>
            <p className="text-gray-600 mb-4">
              {showReasonModal.pro.companyName}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Raison (optionnel)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px]"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowReasonModal(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAction(showReasonModal.pro.id, showReasonModal.action, rejectReason)}
                disabled={actionLoading}
                className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  showReasonModal.action === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {showReasonModal.action === 'reject' ? 'Rejeter' : 'Suspendre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
