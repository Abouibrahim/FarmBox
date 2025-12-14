'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

export default function Footer() {
  return (
    <footer className="bg-brand-green text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Logo variant="white" size="md" />
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Le marché alimentaire régénérateur de la Tunisie. Nous connectons les fermes bio aux familles urbaines.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://instagram.com/borgdanet"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/borgdanet"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Découvrir */}
          <div>
            <h4 className="font-display text-lg mb-4">Découvrir</h4>
            <ul className="space-y-3 text-white/80">
              <li>
                <Link href="/products" className="hover:text-white transition">
                  Tous les produits
                </Link>
              </li>
              <li>
                <Link href="/products?seasonal=true" className="hover:text-white transition">
                  Produits de saison
                </Link>
              </li>
              <li>
                <Link href="/farms" className="hover:text-white transition">
                  Nos Fermes
                </Link>
              </li>
              <li>
                <Link href="/get-started" className="hover:text-white transition">
                  Nos formules
                </Link>
              </li>
              <li>
                <Link href="/trial" className="hover:text-white transition">
                  Box d&apos;essai
                </Link>
              </li>
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h4 className="font-display text-lg mb-4">À propos</h4>
            <ul className="space-y-3 text-white/80">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  Notre mission
                </Link>
              </li>
              <li>
                <Link href="/about#impact" className="hover:text-white transition">
                  Notre impact
                </Link>
              </li>
              <li>
                <Link href="/register?role=farmer" className="hover:text-white transition">
                  Devenir partenaire
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg mb-4">Contact</h4>
            <ul className="space-y-4 text-white/80">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-brand-gold flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  La Marsa, Tunis<br />
                  Tunisie
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-brand-gold flex-shrink-0" />
                <a href="tel:+21670123456" className="text-sm hover:text-white transition">
                  +216 70 123 456
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-brand-gold flex-shrink-0" />
                <a href="mailto:contact@borgdanet.tn" className="text-sm hover:text-white transition">
                  contact@borgdanet.tn
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm text-white/80 mb-3">Recevez nos actualités</p>
              <form className="flex" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-3 py-2 rounded-l-lg text-brand-brown text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-gold text-brand-brown font-medium rounded-r-lg hover:bg-brand-gold-light transition text-sm"
                >
                  OK
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              &copy; {new Date().getFullYear()} Borgdanet. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 bg-brand-gold rounded-full mr-2"></span>
                100% Bio Certifié
              </span>
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 bg-brand-gold rounded-full mr-2"></span>
                Commerce Équitable
              </span>
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 bg-brand-gold rounded-full mr-2"></span>
                Livraison Fraîche
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
