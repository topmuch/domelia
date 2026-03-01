'use client';

import { useEffect, useState } from 'react';

interface Stats {
  tenants: number;
  landlords: number;
  pros: number;
  listings: number;
  colocations: number;
  services: number;
  reports: number;
  cities: number;
}

interface Log {
  id: string;
  adminId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  createdAt: string;
}

const KPI_COLORS = [
  { key: 'tenants', label: 'Locataires actifs', color: 'bg-pink-500', bgColor: 'bg-pink-50', textColor: 'text-pink-500' },
  { key: 'listings', label: 'Logements', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-500' },
  { key: 'cities', label: 'Villes couvertes', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-500' },
  { key: 'reports', label: 'Signalements', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-500' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLogs, setRecentLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data.stats);
      setRecentLogs(data.recentLogs || []);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-500">Vue d'ensemble de votre plateforme</p>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_COLORS.map((kpi) => (
          <div
            key={kpi.key}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${kpi.bgColor} rounded-xl flex items-center justify-center`}>
                {kpi.key === 'tenants' && (
                  <svg className={`w-6 h-6 ${kpi.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
                {kpi.key === 'listings' && (
                  <svg className={`w-6 h-6 ${kpi.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )}
                {kpi.key === 'cities' && (
                  <svg className={`w-6 h-6 ${kpi.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {kpi.key === 'reports' && (
                  <svg className={`w-6 h-6 ${kpi.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              {kpi.key === 'reports' && stats && stats[kpi.key as keyof Stats] > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                  Attention
                </span>
              )}
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {stats ? (kpi.key === 'cities' ? `${stats[kpi.key as keyof Stats]}+` : stats[kpi.key as keyof Stats].toLocaleString()) : '—'}
              </p>
              <p className="text-gray-500 text-sm mt-1">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activité sur 7 jours</h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => {
              const heights = [65, 45, 80, 55, 90, 40, 70];
              const colors = ['bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-violet-400', 'bg-orange-400', 'bg-pink-400', 'bg-blue-400'];
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full ${colors[i]} rounded-t-lg transition-all hover:opacity-80`}
                    style={{ height: `${heights[i]}%` }}
                  ></div>
                  <span className="text-xs text-gray-500">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition des utilisateurs</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Locataires</span>
                <span className="font-medium text-pink-500">{stats?.tenants || 0}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-pink-500 rounded-full" 
                  style={{ width: `${stats ? Math.min((stats.tenants / Math.max(stats.tenants + stats.landlords + stats.pros, 1)) * 100, 100) : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Propriétaires</span>
                <span className="font-medium text-blue-500">{stats?.landlords || 0}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${stats ? Math.min((stats.landlords / Math.max(stats.tenants + stats.landlords + stats.pros, 1)) * 100, 100) : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Professionnels</span>
                <span className="font-medium text-green-500">{stats?.pros || 0}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${stats ? Math.min((stats.pros / Math.max(stats.tenants + stats.landlords + stats.pros, 1)) * 100, 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Dernières actions</h3>
        {recentLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  log.action === 'create' ? 'bg-green-100 text-green-500' :
                  log.action === 'update' ? 'bg-blue-100 text-blue-500' :
                  log.action === 'delete' ? 'bg-red-100 text-red-500' :
                  log.action === 'login' ? 'bg-violet-100 text-violet-500' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {log.action === 'create' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                  {log.action === 'update' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                  {log.action === 'delete' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  {log.action === 'login' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {log.action === 'create' && `Création d'un${log.targetType === 'user' ? ' utilisateur' : 'e annonce'}`}
                    {log.action === 'update' && 'Modification'}
                    {log.action === 'delete' && 'Suppression'}
                    {log.action === 'login' && 'Connexion'}
                    {log.action === 'logout' && 'Déconnexion'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  log.targetType === 'user' ? 'bg-pink-100 text-pink-600' :
                  log.targetType === 'landlord' ? 'bg-violet-100 text-violet-600' :
                  log.targetType === 'coloc' ? 'bg-blue-100 text-blue-600' :
                  log.targetType === 'service' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {log.targetType || 'système'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
