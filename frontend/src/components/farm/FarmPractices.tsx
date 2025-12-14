'use client';

interface FarmPracticesProps {
  practices: string[];
}

const practiceIcons: Record<string, string> = {
  'Rotation des cultures': '🔄',
  'Compostage': '🍂',
  'Irrigation goutte-à-goutte': '💧',
  'Zéro pesticides': '🚫',
  'Semences paysannes': '🌱',
  'Agroforesterie': '🌳',
  'Énergie solaire': '☀️',
  'Permaculture': '🌿',
  'Agriculture biologique': '🌱',
  'Élevage en plein air': '🐔',
  'Apiculture naturelle': '🐝',
  'Conservation des sols': '🏔️',
  'Biodiversité': '🦋',
  'Récupération eau de pluie': '🌧️',
};

const practiceDescriptions: Record<string, string> = {
  'Rotation des cultures': 'Nous alternons les cultures pour préserver la fertilité naturelle du sol.',
  'Compostage': 'Nos déchets organiques sont transformés en compost naturel pour nourrir la terre.',
  'Irrigation goutte-à-goutte': 'Système économe en eau qui cible directement les racines des plantes.',
  'Zéro pesticides': 'Aucun pesticide chimique - uniquement des méthodes naturelles de protection.',
  'Semences paysannes': 'Nous préservons et utilisons des variétés locales traditionnelles.',
  'Agroforesterie': 'Association arbres et cultures pour un écosystème équilibré.',
  'Énergie solaire': 'Notre ferme fonctionne en partie grâce à l\'énergie solaire.',
  'Permaculture': 'Design inspiré de la nature pour une agriculture durable.',
};

export function FarmPractices({ practices }: FarmPracticesProps) {
  if (practices.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🌱</div>
        <p className="text-brand-brown">
          Informations sur les pratiques agricoles bientôt disponibles.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-brand-green mb-6">
        Nos pratiques agricoles
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        {practices.map((practice, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-brand-cream rounded-lg"
          >
            <span className="text-2xl flex-shrink-0">
              {practiceIcons[practice] || '✓'}
            </span>
            <div>
              <h3 className="font-medium text-brand-green">{practice}</h3>
              {practiceDescriptions[practice] && (
                <p className="text-sm text-brand-brown mt-1">
                  {practiceDescriptions[practice]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-brand-green/5 rounded-lg border border-brand-green/20">
        <h3 className="font-semibold text-brand-green mb-2">
          🌍 Notre engagement régénératif
        </h3>
        <p className="text-brand-brown">
          Ces pratiques contribuent à régénérer les sols, préserver la biodiversité
          et réduire notre empreinte carbone. En choisissant nos produits, vous
          soutenez une agriculture qui nourrit les gens et la planète.
        </p>
      </div>
    </div>
  );
}
