'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  tenantProfile?: {
    firstName: string;
    city: string;
    budget: number;
    jobStatus: string;
  } | null;
  listings?: Array<{ id: string; title: string }>;
  services?: Array<{ id: string; title: string }>;
}

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  locataire: { bg: 'bg-pink-100', text: 'text-pink-600' },
  proprietaire: { bg: 'bg-blue-100', text: 'text-blue-600' },
  pro: { bg: 'bg-green-100', text: 'text-green-600' },
  admin: { bg: 'bg-violet-100', text: 'text-violet-600' },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    role: 'locataire',
    email: '',
    password: '',
    name: '',
    firstName: '',
    lastName: '',
    city: 'Paris',
    budget: '800',
    housingType: 'studio',
    jobStatus: 'cdi',
    hasGuarantor: false,
    urgency: 'flexible',
    description: '',
    phone: '',
    siret: '',
    company: '',
    listingType: 'logement',
    title: '',
    location: '',
    price: '',
    category: 'autre',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?role=${filter}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!modalData.email || !modalData.password) {
      alert('Email et mot de passe requis');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modalData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowModal(false);
        setModalData({
          role: 'locataire',
          email: '',
          password: '',
          name: '',
          firstName: '',
          lastName: '',
          city: 'Paris',
          budget: '800',
          housingType: 'studio',
          jobStatus: 'cdi',
          hasGuarantor: false,
          urgency: 'flexible',
          description: '',
          phone: '',
          siret: '',
          company: '',
          listingType: 'logement',
          title: '',
          location: '',
          price: '',
          category: 'autre',
        });
        fetchUsers();
      } else {
        alert(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Create user error:', error);
      alert('Erreur serveur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Toggle active error:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Delete user error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
          <p className="text-gray-500">Créer ou gérer les comptes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-xl transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Créer un compte
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'locataire', 'proprietaire', 'pro', 'admin'].map((role) => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === role
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {role === 'all' ? 'Tous' : role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucun utilisateur trouvé
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Rôle</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Statut</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        user.role === 'locataire' ? 'bg-pink-500' :
                        user.role === 'proprietaire' ? 'bg-blue-500' :
                        user.role === 'pro' ? 'bg-green-500' :
                        'bg-violet-500'
                      }`}>
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name || user.tenantProfile?.firstName || '—'}</p>
                        {user.tenantProfile && (
                          <p className="text-xs text-gray-500">{user.tenantProfile.city} • {user.tenantProfile.budget}€</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[user.role]?.bg || 'bg-gray-100'} ${ROLE_COLORS[user.role]?.text || 'text-gray-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          user.isActive
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive ? 'Suspendre' : 'Activer'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Créer un compte</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de compte</label>
                <div className="grid grid-cols-3 gap-2">
                  {['locataire', 'proprietaire', 'pro'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setModalData({ ...modalData, role })}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        modalData.role === role
                          ? `${ROLE_COLORS[role].bg} ${ROLE_COLORS[role].text} border-2 border-current`
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={modalData.email}
                    onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    placeholder="email@exemple.fr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                  <input
                    type="password"
                    value={modalData.password}
                    onChange={(e) => setModalData({ ...modalData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  placeholder="Nom complet"
                />
              </div>

              {/* Tenant Fields */}
              {modalData.role === 'locataire' && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-gray-800">Informations locataire</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        value={modalData.firstName}
                        onChange={(e) => setModalData({ ...modalData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        value={modalData.lastName}
                        onChange={(e) => setModalData({ ...modalData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ville recherchée</label>
                      <input
                        type="text"
                        value={modalData.city}
                        onChange={(e) => setModalData({ ...modalData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                        placeholder="Paris, Lyon..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        value={modalData.phone}
                        onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                        placeholder="06 XX XX XX XX"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Budget mensuel (€)</label>
                      <input
                        type="number"
                        value={modalData.budget}
                        onChange={(e) => setModalData({ ...modalData, budget: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type de bien</label>
                      <select
                        value={modalData.housingType}
                        onChange={(e) => setModalData({ ...modalData, housingType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      >
                        <option value="">Non spécifié</option>
                        <option value="studio">Studio</option>
                        <option value="t1">T1</option>
                        <option value="t2">T2</option>
                        <option value="t3">T3</option>
                        <option value="t4">T4</option>
                        <option value="appartement">Appartement</option>
                        <option value="maison">Maison</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Situation professionnelle</label>
                      <select
                        value={modalData.jobStatus}
                        onChange={(e) => setModalData({ ...modalData, jobStatus: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      >
                        <option value="cdi">CDI</option>
                        <option value="cdd">CDD</option>
                        <option value="etudiant">Étudiant</option>
                        <option value="independant">Indépendant</option>
                        <option value="retraite">Retraité</option>
                        <option value="sans_emploi">En recherche d'emploi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Urgence de recherche</label>
                      <select
                        value={modalData.urgency}
                        onChange={(e) => setModalData({ ...modalData, urgency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      >
                        <option value="immediate">🔥 Immédiate</option>
                        <option value="1_mois">📅 Dans 1 mois</option>
                        <option value="2_mois">📅 Dans 2 mois</option>
                        <option value="flexible">⏳ Flexible</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      id="hasGuarantor"
                      checked={modalData.hasGuarantor}
                      onChange={(e) => setModalData({ ...modalData, hasGuarantor: e.target.checked })}
                      className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <label htmlFor="hasGuarantor" className="text-sm font-medium text-gray-700">
                      ✅ Peut fournir un garant
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description / Présentation</label>
                    <textarea
                      value={modalData.description}
                      onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
                      placeholder="Présentez ce locataire aux propriétaires..."
                    />
                  </div>
                </div>
              )}

              {/* Landlord Fields */}
              {modalData.role === 'proprietaire' && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-gray-800">Informations logement</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={modalData.listingType}
                        onChange={(e) => setModalData({ ...modalData, listingType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="logement">Logement</option>
                        <option value="parking">Parking</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                      <input
                        type="text"
                        value={modalData.location}
                        onChange={(e) => setModalData({ ...modalData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                      <input
                        type="text"
                        value={modalData.title}
                        onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Studio centre-ville..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prix (€)</label>
                      <input
                        type="number"
                        value={modalData.price}
                        onChange={(e) => setModalData({ ...modalData, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pro Fields */}
              {modalData.role === 'pro' && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-gray-800">Informations professionnelles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                      <input
                        type="text"
                        value={modalData.company}
                        onChange={(e) => setModalData({ ...modalData, company: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SIRET</label>
                      <input
                        type="text"
                        value={modalData.siret}
                        onChange={(e) => setModalData({ ...modalData, siret: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                      <select
                        value={modalData.category}
                        onChange={(e) => setModalData({ ...modalData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      >
                        <option value="demenagement">Déménagement</option>
                        <option value="assurance">Assurance</option>
                        <option value="bricolage">Bricolage</option>
                        <option value="menage">Ménage</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zone d'intervention</label>
                      <input
                        type="text"
                        value={modalData.city}
                        onChange={(e) => setModalData({ ...modalData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        placeholder="Paris et région"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateUser}
                disabled={submitting}
                className="px-4 py-2 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Création...' : 'Créer le compte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
