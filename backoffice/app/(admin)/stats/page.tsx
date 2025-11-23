'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface Zone {
  id: string;
  name: string;
  type: string;
}

interface Theme {
  id: string;
  name: string;
}

interface Level {
  id: string;
  name: string;
  order: number;
}

interface LevelStat {
  level: number;
  level_name: string;
  level_id: string;
  percent_subscribers: number;
  percent_gift_winners: number;
  avg_time_minutes: number;
}

interface StatsData {
  total_subscriptions: number;
  total_connections: number;
  participation_rate: number;
  level_stats: LevelStat[];
  new_partners: number;
}

export default function StatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters data
  const [zones, setZones] = useState<Zone[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  // Filter selections
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [allZonesChecked, setAllZonesChecked] = useState(true);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['all']);

  // Stats data
  const [stats, setStats] = useState<StatsData>({
    total_subscriptions: 0,
    total_connections: 0,
    participation_rate: 0,
    level_stats: [],
    new_partners: 0,
  });

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadStats();
  }, [selectedZone, selectedTheme, startDate, endDate, selectedLevels]);

  const loadFilters = async () => {
    const response = await apiClient.getStatsFilters();
    if (response.data) {
      setZones(response.data.zones || []);
      setThemes(response.data.themes || []);
      setLevels(response.data.levels || []);
    }
    setIsLoading(false);
  };

  const loadStats = async () => {
    const zoneId = selectedZone !== 'all' ? selectedZone : undefined;
    const themeId = selectedTheme !== 'all' ? selectedTheme : undefined;

    const response = await apiClient.getStats(
      zoneId,
      themeId,
      startDate,
      endDate,
      selectedLevels
    );

    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setStats(response.data);
    }
  };

  const handleLevelToggle = (levelId: string) => {
    if (levelId === 'all') {
      setSelectedLevels(['all']);
      return;
    }

    let newSelected = selectedLevels.filter(l => l !== 'all');

    if (newSelected.includes(levelId)) {
      newSelected = newSelected.filter(l => l !== levelId);
    } else {
      newSelected.push(levelId);
    }

    if (newSelected.length === 0 || newSelected.length === levels.length) {
      setSelectedLevels(['all']);
    } else {
      setSelectedLevels(newSelected);
    }
  };

  const isLevelSelected = (levelId: string) => {
    if (levelId === 'all') {
      return selectedLevels.includes('all') || selectedLevels.length === levels.length;
    }
    return selectedLevels.includes('all') || selectedLevels.includes(levelId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Statistiques
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          STATISTIQUES DU JEU
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Zone Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Zones
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Toutes les zones</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thèmes
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tous les thèmes</option>
              {themes.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fin
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

        {/* Level Filters */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Niveaux
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isLevelSelected('all')}
                onChange={() => handleLevelToggle('all')}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Tous les niveaux</span>
            </label>
            {levels.map(level => (
              <label key={level.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isLevelSelected(level.id)}
                  onChange={() => handleLevelToggle(level.id)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  niv {level.order}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Statistics Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Abonnements
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Connexions abonnés
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                % participation
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                NIV
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                % gain cadeau
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                % abonnés/niveaux
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Temps sur le jeu (min)
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Nouveaux partenaires
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {stats.level_stats.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucune donnée disponible pour cette période
                </td>
              </tr>
            ) : (
              <>
                {/* First row with totals */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td rowSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {stats.total_subscriptions}
                  </td>
                  <td rowSpan={3} className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {stats.total_connections}
                  </td>
                  <td rowSpan={3} className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                    {stats.participation_rate}%
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                    {stats.level_stats[0]?.level || '-'}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                    {stats.level_stats[0]?.percent_gift_winners || 0}%
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                    {stats.level_stats[0]?.percent_subscribers || 0}%
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                    {stats.level_stats[0]?.avg_time_minutes || 0}min
                  </td>
                  <td rowSpan={3} className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                    {stats.new_partners > 0 ? stats.new_partners : ''}
                  </td>
                </tr>

                {/* Additional rows for other levels */}
                {stats.level_stats.slice(1).map((levelStat, index) => (
                  <tr key={levelStat.level} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                      {levelStat.level}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                      {levelStat.percent_gift_winners}%
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                      {levelStat.percent_subscribers}%
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                      {levelStat.avg_time_minutes}min
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
