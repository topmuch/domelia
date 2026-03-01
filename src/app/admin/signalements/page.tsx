'use client';

import { useEffect, useState } from 'react';

interface Report {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string | null;
  status: string;
  internalNote: string | null;
  createdAt: string;
  reporter?: {
    email: string;
    name: string | null;
  } | null;
  handler?: {
    email: string;
    name: string | null;
  } | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  nouveau: { bg: 'bg-red-100', text: 'text-red-600' },
  en_cours: { bg: 'bg-orange-100', text: 'text-orange-600' },
  resolu: { bg: 'bg-green-100', text: 'text-green-600' },
};

const TARGET_COLORS: Record<string, { bg: string; text: string }> = {
  user: { bg: 'bg-pink-100', text: 'text-pink-600' },
  listing: { bg: 'bg-violet-100', text: 'text-violet-600' },
  service: { bg: 'bg-green-100', text: 'text-green-600' },
  coloc: { bg: 'bg-blue-100', text: 'text-blue-600' },
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${filter}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reportId, status: newStatus, internalNote: note }),
      });

      if (res.ok) {
        setShowModal(false);
        setSelectedReport(null);
        setNote('');
        fetchReports();
      }
    } catch (error) {
      console.error('Update report error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (report: Report) => {
    setSelectedReport(report);
    setNote(report.internalNote || '');
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Signalements</h1>
        <p className="text-gray-500">Gérer les signalements de la plateforme</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Tous' },
          { value: 'nouveau', label: 'Nouveaux' },
          { value: 'en_cours', label: 'En cours' },
          { value: 'resolu', label: 'Résolus' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === f.value
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Aucun signalement
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const statusColors = STATUS_COLORS[report.status] || STATUS_COLORS.nouveau;
            const targetColors = TARGET_COLORS[report.targetType] || TARGET_COLORS.user;
            
            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${targetColors.bg} rounded-xl flex items-center justify-center`}>
                      <svg className={`w-6 h-6 ${targetColors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{report.reason}</h3>
                      <p className="text-sm text-gray-500">
                        Signalé par {report.reporter?.name || report.reporter?.email || 'Anonyme'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${targetColors.bg} ${targetColors.text}`}>
                      {report.targetType}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors.bg} ${statusColors.text}`}>
                      {report.status === 'nouveau' ? 'Nouveau' : report.status === 'en_cours' ? 'En cours' : 'Résolu'}
                    </span>
                  </div>
                </div>
                
                {report.description && (
                  <p className="text-gray-600 mb-4 p-4 bg-gray-50 rounded-xl">
                    {report.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    {new Date(report.createdAt).toLocaleString('fr-FR')}
                  </p>
                  <button
                    onClick={() => openModal(report)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors"
                  >
                    Traiter
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Traiter le signalement</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Raison</p>
                <p className="text-gray-800">{selectedReport.reason}</p>
              </div>
              
              {selectedReport.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                  <p className="text-gray-600">{selectedReport.description}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Type de cible</p>
                <p className="text-gray-800 capitalize">{selectedReport.targetType}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Note interne</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="Ajouter une note interne..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-between">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedReport(null);
                  setNote('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
              <div className="flex gap-2">
                {selectedReport.status !== 'resolu' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'resolu')}
                    disabled={submitting}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    Marquer résolu
                  </button>
                )}
                {selectedReport.status === 'nouveau' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'en_cours')}
                    disabled={submitting}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    En cours
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
