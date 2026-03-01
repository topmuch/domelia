'use client';

import { useState, useEffect, useRef } from 'react';

interface PayPalSettings {
  paypalClientId: string;
  paypalSecret: string;
  paypalMode: 'sandbox' | 'production';
  contactFee: string;
}

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maxListingsPerUser: string;
  moderationEnabled: boolean;
  notificationsEnabled: boolean;
  maintenanceMode: boolean;
}

interface RestoreStats {
  users: number;
  tenantProfiles: number;
  landlordListings: number;
  colocListings: number;
  professionalAccounts: number;
  proServices: number;
  serviceAds: number;
  payments: number;
  unlockedContacts: number;
  settings: number;
  errors: string[];
}

interface RestoreResult {
  success: boolean;
  message: string;
  stats: RestoreStats;
  backupDate: string;
  backupVersion: string;
}

export default function ConfigurationPage() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: 'Domelia',
    siteDescription: 'La plateforme immobilière inversée',
    contactEmail: 'contact@domelia.fr',
    maxListingsPerUser: '10',
    moderationEnabled: true,
    notificationsEnabled: true,
    maintenanceMode: false,
  });
  
  const [paypalSettings, setPaypalSettings] = useState<PayPalSettings>({
    paypalClientId: '',
    paypalSecret: '',
    paypalMode: 'sandbox',
    contactFee: '2.00',
  });
  
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [testingPaypal, setTestingPaypal] = useState(false);
  const [paypalTestResult, setPaypalTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<{ date: Date | null; size: string | null }>({ date: null, size: null });
  
  // États pour la restauration
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les paramètres existants
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          
          if (data.settings) {
            setGeneralSettings({
              siteName: data.settings.siteName || 'Domelia',
              siteDescription: data.settings.siteDescription || 'La plateforme immobilière inversée',
              contactEmail: data.settings.contactEmail || 'contact@domelia.fr',
              maxListingsPerUser: data.settings.maxListingsPerUser || '10',
              moderationEnabled: data.settings.moderationEnabled === 'true',
              notificationsEnabled: data.settings.notificationsEnabled === 'true',
              maintenanceMode: data.settings.maintenanceMode === 'true',
            });
            
            setPaypalSettings({
              paypalClientId: data.settings.paypalClientId || '',
              paypalSecret: data.settings.paypalSecret || '',
              paypalMode: (data.settings.paypalMode as 'sandbox' | 'production') || 'sandbox',
              contactFee: data.settings.contactFee || '2.00',
            });
          }
        }
      } catch (error) {
        console.error('Erreur chargement paramètres:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            ...generalSettings,
            ...paypalSettings,
          },
        }),
      });
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const testPaypalConnection = async () => {
    setTestingPaypal(true);
    setPaypalTestResult(null);
    
    try {
      const res = await fetch('/api/admin/paypal/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: paypalSettings.paypalClientId,
          secret: paypalSettings.paypalSecret,
          mode: paypalSettings.paypalMode,
        }),
      });
      
      const data = await res.json();
      
      setPaypalTestResult({
        success: res.ok,
        message: data.message || (res.ok ? 'Connexion réussie !' : 'Erreur de connexion'),
      });
    } catch (error) {
      setPaypalTestResult({
        success: false,
        message: 'Erreur lors du test de connexion',
      });
    } finally {
      setTestingPaypal(false);
    }
  };

  // Télécharger une sauvegarde
  const handleBackup = async () => {
    setBackupLoading(true);
    
    try {
      const res = await fetch('/api/admin/backup');
      
      if (!res.ok) {
        throw new Error('Erreur lors de la génération de la sauvegarde');
      }
      
      // Récupérer le blob
      const blob = await res.blob();
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Extraire le nom du fichier du header
      const contentDisposition = res.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `domelia-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Mettre à jour les infos de dernière sauvegarde
      const size = (blob.size / 1024).toFixed(2);
      setLastBackup({ date: new Date(), size: `${size} Ko` });
      
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde: ' + (error?.message || 'Erreur inconnue'));
    } finally {
      setBackupLoading(false);
    }
  };

  // Restaurer une sauvegarde
  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Confirmer l'action
    const confirmed = window.confirm(
      '⚠️ ATTENTION: La restauration va modifier les données existantes.\n\n' +
      'Voulez-vous vraiment restaurer cette sauvegarde ?\n\n' +
      'Fichier: ' + file.name
    );
    
    if (!confirmed) {
      // Reset le file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setRestoreLoading(true);
    setRestoreResult(null);

    try {
      const formData = new FormData();
      formData.append('backup', file);

      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setRestoreResult(data);
        setShowRestoreModal(true);
      } else {
        alert('Erreur lors de la restauration: ' + (data.error || 'Erreur inconnue'));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('Erreur lors de la restauration: ' + errorMessage);
    } finally {
      setRestoreLoading(false);
      // Reset le file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Déclencher le sélecteur de fichier
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Formater le temps écoulé depuis la dernière sauvegarde
  const getLastBackupText = () => {
    if (!lastBackup.date) return "Aucune sauvegarde récente";
    
    const now = new Date();
    const diff = now.getTime() - lastBackup.date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Il y a moins d'une minute";
    if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Configuration</h1>
        <p className="text-gray-500">Paramètres de la plateforme</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Configuration enregistrée avec succès
        </div>
      )}

      {/* Settings */}
      <div className="space-y-6">
        {/* PayPal Configuration */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.679l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H7.72a.483.483 0 0 1-.477-.558L7.418 21h1.518l.95-6.02h1.385c4.678 0 7.75-2.203 8.796-6.502zm-2.96-5.09c.762.868.983 1.81.752 3.285-.019.123-.04.24-.062.36-.735 3.773-3.089 5.446-6.956 5.446H8.957c-.63 0-1.174.414-1.354 1.002l-.014-.002-.93 5.89H3.121a.051.051 0 0 1-.05-.06l2.598-16.51A.95.95 0 0 1 6.607 2h5.976c2.183 0 3.716.469 4.523 1.388z" />
              </svg>
            </span>
            Configuration PayPal
            <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
              paypalSettings.paypalMode === 'production' 
                ? 'bg-red-100 text-red-600' 
                : 'bg-yellow-100 text-yellow-600'
            }`}>
              {paypalSettings.paypalMode === 'production' ? '🟢 Production' : '🟡 Test (Sandbox)'}
            </span>
          </h3>
          
          <div className="space-y-4">
            {/* Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode PayPal
                </label>
                <select
                  value={paypalSettings.paypalMode}
                  onChange={(e) => setPaypalSettings({ ...paypalSettings, paypalMode: e.target.value as 'sandbox' | 'production' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="sandbox">🧪 Sandbox (Test)</option>
                  <option value="production">🚀 Production</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Utilisez "Sandbox" pour les tests, "Production" pour les vrais paiements
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant du frais de contact (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paypalSettings.contactFee}
                  onChange={(e) => setPaypalSettings({ ...paypalSettings, contactFee: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="2.00"
                />
              </div>
            </div>
            
            {/* Client ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PayPal Client ID
              </label>
              <input
                type="text"
                value={paypalSettings.paypalClientId}
                onChange={(e) => setPaypalSettings({ ...paypalSettings, paypalClientId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                placeholder="AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              />
              <p className="text-xs text-gray-500 mt-1">
                Trouvez votre Client ID sur <a href="https://developer.paypal.com/dashboard/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">developer.paypal.com</a>
              </p>
            </div>
            
            {/* Secret */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PayPal Secret
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={paypalSettings.paypalSecret}
                  onChange={(e) => setPaypalSettings({ ...paypalSettings, paypalSecret: e.target.value })}
                  className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                  placeholder="EXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecret ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Ne partagez jamais ce secret. Il est stocké de manière sécurisée.
              </p>
            </div>
            
            {/* Test de connexion */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={testPaypalConnection}
                disabled={!paypalSettings.paypalClientId || !paypalSettings.paypalSecret || testingPaypal}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {testingPaypal ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Tester la connexion
                  </>
                )}
              </button>
              
              {paypalTestResult && (
                <span className={`text-sm flex items-center gap-1 ${
                  paypalTestResult.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {paypalTestResult.success ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {paypalTestResult.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            Paramètres généraux
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du site</label>
                <input
                  type="text"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email de contact</label>
                <input
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description du site</label>
              <textarea
                value={generalSettings.siteDescription}
                onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Listings Settings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
            Annonces
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max annonces par utilisateur</label>
                <input
                  type="number"
                  value={generalSettings.maxListingsPerUser}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, maxListingsPerUser: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">Modération automatique</p>
                <p className="text-sm text-gray-500">Les nouvelles annonces doivent être approuvées</p>
              </div>
              <button
                onClick={() => setGeneralSettings({ ...generalSettings, moderationEnabled: !generalSettings.moderationEnabled })}
                className={`w-14 h-8 rounded-full transition-colors ${
                  generalSettings.moderationEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  generalSettings.moderationEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            Système
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">Notifications par email</p>
                <p className="text-sm text-gray-500">Recevoir les alertes par email</p>
              </div>
              <button
                onClick={() => setGeneralSettings({ ...generalSettings, notificationsEnabled: !generalSettings.notificationsEnabled })}
                className={`w-14 h-8 rounded-full transition-colors ${
                  generalSettings.notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  generalSettings.notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
              <div>
                <p className="font-medium text-red-800">Mode maintenance</p>
                <p className="text-sm text-red-600">Désactiver l'accès au site pour les utilisateurs</p>
              </div>
              <button
                onClick={() => setGeneralSettings({ ...generalSettings, maintenanceMode: !generalSettings.maintenanceMode })}
                className={`w-14 h-8 rounded-full transition-colors ${
                  generalSettings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  generalSettings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Backup & Restore Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#560591]/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#560591]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </span>
            Sauvegarde & Restauration
            <span className="ml-auto text-xs text-gray-400 font-normal">
              Export sécurisé de la base de données
            </span>
          </h3>

          <div className="space-y-6">
            {/* Backup Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Dernière sauvegarde</p>
                <p className="font-semibold text-gray-800">{getLastBackupText()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Taille estimée</p>
                <p className="font-semibold text-gray-800">{lastBackup.size || '~ 50-200 Ko'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Format</p>
                <p className="font-semibold text-gray-800">JSON chiffré (AES-256)</p>
              </div>
            </div>

            {/* Backup Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                onClick={handleBackup}
                disabled={backupLoading}
                className="px-6 py-3 bg-[#560591] hover:bg-[#430477] text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {backupLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    📥 Sauvegarder
                  </>
                )}
              </button>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleRestore}
                accept=".json,application/json"
                className="hidden"
              />

              {/* Restore Button */}
              <button
                onClick={triggerFileInput}
                disabled={restoreLoading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {restoreLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Restauration...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    📤 Restaurer
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Sauvegarde: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">domelia-backup-YYYY-MM-DD.json</code>
              <span className="mx-2">|</span>
              Restauration: Sélectionnez un fichier de sauvegarde valide
            </p>

            {/* Security Info */}
            <div className="p-4 bg-[#560591]/5 rounded-xl border border-[#560591]/20">
              <h4 className="font-medium text-[#560591] mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Sécurité des données
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Emails chiffrés (AES-256-CBC)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Mots de passe hashés (jamais en clair)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Secrets PayPal masqués
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  SIRET et numéros de téléphone chiffrés
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Fichier non stocké sur le serveur
                </li>
              </ul>
            </div>

            {/* Tables Included */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-700 mb-2">Données incluses</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'Utilisateurs',
                  'Profils locataires',
                  'Annonces logements',
                  'Annonces colocation',
                  'Comptes professionnels',
                  'Services',
                  'Paiements',
                  'Contacts déverrouillés',
                  'Paramètres',
                ].map((table) => (
                  <span key={table} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600">
                    {table}
                  </span>
                ))}
              </div>
            </div>

            {/* Restore Warning */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Attention
              </h4>
              <p className="text-sm text-amber-700">
                La restauration modifie les données existantes. Assurez-vous d'avoir une sauvegarde récente avant de restaurer.
                Les secrets PayPal ne sont pas restaurés pour des raisons de sécurité.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Enregistrer la configuration
          </button>
        </div>
      </div>

      {/* Restore Result Modal */}
      {showRestoreModal && restoreResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {restoreResult.success ? (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {restoreResult.success ? 'Restauration réussie' : 'Erreur de restauration'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Sauvegarde du {new Date(restoreResult.backupDate).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Utilisateurs</p>
                  <p className="font-semibold text-gray-800">{restoreResult.stats.users}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Profils locataires</p>
                  <p className="font-semibold text-gray-800">{restoreResult.stats.tenantProfiles}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Annonces logements</p>
                  <p className="font-semibold text-gray-800">{restoreResult.stats.landlordListings}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Annonces colocation</p>
                  <p className="font-semibold text-gray-800">{restoreResult.stats.colocListings}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Comptes pro</p>
                  <p className="font-semibold text-gray-800">{restoreResult.stats.professionalAccounts}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Services</p>
                  <p className="font-semibold text-gray-800">{restoreResult.stats.proServices + restoreResult.stats.serviceAds}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Paiements</p>
                  <p className="font-semibold text-gray-800">{restoreResult.stats.payments}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Paramètres</p>
                  <p className="font-semibold text-gray-800">{restoreResult.stats.settings}</p>
                </div>
              </div>

              {/* Errors */}
              {restoreResult.stats.errors.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 mb-4">
                  <p className="text-sm font-medium text-red-800 mb-2">
                    {restoreResult.stats.errors.length} erreur(s)
                  </p>
                  <div className="max-h-32 overflow-y-auto">
                    {restoreResult.stats.errors.slice(0, 5).map((error, i) => (
                      <p key={i} className="text-xs text-red-600">{error}</p>
                    ))}
                    {restoreResult.stats.errors.length > 5 && (
                      <p className="text-xs text-red-400">...et {restoreResult.stats.errors.length - 5} autres</p>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setRestoreResult(null);
                }}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
