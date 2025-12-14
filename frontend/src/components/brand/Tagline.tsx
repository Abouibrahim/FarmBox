'use client';

interface TaglineProps {
  variant?: 'french' | 'arabic' | 'both';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Tagline({ variant = 'both', size = 'md', className = '' }: TaglineProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`${className}`}>
      {(variant === 'french' || variant === 'both') && (
        <p className={`${sizeClasses[size]} text-brand-brown font-medium`}>
          Local food. Trusted farms. Shared abundance.
        </p>
      )}
      {(variant === 'arabic' || variant === 'both') && (
        <p className={`${sizeClasses[size]} text-brand-brown font-arabic mt-1`} dir="rtl">
          أكل بلدي. فلاحة موثوقة. خير مشترك.
        </p>
      )}
    </div>
  );
}

export default Tagline;
