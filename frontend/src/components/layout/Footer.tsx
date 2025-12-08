import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold text-primary-400 mb-4">FarmBox</h3>
            <p className="text-gray-400 text-sm">
              Plateforme de vente directe connectant les fermes bio tunisiennes aux consommateurs urbains.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/farms" className="hover:text-white transition">
                  Nos Fermes
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition">
                  Comment ca marche
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition">
                  Devenir producteur
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Informations</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  A propos
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Politique de confidentialite
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary-400" />
                <span className="text-sm">Tunis, Tunisie</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-primary-400" />
                <span className="text-sm">+216 XX XXX XXX</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary-400" />
                <span className="text-sm">contact@farmbox.tn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} FarmBox. Tous droits reserves.</p>
        </div>
      </div>
    </footer>
  );
}
