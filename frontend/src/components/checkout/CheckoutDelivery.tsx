'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface PickupPoint {
  id: string;
  name: string;
  address: string;
  zone: string;
}

interface CheckoutDeliveryProps {
  deliveryType: 'delivery' | 'pickup';
  onDeliveryTypeChange: (type: 'delivery' | 'pickup') => void;
  zone: string;
  onZoneChange: (zone: string) => void;
  deliveryDay: string;
  onDeliveryDayChange: (day: string) => void;
  timeSlot: string;
  onTimeSlotChange: (slot: string) => void;
  pickupPointId: string;
  onPickupPointChange: (id: string) => void;
  address: {
    street: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  onAddressChange: (address: {
    street: string;
    city: string;
    postalCode: string;
    phone: string;
  }) => void;
}

const zones = [
  { id: 'ZONE_A', label: 'Zone A - Tunis centre' },
  { id: 'ZONE_B', label: 'Zone B - Banlieue' },
  { id: 'ZONE_C', label: 'Zone C - Périphérie' },
];

const deliveryDays = [
  { id: 'tuesday', label: 'Mardi' },
  { id: 'thursday', label: 'Jeudi' },
  { id: 'saturday', label: 'Samedi' },
];

const timeSlots = [
  { id: 'morning', label: 'Matin (6h-9h)' },
  { id: 'evening', label: 'Soir (18h-21h)' },
];

export function CheckoutDelivery({
  deliveryType,
  onDeliveryTypeChange,
  zone,
  onZoneChange,
  deliveryDay,
  onDeliveryDayChange,
  timeSlot,
  onTimeSlotChange,
  pickupPointId,
  onPickupPointChange,
  address,
  onAddressChange,
}: CheckoutDeliveryProps) {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);

  useEffect(() => {
    if (deliveryType === 'pickup') {
      const fetchPickupPoints = async () => {
        try {
          const response = await api.get('/pickup-points');
          setPickupPoints(response.data);
        } catch {
          // Mock pickup points for development
          setPickupPoints([
            { id: '1', name: 'Marché Central Tunis', address: 'Rue Charles de Gaulle, Tunis', zone: 'ZONE_A' },
            { id: '2', name: 'Café Bio La Marsa', address: 'Avenue Habib Bourguiba, La Marsa', zone: 'ZONE_B' },
            { id: '3', name: 'Épicerie Verte Ariana', address: 'Centre Ville, Ariana', zone: 'ZONE_B' },
          ]);
        }
      };
      fetchPickupPoints();
    }
  }, [deliveryType]);

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="font-display text-xl text-brand-green mb-6">
        1. Livraison
      </h2>

      {/* Delivery Type Selection */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => onDeliveryTypeChange('delivery')}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            deliveryType === 'delivery'
              ? 'border-brand-green bg-brand-cream'
              : 'border-brand-cream-dark hover:border-brand-green/50'
          }`}
        >
          <div className="font-semibold text-brand-green">🚚 Livraison à domicile</div>
          <div className="text-sm text-brand-brown">Recevez chez vous</div>
        </button>
        <button
          type="button"
          onClick={() => onDeliveryTypeChange('pickup')}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            deliveryType === 'pickup'
              ? 'border-brand-green bg-brand-cream'
              : 'border-brand-cream-dark hover:border-brand-green/50'
          }`}
        >
          <div className="font-semibold text-brand-green">📍 Point de retrait</div>
          <div className="text-sm text-brand-brown">Livraison gratuite</div>
        </button>
      </div>

      {deliveryType === 'delivery' ? (
        <>
          {/* Zone Selection */}
          <div className="mb-4">
            <label className="block text-brand-brown text-sm mb-2">Zone</label>
            <select
              value={zone}
              onChange={(e) => onZoneChange(e.target.value)}
              className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.label}</option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-brand-brown text-sm mb-2">Adresse</label>
              <input
                type="text"
                value={address.street}
                onChange={(e) => onAddressChange({ ...address, street: e.target.value })}
                required
                placeholder="Numéro et nom de rue"
                className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-brand-brown text-sm mb-2">Ville</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => onAddressChange({ ...address, city: e.target.value })}
                required
                placeholder="ex: Tunis"
                className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-brand-brown text-sm mb-2">Code postal</label>
              <input
                type="text"
                value={address.postalCode}
                onChange={(e) => onAddressChange({ ...address, postalCode: e.target.value })}
                required
                placeholder="ex: 1000"
                className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-brand-brown text-sm mb-2">Téléphone</label>
              <input
                type="tel"
                value={address.phone}
                onChange={(e) => onAddressChange({ ...address, phone: e.target.value })}
                required
                placeholder="+216 XX XXX XXX"
                className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="mb-4">
          <label className="block text-brand-brown text-sm mb-2">Point de retrait</label>
          <select
            value={pickupPointId}
            onChange={(e) => onPickupPointChange(e.target.value)}
            required
            className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
          >
            <option value="">Sélectionner un point</option>
            {pickupPoints.map((point) => (
              <option key={point.id} value={point.id}>
                {point.name} - {point.address}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Delivery Schedule */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-brand-brown text-sm mb-2">Jour de livraison</label>
          <select
            value={deliveryDay}
            onChange={(e) => onDeliveryDayChange(e.target.value)}
            className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
          >
            {deliveryDays.map((day) => (
              <option key={day.id} value={day.id}>{day.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-brand-brown text-sm mb-2">Créneau horaire</label>
          <select
            value={timeSlot}
            onChange={(e) => onTimeSlotChange(e.target.value)}
            className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
          >
            {timeSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>{slot.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
