'use client';

const standards = [
  {
    icon: '🌱',
    title: '100% Bio Certifié',
    description: 'Tous nos produits sont certifiés bio ou en conversion vers l\'agriculture biologique.',
  },
  {
    icon: '🔍',
    title: 'Traçabilité Totale',
    description: 'Suivez votre nourriture de la graine à l\'assiette. Connaissez votre fermier.',
  },
  {
    icon: '🤝',
    title: 'Prix Justes aux Fermiers',
    description: 'Nos fermiers reçoivent 70%+ du prix final. Un commerce équitable et transparent.',
  },
  {
    icon: '🌍',
    title: 'Agriculture Régénératrice',
    description: 'Des pratiques qui régénèrent les sols et favorisent la biodiversité.',
  },
];

export function StandardsSection() {
  return (
    <section className="py-16 lg:py-24 bg-brand-cream">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl text-brand-green mb-4">
            Nos engagements
          </h2>
          <p className="text-lg text-brand-brown max-w-2xl mx-auto">
            Ce qui fait la différence Borgdanet
          </p>
        </div>

        {/* Standards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {standards.map((standard, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 lg:p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-brand-cream rounded-full flex items-center justify-center text-3xl">
                {standard.icon}
              </div>

              {/* Title */}
              <h3 className="font-display text-xl text-brand-green mb-3">
                {standard.title}
              </h3>

              {/* Description */}
              <p className="text-brand-brown text-sm leading-relaxed">
                {standard.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StandardsSection;
