'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Zone = 'ZONE_A' | 'ZONE_B' | 'ZONE_C';
type DeliveryDay = 'tuesday' | 'thursday' | 'saturday';
type TimeSlot = 'morning' | 'evening';

const zones = [
  { id: 'ZONE_A' as Zone, name: 'Zone A - Tunis centre', areas: 'La Marsa, Carthage, Sidi Bou Said, Les Berges du Lac', fee: 5, freeThreshold: 80 },
  { id: 'ZONE_B' as Zone, name: 'Zone B - Banlieue', areas: 'Ariana, Ben Arous, Manouba, Soukra', fee: 8, freeThreshold: 120 },
  { id: 'ZONE_C' as Zone, name: 'Zone C - Périphérie', areas: 'Hammamet, Nabeul, Bizerte', fee: 12, freeThreshold: 150 },
];

const deliveryDays = [
  { id: 'tuesday' as DeliveryDay, label: 'Mardi' },
  { id: 'thursday' as DeliveryDay, label: 'Jeudi' },
  { id: 'saturday' as DeliveryDay, label: 'Samedi' },
];

const timeSlots = [
  { id: 'morning' as TimeSlot, label: 'Matin', time: '6h-9h', icon: '🌅' },
  { id: 'evening' as TimeSlot, label: 'Soir', time: '18h-21h', icon: '🌙' },
];

const boxPrices: Record<string, number> = {
  trial: 33,
  essentiel: 45,
  famille: 75,
  gourmet: 120,
};

export default function DeliveryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boxType = searchParams.get('box') || 'essentiel';
  const frequency = searchParams.get('frequency') || 'weekly';

  const [zone, setZone] = useState<Zone>('ZONE_B');
  const [deliveryDay, setDeliveryDay] = useState<DeliveryDay>('thursday');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('evening');

  const selectedZone = zones.find(z => z.id === zone);
  const boxPrice = boxPrices[boxType] || 45;
  const isFreeDelivery = selectedZone && boxPrice >= selectedZone.freeThreshold;

  const handleContinue = () => {
    // Store delivery preferences
    const existing = JSON.parse(sessionStorage.getItem('borgdanet-customization') || '{}');
    sessionStorage.setItem('borgdanet-customization', JSON.stringify({
      ...existing,
      zone,
      deliveryDay,
      timeSlot,
    }));
    router.push(`/get-started/checkout?box=${boxType}&frequency=${frequency}`);
  };

  // Calculate next delivery date
  const getNextDeliveryDate = () => {
    const today = new Date();
    const dayMap: Record<DeliveryDay, number> = {
      tuesday: 2,
      thursday: 4,
      saturday: 6,
    };
    const targetDay = dayMap[deliveryDay];
    const daysUntil = (targetDay - today.getDay() + 7) % 7 || 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    return nextDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <main className="min-h-screen bg-brand-cream py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm">✓</div>
              <span className="ml-2 text-brand-green hidden sm:inline">Formule</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-brand-green" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm">✓</div>
              <span className="ml-2 text-brand-green hidden sm:inline">Personnaliser</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-brand-green" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm font-semibold">3</div>
              <span className="ml-2 text-brand-green font-medium hidden sm:inline">Livraison</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-brand-cream-dark" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-cream-dark text-brand-brown flex items-center justify-center text-sm">4</div>
              <span className="ml-2 text-brand-brown hidden sm:inline">Finaliser</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-brand-green mb-2">
            Choisissez votre livraison
          </h1>
          <p className="text-brand-brown">Étape 3 sur 4</p>
        </div>

        {/* Zone Selection */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-brand-green mb-4">Votre zone de livraison</h2>

          {/* Zone Map Placeholder */}
          <div className="bg-brand-cream rounded-xl p-6 mb-4 text-center">
            <div className="text-6xl mb-2">🗺️</div>
            <p className="text-brand-brown text-sm">
              Nous livrons dans le Grand Tunis et certaines villes côtières
            </p>
          </div>

          {/* Zone Options */}
          <div className="space-y-3">
            {zones.map((z) => {
              const isSelected = zone === z.id;
              const qualifiesForFree = boxPrice >= z.freeThreshold;

              return (
                <button
                  key={z.id}
                  onClick={() => setZone(z.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-brand-green bg-brand-cream'
                      : 'border-brand-cream-dark hover:border-brand-green/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-brand-green' : 'border-brand-cream-dark'
                      }`}>
                        {isSelected && <div className="w-3 h-3 rounded-full bg-brand-green" />}
                      </div>
                      <span className="font-medium text-brand-green">{z.name}</span>
                    </div>
                    <span className={`text-sm font-medium ${qualifiesForFree ? 'text-brand-green' : 'text-brand-brown'}`}>
                      {qualifiesForFree ? 'Gratuit ✓' : `${z.fee} TND`}
                    </span>
                  </div>
                  <div className="ml-8 text-sm text-brand-brown">
                    {z.areas}
                  </div>
                  {!qualifiesForFree && (
                    <div className="ml-8 text-xs text-brand-gold mt-1">
                      Gratuit dès {z.freeThreshold} TND
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Delivery Day */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-brand-green mb-4">Jour de livraison</h2>
          <div className="grid grid-cols-3 gap-3">
            {deliveryDays.map((day) => (
              <button
                key={day.id}
                onClick={() => setDeliveryDay(day.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  deliveryDay === day.id
                    ? 'border-brand-green bg-brand-cream'
                    : 'border-brand-cream-dark hover:border-brand-green/50'
                }`}
              >
                <div className="font-medium text-brand-green">{day.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slot */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-brand-green mb-4">Créneau horaire</h2>
          <div className="grid grid-cols-2 gap-4">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setTimeSlot(slot.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  timeSlot === slot.id
                    ? 'border-brand-green bg-brand-cream'
                    : 'border-brand-cream-dark hover:border-brand-green/50'
                }`}
              >
                <div className="text-3xl mb-2">{slot.icon}</div>
                <div className="font-medium text-brand-green">{slot.label}</div>
                <div className="text-sm text-brand-brown">{slot.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-brand-gold/10 border border-brand-gold rounded-xl p-4 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-brand-green font-medium">Première livraison prévue:</span>
              <p className="text-brand-brown capitalize">
                {getNextDeliveryDate()}, {timeSlots.find(s => s.id === timeSlot)?.time}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-brand-brown">Frais de livraison</span>
              <p className={`font-semibold ${isFreeDelivery ? 'text-brand-green' : 'text-brand-brown'}`}>
                {isFreeDelivery ? 'Gratuit' : `${selectedZone?.fee} TND`}
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-brand-green mb-3">Comment ça marche</h3>
          <ul className="space-y-2 text-sm text-brand-brown">
            <li className="flex items-start gap-2">
              <span className="text-brand-green">✓</span>
              <span>Livraison à domicile par nos livreurs partenaires</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-green">✓</span>
              <span>SMS de confirmation le jour de la livraison</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-green">✓</span>
              <span>Possibilité de modifier le créneau jusqu&apos;à 48h avant</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-green">✓</span>
              <span>Produits frais emballés dans des sacs isothermes</span>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link
            href={`/get-started/customize?box=${boxType}&frequency=${frequency}`}
            className="text-brand-brown hover:text-brand-green transition-colors"
          >
            ← Retour
          </Link>
          <button
            onClick={handleContinue}
            className="w-full sm:w-auto px-8 py-4 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
          >
            Continuer →
          </button>
        </div>
      </div>
    </main>
  );
}
