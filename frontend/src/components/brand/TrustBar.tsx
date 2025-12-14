'use client';

import { useEffect, useState } from 'react';

interface TrustMetric {
  icon: string;
  value: number;
  label: string;
  suffix?: string;
}

const defaultMetrics: TrustMetric[] = [
  { icon: '🌱', value: 45, label: 'Fermes partenaires', suffix: '+' },
  { icon: '📦', value: 12000, label: 'Livraisons réussies', suffix: '+' },
  { icon: '⭐', value: 4.9, label: 'Satisfaction client', suffix: '/5' },
  { icon: '🏆', value: 100, label: 'Bio Certifié', suffix: '%' },
];

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current * 10) / 10);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatted = value >= 1000
    ? `${(displayValue / 1000).toFixed(displayValue >= value ? 1 : 0)}k`
    : displayValue.toLocaleString('fr-TN');

  return (
    <span>
      {formatted}{suffix}
    </span>
  );
}

interface TrustBarProps {
  metrics?: TrustMetric[];
  className?: string;
}

export function TrustBar({ metrics = defaultMetrics, className = '' }: TrustBarProps) {
  return (
    <div className={`bg-white py-4 shadow-sm ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center lg:justify-between items-center gap-6 lg:gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-4"
            >
              <span className="text-2xl">{metric.icon}</span>
              <div>
                <p className="text-xl font-bold text-brand-green">
                  <AnimatedCounter value={metric.value} suffix={metric.suffix} />
                </p>
                <p className="text-sm text-brand-brown">{metric.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrustBar;
