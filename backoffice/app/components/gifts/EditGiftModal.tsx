'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface Level {
  id: string;
  name: string;
  level_number: number;
}

interface Zone {
  id: string;
  name: string;
  type: string;
}

interface ZoneAttribution {
  zone_id: string;
  zone_name: string;
  quantity: number;
}

interface EditGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  giftId: string | null;
}

export default function EditGiftModal({ isOpen, onClose, onSuccess, giftId }: EditGiftModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [siret, setSiret] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [levelId, setLevelId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('');

  // Zones attribution
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneAttributions, setZoneAttributions] = useState<ZoneAttribution[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [selectedZoneQuantity, setSelectedZoneQuantity] = useState('');

  // Levels for dropdown
  const [levels, setLevels] = useState<Level[]>([]);

  useEffect(() => {
    if (isOpen && giftId) {
      loadLevels();
      loadZones();
      loadGift();
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, giftId]);

  const loadLevels = async () => {
    const response = await apiClient.getLevels(1, 100);
    if (response.data) {
      const levelsData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setLevels(levelsData);
    }
  };

  const loadZones = async () => {
    const response = await apiClient.getZones(1, 100);
    if (response.data) {
      const zonesData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setZones(zonesData);
    }
  };

  const loadGift = async () => {
    if (!giftId) return;

    setIsLoading(true);
    setError('');

    const response = await apiClient.getGift(giftId);

    if (response.error) {
      setError(response.error);
      setIsLoading(false);
      return;
    }

    if (response.data && response.data.gift) {
      const gift = response.data.gift;

      setCode(gift.code || '');
      setName(gift.name || '');
      setCompanyName(gift.company_name || '');
      setSiret(gift.siret || '');
      setContactName(gift.contact_name || '');
      setContactPhone(gift.contact_phone || '');
      setContactEmail(gift.contact_email || '');
      setStartDate(gift.start_date || '');
      setEndDate(gift.end_date || '');
      setLevelId(gift.level_id || '');
      setImageUrl(gift.image_url || '');
      setImagePreview(gift.image_url || null);
      setDescription(gift.description || '');
      setTotalQuantity(gift.total_quantity?.toString() || '0');

      // Load zone attributions from metadata
      if (gift.metadata && Array.isArray(gift.metadata.zones)) {
        setZoneAttributions(gift.metadata.zones);
      } else {
        setZoneAttributions([]);
      }
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setCode('');
    setName('');
    setCompanyName('');
    setSiret('');
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setStartDate('');
    setEndDate('');
    setLevelId('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview(null);
    setDescription('');
    setTotalQuantity('');
    setZoneAttributions([]);
    setSelectedZoneId('');
    setSelectedZoneQuantity('');
    setError('');
  };

  const handleAddZone = () => {
    if (!selectedZoneId || !selectedZoneQuantity) {
      setError('Veuillez sélectionner une zone et spécifier une quantité.');
      return;
    }

    const zone = zones.find(z => z.id === selectedZoneId);
    if (!zone) return;

    // Check if zone already added
    if (zoneAttributions.find(za => za.zone_id === selectedZoneId)) {
      setError('Cette zone a déjà été ajoutée.');
      return;
    }

    setZoneAttributions([...zoneAttributions, {
      zone_id: selectedZoneId,
      zone_name: zone.name,
      quantity: parseInt(selectedZoneQuantity)
    }]);

    setSelectedZoneId('');
    setSelectedZoneQuantity('');
    setError('');
  };

  const handleRemoveZone = (zoneId: string) => {
    setZoneAttributions(zoneAttributions.filter(za => za.zone_id !== zoneId));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5 Mo.');
      return;
    }

    setImageFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setImageUrl(reader.result as string); // Store as base64
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
  };

  const handleReplaceImage = () => {
    const fileInput = document.getElementById('image-upload-edit') as HTMLInputElement;
    fileInput?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!giftId) return;

    // Validation
    if (!code || !name || !companyName || !totalQuantity) {
      setError('Veuillez remplir tous les champs obligatoires (code, nom, enseigne, quantité totale).');
      return;
    }

    // Validate quantity
    const qty = parseInt(totalQuantity);
    if (isNaN(qty) || qty < 0) {
      setError('La quantité totale doit être un nombre positif.');
      return;
    }

    // Validate zone quantities sum
    const zonesTotal = zoneAttributions.reduce((sum, za) => sum + za.quantity, 0);
    if (zoneAttributions.length > 0 && zonesTotal !== qty) {
      setError(`La somme des quantités par zone (${zonesTotal}) doit correspondre à la quantité totale (${qty}).`);
      return;
    }

    setIsSubmitting(true);

    const giftData = {
      code: code.trim(),
      name: name.trim(),
      company_name: companyName.trim(),
      siret: siret.trim() || null,
      contact_name: contactName.trim() || null,
      contact_phone: contactPhone.trim() || null,
      contact_email: contactEmail.trim() || null,
      start_date: startDate || null,
      end_date: endDate || null,
      level_id: levelId || null,
      image_url: imageUrl.trim() || null,
      description: description.trim() || null,
      total_quantity: qty,
      metadata: {
        zones: zoneAttributions
      }
    };

    const response = await apiClient.updateGift(giftId, giftData);

    setIsSubmitting(false);

    if (response.error) {
      setError(response.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-green-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold">Modifier le cadeau</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            disabled={isSubmitting || isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        )}

        {/* Form */}
        {!isLoading && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                Informations de base
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={10}
                    placeholder="Ex: C1, C2"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom du cadeau <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={255}
                    placeholder="Ex: Bon d'achat 10€"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Description du cadeau..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Informations entreprise */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                Informations entreprise
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enseigne <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    maxLength={255}
                    placeholder="Nom de l'entreprise"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={siret}
                    onChange={(e) => setSiret(e.target.value)}
                    maxLength={14}
                    placeholder="14 chiffres"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom du contact
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    maxLength={255}
                    placeholder="Nom et prénom"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    maxLength={20}
                    placeholder="0X XX XX XX XX"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    maxLength={255}
                    placeholder="contact@entreprise.fr"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Niveau
                  </label>
                  <select
                    value={levelId}
                    onChange={(e) => setLevelId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Tous niveaux</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>
                        Niveau {level.level_number} - {level.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantité totale <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={totalQuantity}
                    onChange={(e) => setTotalQuantity(e.target.value)}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                Image
              </h3>
              <div>
                {!imagePreview ? (
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload-edit"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Cliquez pour importer</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF (max. 5 Mo)</p>
                      </div>
                      <input
                        id="image-upload-edit"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative w-full h-48 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700">
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleReplaceImage}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Remplacer
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Supprimer
                      </button>
                    </div>
                    <input
                      id="image-upload-edit"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Zones attribution */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                Attribution par zone
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Optionnel : attribuez des quantités spécifiques à certaines zones. La somme doit correspondre à la quantité totale.
              </p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Sélectionner une zone</option>
                    {zones.map(zone => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} ({zone.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    value={selectedZoneQuantity}
                    onChange={(e) => setSelectedZoneQuantity(e.target.value)}
                    min="0"
                    placeholder="Quantité"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddZone}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  Ajouter
                </button>
              </div>

              {zoneAttributions.length > 0 && (
                <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Zone</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Quantité</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {zoneAttributions.map((za) => (
                        <tr key={za.zone_id}>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{za.zone_name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 text-right">{za.quantity}</td>
                          <td className="px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveZone(za.zone_id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">Total</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 text-right">
                          {zoneAttributions.reduce((sum, za) => sum + za.quantity, 0)}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
