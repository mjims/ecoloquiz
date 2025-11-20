'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface EditZoneModalProps {
  isOpen: boolean;
  zoneId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Departement {
  id: number;
  code: string;
  name: string;
  region_id: number;
}

interface Region {
  id: number;
  code: string;
  name: string;
  departements: Departement[];
}

export default function EditZoneModal({ isOpen, zoneId, onClose, onSuccess }: EditZoneModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);
  const [error, setError] = useState('');
  const [zoneType, setZoneType] = useState<'TERRITOIRE' | 'ENTREPRISE'>('TERRITOIRE');
  const [regions, setRegions] = useState<Region[]>([]);

  // Données du formulaire
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (isOpen && zoneId) {
      loadRegionsAndZone();
    }
  }, [isOpen, zoneId]);

  const loadRegionsAndZone = async () => {
    setIsLoading(true);
    setIsLoadingRegions(true);
    setError('');

    // Charger les régions en parallèle avec la zone
    const [regionsResponse, zoneResponse] = await Promise.all([
      apiClient.getRegions(),
      apiClient.getZone(zoneId)
    ]);

    // Traiter les régions
    if (regionsResponse.data && regionsResponse.data.regions) {
      setRegions(regionsResponse.data.regions);
    }
    setIsLoadingRegions(false);

    // Traiter la zone
    if (zoneResponse.error) {
      setError(zoneResponse.error);
      setIsLoading(false);
    } else if (zoneResponse.data) {
      const zone = zoneResponse.data.zone || zoneResponse.data;

      // Déterminer le type
      if (zone.type === 'ENTREPRISE') {
        setZoneType('ENTREPRISE');
        setFormData({
          nom_entreprise: zone.name || '',
          siret: zone.metadata?.company_info?.siret || '',
          prenom_dirigeant: zone.metadata?.company_info?.dirigeant_prenom || '',
          nom_dirigeant: zone.metadata?.company_info?.dirigeant_nom || '',
          email_dirigeant: zone.metadata?.company_info?.dirigeant_email || '',
          telephone_dirigeant: zone.metadata?.company_info?.dirigeant_tel || '',
          nombre_salaries: zone.metadata?.company_info?.nb_salaries || '',
          zone_selection: zone.metadata?.zone_selection || '',
          start_date: zone.start_date ? new Date(zone.start_date).toISOString().split('T')[0] : '',
          end_date: zone.end_date ? new Date(zone.end_date).toISOString().split('T')[0] : '',
        });
      } else {
        setZoneType('TERRITOIRE');
        setFormData({
          region_id: zone.metadata?.region_id || 0,
          departement_ids: zone.metadata?.departement_ids || [],
          codes_postaux: zone.metadata?.codes_postaux?.join(', ') || zone.code_postal || '',
          start_date: zone.start_date ? new Date(zone.start_date).toISOString().split('T')[0] : '',
          end_date: zone.end_date ? new Date(zone.end_date).toISOString().split('T')[0] : '',
        });
      }

      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    let updateData: any;

    if (zoneType === 'ENTREPRISE') {
      updateData = {
        name: formData.nom_entreprise,
        type: 'ENTREPRISE',
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        metadata: {
          company_info: {
            siret: formData.siret,
            dirigeant_prenom: formData.prenom_dirigeant,
            dirigeant_nom: formData.nom_dirigeant,
            dirigeant_email: formData.email_dirigeant,
            dirigeant_tel: formData.telephone_dirigeant,
            nb_salaries: parseInt(formData.nombre_salaries) || 0,
          },
          zone_selection: formData.zone_selection
        }
      };
    } else {
      const selectedRegion = regions.find(r => r.id === formData.region_id);
      const selectedDepartements = selectedRegion?.departements.filter(d => formData.departement_ids.includes(d.id)) || [];

      updateData = {
        name: selectedRegion?.name || 'Zone territoire',
        type: 'TERRITOIRE',
        code_postal: null, // Les codes postaux sont dans metadata pour les zones territoire
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        metadata: {
          region_id: formData.region_id,
          region: selectedRegion?.name,
          departement_ids: formData.departement_ids,
          departements: selectedDepartements.map(d => `${d.name} (${d.code})`),
          codes_postaux: formData.codes_postaux.split(',').map((cp: string) => cp.trim()).filter((cp: string) => cp),
        }
      };
    }

    const response = await apiClient.updateZone(zoneId, updateData);

    if (response.error) {
      setError(response.error);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      onSuccess();
    }
  };

  const handleDepartementToggle = (deptId: number) => {
    setFormData((prev: any) => ({
      ...prev,
      departement_ids: prev.departement_ids.includes(deptId)
        ? prev.departement_ids.filter((id: number) => id !== deptId)
        : [...prev.departement_ids, deptId]
    }));
  };

  if (!isOpen) return null;

  const selectedRegion = regions.find(r => r.id === formData.region_id);
  const availableDepartements = selectedRegion?.departements || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Modifier la zone
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Type indicator (read-only) */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 rounded">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Type de zone : <strong>{zoneType === 'TERRITOIRE' ? 'Territoire' : 'Entreprise/Collectivité'}</strong>
              </p>
            </div>

            {zoneType === 'TERRITOIRE' ? (
              // === FORMULAIRE TERRITOIRE ===
              <>
                {isLoadingRegions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des régions...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Région <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="region"
                        value={formData.region_id}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, region_id: Number(e.target.value), departement_ids: [] }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        required
                      >
                        {regions.map(region => (
                          <option key={region.id} value={region.id}>{region.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Départements
                      </label>
                      <div className="grid grid-cols-2 gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
                        {availableDepartements.length > 0 ? (
                          availableDepartements.map(dept => (
                            <label key={dept.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.departement_ids?.includes(dept.id) || false}
                                onChange={() => handleDepartementToggle(dept.id)}
                                className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{dept.name} ({dept.code})</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2">Sélectionnez une région</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="codes_postaux" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Codes Postaux
                      </label>
                      <input
                        type="text"
                        id="codes_postaux"
                        value={formData.codes_postaux}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, codes_postaux: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Ex: 94000, 94300, 94550, 94120"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Séparez les codes postaux par des virgules
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Début
                        </label>
                        <input
                          type="date"
                          id="start_date"
                          value={formData.start_date}
                          onChange={(e) => setFormData((prev: any) => ({ ...prev, start_date: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fin
                        </label>
                        <input
                          type="date"
                          id="end_date"
                          value={formData.end_date}
                          onChange={(e) => setFormData((prev: any) => ({ ...prev, end_date: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              // === FORMULAIRE ENTREPRISE ===
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nom_entreprise" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom de l&apos;entreprise <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nom_entreprise"
                      value={formData.nom_entreprise}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, nom_entreprise: e.target.value }))}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="siret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SIRET
                    </label>
                    <input
                      type="text"
                      id="siret"
                      value={formData.siret}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, siret: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="prenom_dirigeant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prénom dirigeant
                    </label>
                    <input
                      type="text"
                      id="prenom_dirigeant"
                      value={formData.prenom_dirigeant}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, prenom_dirigeant: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="nom_dirigeant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom dirigeant
                    </label>
                    <input
                      type="text"
                      id="nom_dirigeant"
                      value={formData.nom_dirigeant}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, nom_dirigeant: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="email_dirigeant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mail dirigeant
                    </label>
                    <input
                      type="email"
                      id="email_dirigeant"
                      value={formData.email_dirigeant}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, email_dirigeant: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="telephone_dirigeant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone dirigeant
                    </label>
                    <input
                      type="tel"
                      id="telephone_dirigeant"
                      value={formData.telephone_dirigeant}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, telephone_dirigeant: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="nombre_salaries" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre de salariés
                    </label>
                    <input
                      type="number"
                      id="nombre_salaries"
                      value={formData.nombre_salaries}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, nombre_salaries: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="zone_selection" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Choisir sa zone
                    </label>
                    <input
                      type="text"
                      id="zone_selection"
                      value={formData.zone_selection}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, zone_selection: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Sélection de zone"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      DEV : Sélection de zone comme l&apos;Angleterre (carte interactive à implémenter)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start_date_entreprise" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Début
                    </label>
                    <input
                      type="date"
                      id="start_date_entreprise"
                      value={formData.start_date}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="end_date_entreprise" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fin
                    </label>
                    <input
                      type="date"
                      id="end_date_entreprise"
                      value={formData.end_date}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  'Valider'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
