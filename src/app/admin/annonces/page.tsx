'use client';

import { useEffect, useState, useRef } from 'react';

interface Listing {
  id: string;
  listingType: 'landlord' | 'coloc' | 'service';
  type?: string;
  title: string;
  location?: string;
  price?: number;
  surface?: number;
  category?: string;
  company?: string;
  photos?: string | null;
  isActive: boolean;
  createdAt: string;
  user?: {
    email: string;
    name: string | null;
  };
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  logement: { bg: 'bg-violet-100', text: 'text-violet-600' },
  colocation: { bg: 'bg-blue-100', text: 'text-blue-600' },
  parking: { bg: 'bg-orange-100', text: 'text-orange-600' },
  service: { bg: 'bg-green-100', text: 'text-green-600' },
  chambre: { bg: 'bg-blue-100', text: 'text-blue-600' },
  recherche_coloc: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
};

// Fallbacks thématiques par type d'annonce
const FALLBACK_IMAGES: Record<string, string> = {
  logement: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
  parking: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&h=300&fit=crop',
  chambre: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
  recherche_coloc: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
  service: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
  demenagement: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400&h=300&fit=crop',
  assurance: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop',
  bricolage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
  menage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
  autre: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
};

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalData, setModalData] = useState({
    listingType: 'landlord',
    type: 'logement',
    title: '',
    description: '',
    location: 'Paris',
    address: '',
    price: '',
    surface: '',
    rooms: '',
    category: 'autre',
    company: '',
    zone: '',
    photos: '' as string, // Base64 ou URL
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings?type=${filter}`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'upload d'image
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setImageError('Format non supporté. Utilisez JPG ou PNG.');
      return;
    }

    // Vérifier la taille (5 Mo max)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('L\'image est trop volumineuse. Maximum 5 Mo.');
      return;
    }

    setImageError(null);

    // Convertir en base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setModalData({ ...modalData, photos: base64 });
    };
    reader.readAsDataURL(file);
  };

  // Supprimer l'image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setModalData({ ...modalData, photos: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Obtenir l'image de fallback selon le type
  const getFallbackImage = () => {
    if (modalData.listingType === 'service') {
      return FALLBACK_IMAGES[modalData.category] || FALLBACK_IMAGES.service;
    }
    if (modalData.listingType === 'coloc') {
      return FALLBACK_IMAGES[modalData.type] || FALLBACK_IMAGES.chambre;
    }
    return FALLBACK_IMAGES[modalData.type] || FALLBACK_IMAGES.logement;
  };

  // Utiliser le fallback
  const handleUseFallback = () => {
    const fallbackUrl = getFallbackImage();
    setImagePreview(fallbackUrl);
    setModalData({ ...modalData, photos: fallbackUrl });
    setImageError(null);
  };

  const handleCreateListing = async () => {
    // Validation
    if (!modalData.title) {
      alert('Le titre est requis');
      return;
    }

    if (!modalData.photos) {
      alert('Une photo est requise pour publier l\'annonce');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modalData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowModal(false);
        setImagePreview(null);
        setImageError(null);
        setModalData({
          listingType: 'landlord',
          type: 'logement',
          title: '',
          description: '',
          location: 'Paris',
          address: '',
          price: '',
          surface: '',
          rooms: '',
          category: 'autre',
          company: '',
          zone: '',
          photos: '',
        });
        fetchListings();
      } else {
        alert(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Create listing error:', error);
      alert('Erreur serveur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (listingId: string, listingType: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: listingId, listingType, isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchListings();
      }
    } catch (error) {
      console.error('Toggle active error:', error);
    }
  };

  const handleDeleteListing = async (listingId: string, listingType: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;

    try {
      const res = await fetch(`/api/admin/listings?id=${listingId}&listingType=${listingType}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchListings();
      }
    } catch (error) {
      console.error('Delete listing error:', error);
    }
  };

  const getDisplayType = (listing: Listing) => {
    if (listing.listingType === 'service') return 'service';
    if (listing.listingType === 'coloc') return listing.type || 'chambre';
    return listing.type || 'logement';
  };

  // Obtenir l'image à afficher pour une annonce
  const getListingImage = (listing: Listing) => {
    if (listing.photos) {
      try {
        const photos = JSON.parse(listing.photos);
        return photos[0];
      } catch {
        return listing.photos;
      }
    }
    const displayType = getDisplayType(listing);
    return FALLBACK_IMAGES[displayType] || FALLBACK_IMAGES.logement;
  };

  // Reset modal when listing type changes
  const handleListingTypeChange = (type: 'landlord' | 'coloc' | 'service') => {
    setModalData({
      ...modalData,
      listingType: type,
      type: type === 'coloc' ? 'chambre' : type === 'landlord' ? 'logement' : modalData.type,
      category: type === 'service' ? 'demenagement' : modalData.category,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des annonces</h1>
          <p className="text-gray-500">Ajouter ou modérer les annonces</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-xl transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter une annonce
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Toutes' },
          { value: 'logement', label: 'Logements' },
          { value: 'colocation', label: 'Colocations' },
          { value: 'service', label: 'Services' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === f.value
                ? 'bg-violet-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-12 text-gray-500">
          Aucune annonce trouvée
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => {
            const displayType = getDisplayType(listing);
            const colors = TYPE_COLORS[displayType] || TYPE_COLORS.logement;
            const imageUrl = getListingImage(listing);
            
            return (
              <div
                key={`${listing.listingType}-${listing.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                      {displayType}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      listing.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {listing.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{listing.title}</h3>
                  
                  <div className="text-sm text-gray-500 space-y-1">
                    {listing.location && (
                      <p className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {listing.location}
                      </p>
                    )}
                    {listing.price !== undefined && listing.price !== null && (
                      <p className="font-semibold text-gray-800">{listing.price}€</p>
                    )}
                    {listing.surface && (
                      <p>{listing.surface} m²</p>
                    )}
                    {listing.company && (
                      <p>{listing.company}</p>
                    )}
                    {listing.category && listing.listingType === 'service' && (
                      <p className="capitalize">{listing.category}</p>
                    )}
                  </div>
                  
                  {listing.user && (
                    <p className="text-xs text-gray-400 mt-2">
                      Par {listing.user.name || listing.user.email}
                    </p>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleToggleActive(listing.id, listing.listingType, listing.isActive)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        listing.isActive
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      {listing.isActive ? 'Masquer' : 'Activer'}
                    </button>
                    <button
                      onClick={() => handleDeleteListing(listing.id, listing.listingType)}
                      className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Ajouter une annonce</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Listing Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'annonce</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'landlord', label: 'Logement', color: 'violet' },
                    { value: 'coloc', label: 'Colocation', color: 'blue' },
                    { value: 'service', label: 'Service', color: 'green' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => handleListingTypeChange(t.value as 'landlord' | 'coloc' | 'service')}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        modalData.listingType === t.value
                          ? 'ring-2'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                      style={modalData.listingType === t.value ? { 
                        backgroundColor: t.color === 'violet' ? '#EDE9FE' : t.color === 'blue' ? '#DBEAFE' : '#D1FAE5',
                        color: t.color === 'violet' ? '#7C3AED' : t.color === 'blue' ? '#3B82F6' : '#10B981',
                        borderColor: t.color === 'violet' ? '#8B5CF6' : t.color === 'blue' ? '#3B82F6' : '#10B981',
                        borderWidth: '2px'
                      } : {}}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload - OBLIGATOIRE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo de l'annonce <span className="text-red-500">*</span>
                </label>
                
                {/* Prévisualisation */}
                {imagePreview ? (
                  <div className="relative mb-3">
                    <img
                      src={imagePreview}
                      alt="Prévisualisation"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ Photo prête
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-colors"
                  >
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 font-medium mb-1">Cliquez pour ajouter une photo</p>
                    <p className="text-gray-400 text-sm">JPG, PNG • Max 5 Mo</p>
                  </div>
                )}

                {/* Input caché */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Erreur */}
                {imageError && (
                  <p className="text-red-500 text-sm mt-2">{imageError}</p>
                )}

                {/* Option fallback */}
                {!imagePreview && (
                  <button
                    type="button"
                    onClick={handleUseFallback}
                    className="w-full mt-3 py-2 px-4 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Utiliser une image par défaut
                  </button>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <input
                  type="text"
                  value={modalData.title}
                  onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                  placeholder="Titre de l'annonce"
                />
              </div>

              {/* Landlord/Coloc Fields */}
              {(modalData.listingType === 'landlord' || modalData.listingType === 'coloc') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {modalData.listingType === 'coloc' ? 'Type' : 'Type de bien'}
                      </label>
                      <select
                        value={modalData.type}
                        onChange={(e) => setModalData({ ...modalData, type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                      >
                        {modalData.listingType === 'coloc' ? (
                          <>
                            <option value="chambre">Chambre</option>
                            <option value="recherche_coloc">Recherche coloc</option>
                          </>
                        ) : (
                          <>
                            <option value="logement">Logement</option>
                            <option value="parking">Parking</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                      <input
                        type="text"
                        value={modalData.location}
                        onChange={(e) => setModalData({ ...modalData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prix (€)</label>
                      <input
                        type="number"
                        value={modalData.price}
                        onChange={(e) => setModalData({ ...modalData, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Surface (m²)</label>
                      <input
                        type="number"
                        value={modalData.surface}
                        onChange={(e) => setModalData({ ...modalData, surface: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Service Fields */}
              {modalData.listingType === 'service' && (
                <>
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zone d'intervention</label>
                    <input
                      type="text"
                      value={modalData.zone}
                      onChange={(e) => setModalData({ ...modalData, zone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="Paris et Île-de-France"
                    />
                  </div>
                </>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={modalData.description}
                  onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setImagePreview(null);
                  setImageError(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateListing}
                disabled={submitting}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  imagePreview 
                    ? 'bg-violet-500 text-white hover:bg-violet-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } disabled:opacity-50`}
              >
                {submitting ? 'Création...' : 'Créer l\'annonce'}
              </button>
            </div>
            
            {/* Warning si pas d'image */}
            {!imagePreview && (
              <div className="px-6 pb-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-amber-700 text-sm">
                    <span className="font-medium">Photo obligatoire</span> – Une annonce sans photo reçoit 5x moins de contacts. Ajoutez une photo ou utilisez l'image par défaut.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
