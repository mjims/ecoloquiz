import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <Link
            href="/about"
            className="hover:text-green-600 transition-colors"
          >
            À propos
          </Link>
          <Link
            href="/legal"
            className="hover:text-green-600 transition-colors"
          >
            Mentions légales
          </Link>
          <Link
            href="/privacy"
            className="hover:text-green-600 transition-colors"
          >
            Données personnelles
          </Link>
        </div>
      </div>
    </footer>
  );
}
