'use client';

export default function CadeauxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestion des Cadeaux
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Gérez les cadeaux et récompenses
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            Page en cours de développement
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            La gestion des cadeaux sera bientôt disponible.
          </p>
        </div>
      </div>
    </div>
  );
}
