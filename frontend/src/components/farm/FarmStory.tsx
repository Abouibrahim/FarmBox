'use client';

import Image from 'next/image';

interface FarmStoryProps {
  story: string;
  farmerName?: string;
  gallery: string[];
}

export function FarmStory({ story, farmerName, gallery }: FarmStoryProps) {
  return (
    <div>
      <h2 className="font-display text-2xl text-brand-green mb-6">
        Notre histoire
      </h2>

      {/* Story Text */}
      <div className="prose prose-lg max-w-none text-brand-brown mb-8">
        {story.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-4">{paragraph}</p>
        ))}
      </div>

      {/* Photo Gallery */}
      {gallery.length > 0 && (
        <div>
          <h3 className="font-semibold text-brand-green mb-4">
            La vie à la ferme
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={image}
                  alt={`${farmerName || 'Ferme'} - Photo ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
