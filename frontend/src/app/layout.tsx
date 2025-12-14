import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Borgdanet - Produits bio locaux | Tunisie',
  description: 'Commandez des produits frais et bio directement de nos fermes tunisiennes. Local food. Trusted farms. Shared abundance.',
  keywords: 'bio, organique, ferme, tunisie, livraison, legumes, fruits, huile olive, borgdanet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Arabic font from Google Fonts CDN */}
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-brand-cream min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
