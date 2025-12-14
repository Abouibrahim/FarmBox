'use client';

import Link from 'next/link';
import { Tagline } from '../brand/Tagline';

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
      {/* Background with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(45, 90, 39, 0.75), rgba(45, 90, 39, 0.6)), url('/images/heroes/hero-farm.jpg')`,
          backgroundColor: '#2D5A27',
        }}
      />

      {/* Pattern overlay for texture */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Main Tagline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-4 leading-tight">
            Local food. Trusted farms.
            <br />
            <span className="text-brand-gold">Shared abundance.</span>
          </h1>

          {/* Arabic Tagline */}
          <p className="font-arabic text-2xl md:text-3xl text-white/90 mb-6" dir="rtl">
            أكل بلدي. فلاحة موثوقة. خير مشترك.
          </p>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
            Des produits frais et bio, livrés chaque semaine directement de nos fermes
            tunisiennes partenaires. Connaissez vos fermiers, savourez la différence.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-gold text-brand-brown font-semibold rounded-lg hover:bg-brand-gold-light transition-colors text-lg"
            >
              Commencer
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/farms"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-lg border-2 border-white/30 hover:bg-white/20 transition-colors text-lg"
            >
              Découvrir les fermes
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Livraison gratuite dès 80 TND
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% Bio certifié
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Sans engagement
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#FDF8F0"
          />
        </svg>
      </div>
    </section>
  );
}

export default HeroSection;
