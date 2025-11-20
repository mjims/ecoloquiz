'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface CreateZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ZoneType = 'TERRITOIRE' | 'ENTREPRISE';

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

export default function CreateZoneModal({ isOpen, onClose, onSuccess }: CreateZoneModalProps) {
  const [zoneType, setZoneType] = useState<ZoneType>('TERRITOIRE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);
  const [error, setError] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);

  // Formulaire Zone Territoire
  const [territoireData, setTerritoireData] = useState({
    region_id: 0,
    departement_ids: [] as number[],
    codes_postaux: '',
    start_date: '',
    end_date: ''
  });

  // Formulaire Zone Entreprise
  const [entrepriseData, setEntrepriseData] = useState({
    nom_entreprise: '',
    siret: '',
    prenom_dirigeant: '',
    nom_dirigeant: '',
    email_dirigeant: '',
    telephone_dirigeant: '',
    nombre_salaries: '',
    zone_selection: '',
    start_date: '',
    end_date: ''
  });

  // Charger les régions au montage du composant
  useEffect(() => {
    if (isOpen) {
      loadRegions();
    }
  }, [isOpen]);

  const loadRegions = async () => {
    setIsLoadingRegions(true);
    const response = await apiClient.getRegions();

    if (response.data && response.data.regions) {
      setRegions(response.data.regions);
      // Sélectionner la première région par défaut
      if (response.data.regions.length > 0) {
        setTerritoireData(prev => ({ ...prev, region_id: response.data.regions[0].id }));
      }
    }
    setIsLoadingRegions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    let zoneData: any;

    if (zoneType === 'TERRITOIRE') {
      // Zone territoire
      const selectedRegion = regions.find(r => r.id === territoireData.region_id);
      const selectedDepartements = selectedRegion?.departements.filter(d => territoireData.departement_ids.includes(d.id)) || [];

      zoneData = {
        name: selectedRegion?.name || 'Zone territoire',
        type: 'TERRITOIRE',
        code_postal: null, // Les codes postaux sont dans metadata pour les zones territoire
        start_date: territoireData.start_date || null,
        end_date: territoireData.end_date || null,
        metadata: {
          region_id: territoireData.region_id,
          region: selectedRegion?.name,
          departement_ids: territoireData.departement_ids,
          departements: selectedDepartements.map(d => `${d.name} (${d.code})`),
          codes_postaux: territoireData.codes_postaux.split(',').map(cp => cp.trim()).filter(cp => cp),
        }
      };
    } else {
      // Zone entreprise
      zoneData = {
        name: entrepriseData.nom_entreprise,
        type: 'ENTREPRISE',
        start_date: entrepriseData.start_date || null,
        end_date: entrepriseData.end_date || null,
        metadata: {
          company_info: {
            siret: entrepriseData.siret,
            dirigeant_prenom: entrepriseData.prenom_dirigeant,
            dirigeant_nom: entrepriseData.nom_dirigeant,
            dirigeant_email: entrepriseData.email_dirigeant,
            dirigeant_tel: entrepriseData.telephone_dirigeant,
            nb_salaries: parseInt(entrepriseData.nombre_salaries) || 0,
          },
          zone_selection: entrepriseData.zone_selection
        }
      };
    }

    const response = await apiClient.createZone(zoneData);

    if (response.error) {
      setError(response.error);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      onSuccess();
    }
  };

  const handleDepartementToggle = (deptId: number) => {
    setTerritoireData(prev => ({
      ...prev,
      departement_ids: prev.departement_ids.includes(deptId)
        ? prev.departement_ids.filter(id => id !== deptId)
        : [...prev.departement_ids, deptId]
    }));
  };

  if (!isOpen) return null;

  const selectedRegion = regions.find(r => r.id === territoireData.region_id);
  const availableDepartements = selectedRegion?.departements || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Créer une zone
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

        {/* Type Selection */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="zone_type"
                checked={zoneType === 'TERRITOIRE'}
                onChange={() => setZoneType('TERRITOIRE')}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Territoires</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="zone_type"
                checked={zoneType === 'ENTREPRISE'}
                onChange={() => setZoneType('ENTREPRISE')}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dédiée à une entreprise / collectivité</span>
            </label>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

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
                  {/* Région */}
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Région <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="region"
                      value={territoireData.region_id}
                      onChange={(e) => setTerritoireData(prev => ({ ...prev, region_id: Number(e.target.value), departement_ids: [] }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      {regions.map(region => (
                        <option key={region.id} value={region.id}>{region.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Départements */}
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
                              checked={territoireData.departement_ids.includes(dept.id)}
                              onChange={() => handleDepartementToggle(dept.id)}
                              className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{dept.name} ({dept.code})</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2">Sélectionnez une région pour voir les départements</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Codes Postaux */}
              <div>
                <label htmlFor="codes_postaux" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code Postal
                </label>
                <input
                  type="text"
                  id="codes_postaux"
                  value={territoireData.codes_postaux}
                  onChange={(e) => setTerritoireData(prev => ({ ...prev, codes_postaux: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 94000, 94300, 94550, 94120"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Séparez les codes postaux par des virgules
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Début
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    value={territoireData.start_date}
                    onChange={(e) => setTerritoireData(prev => ({ ...prev, start_date: e.target.value }))}
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
                    value={territoireData.end_date}
                    onChange={(e) => setTerritoireData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </>
          ) : (
            // === FORMULAIRE ENTREPRISE ===
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* Nom entreprise */}
                <div>
                  <label htmlFor="nom_entreprise" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de l&apos;entreprise <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nom_entreprise"
                    value={entrepriseData.nom_entreprise}
                    onChange={(e) => setEntrepriseData(prev => ({ ...prev, nom_entreprise: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* SIRET */}
                <div>
                  <label htmlFor="siret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Siret
                  </label>
                  <input
                    type="text"
                    id="siret"
                    value={entrepriseData.siret}
                    onChange={(e) => setEntrepriseData(prev => ({ ...prev, siret: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Prénom dirigeant */}
                <div>
                  <label htmlFor="prenom_dirigeant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prénom dirigeant
                  </label>
                  <input
                    type="text"
                    id="prenom_dirigeant"
                    value={entrepriseData.prenom_dirigeant}
                    onChange={(e) => setEntrepriseData(prev => ({ ...prev, prenom_dirigeant: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Nom dirigeant */}
                <div>
                  <label htmlFor="nom_dirigeant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom dirigeant
                  </label>
                  <input
                    type="text"
                    id="nom_dirigeant"
                    value={entrepriseData.nom_dirigeant}
                    onChange={(e) => setEntrepriseData(prev => ({ ...prev, nom_dirigeant: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Email dirigeant */}
                <div>
                  <label htmlFor="email_dirigeant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mail dirigeant
                  </label>
                  <input
                    type="email"
                    id="email_dirigeant"
                    value={entrepriseData.email_dirigeant}
                    onChange={(e) => setEntrepriseData(prev => ({ ...prev, email_dirigeant: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Téléphone dirigeant */}
                <div>
                  <label htmlFor="telephone_dirigeant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone dirigeant
                  </label>
                  <input
                    type="tel"
                    id="telephone_dirigeant"
                    value={entrepriseData.telephone_dirigeant}
                    onChange={(e) => setEntrepriseData(prev => ({ ...prev, telephone_dirigeant: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Nombre de salariés */}
                <div>
                  <label htmlFor="nombre_salaries" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de salariés
                  </label>
                  <input
                    type="number"
                    id="nombre_salaries"
                    value={entrepriseData.nombre_salaries}
                    onChange={(e) => setEntrepriseData(prev => ({ ...prev, nombre_salaries: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Zone sélection */}
                <div>
                  <label htmlFor="zone_selection" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Choisir sa zone
                  </label>
                  <input
                    type="text"
                    id="zone_selection"
                    value={entrepriseData.zone_selection}
                    onChange={(e) => setEntrepriseData(prev => ({ ...prev, zone_selection: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Sélection de zone"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    DEV : Sélection de zone comme l&apos;Angleterre (carte interactive à implémenter)
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date_entreprise" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Début
                  </label>
                  <input
                    type="date"
                    id="start_date_entreprise"
                    value={entrepriseData.start_date}
                    onChange={(e) => setEntrepriseData(prev => ({ ...prev, start_date: e.target.value }))}
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
                    value={entrepriseData.end_date}
                    onChange={(e) => setEntrepriseData(prev => ({ ...prev, end_date: e.target.value }))}
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
                  <span>Création...</span>
                </>
              ) : (
                'Valider'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
