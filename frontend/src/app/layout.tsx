import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FarmBox - Produits bio locaux | Tunisie',
  description: 'Commandez des produits frais et bio directement de nos fermes tunisiennes. Livraison a domicile dans la region de Tunis.',
  keywords: 'bio, organique, ferme, tunisie, livraison, legumes, fruits, huile olive',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
