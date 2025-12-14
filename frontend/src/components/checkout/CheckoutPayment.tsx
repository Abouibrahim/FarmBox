'use client';

interface CheckoutPaymentProps {
  paymentMethod: 'flouci' | 'cash';
  onPaymentMethodChange: (method: 'flouci' | 'cash') => void;
}

export function CheckoutPayment({
  paymentMethod,
  onPaymentMethodChange,
}: CheckoutPaymentProps) {
  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="font-display text-xl text-brand-green mb-6">
        2. Paiement
      </h2>

      <div className="space-y-3">
        {/* Cash Option */}
        <button
          type="button"
          onClick={() => onPaymentMethodChange('cash')}
          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
            paymentMethod === 'cash'
              ? 'border-brand-green bg-brand-cream'
              : 'border-brand-cream-dark hover:border-brand-green/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === 'cash' ? 'border-brand-green' : 'border-brand-cream-dark'
            }`}>
              {paymentMethod === 'cash' && (
                <div className="w-3 h-3 rounded-full bg-brand-green" />
              )}
            </div>
            <div>
              <div className="font-semibold text-brand-green flex items-center gap-2">
                💵 Paiement à la livraison
              </div>
              <div className="text-sm text-brand-brown">
                Payez en espèces lors de la réception de votre commande
              </div>
            </div>
          </div>
        </button>

        {/* Flouci Option */}
        <button
          type="button"
          onClick={() => onPaymentMethodChange('flouci')}
          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
            paymentMethod === 'flouci'
              ? 'border-brand-green bg-brand-cream'
              : 'border-brand-cream-dark hover:border-brand-green/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === 'flouci' ? 'border-brand-green' : 'border-brand-cream-dark'
            }`}>
              {paymentMethod === 'flouci' && (
                <div className="w-3 h-3 rounded-full bg-brand-green" />
              )}
            </div>
            <div>
              <div className="font-semibold text-brand-green flex items-center gap-2">
                💳 Paiement en ligne (Flouci)
                <span className="text-xs bg-brand-gold/20 text-brand-brown px-2 py-0.5 rounded">Rapide</span>
              </div>
              <div className="text-sm text-brand-brown">
                Paiement sécurisé par carte bancaire tunisienne
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Security Note */}
      <div className="mt-6 p-4 bg-brand-cream rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div className="text-sm text-brand-brown">
            <strong className="text-brand-green">Paiement 100% sécurisé</strong>
            <p className="mt-1">
              Vos informations de paiement sont protégées et ne sont jamais stockées sur nos serveurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
