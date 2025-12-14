'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu, LogOut, Store, Package, X, ChevronDown, Search, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useState, useRef, useEffect } from 'react';
import { Logo } from '@/components/brand/Logo';

const CATEGORIES = [
  { id: 'vegetables', name: 'Légumes', emoji: '🥬' },
  { id: 'fruits', name: 'Fruits', emoji: '🍎' },
  { id: 'herbs', name: 'Herbes & Aromates', emoji: '🌿' },
  { id: 'eggs', name: 'Oeufs', emoji: '🥚' },
  { id: 'honey', name: 'Miel', emoji: '🍯' },
  { id: 'olive-oil', name: "Huile d'olive", emoji: '🫒' },
  { id: 'dairy', name: 'Produits laitiers', emoji: '🧀' },
  { id: 'mixed', name: 'Paniers Mixtes', emoji: '🧺' },
];

export default function Header() {
  const router = useRouter();
  const itemCount = useCartStore((state) => state.getItemCount());
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const productsMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // Close products menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productsMenuRef.current && !productsMenuRef.current.contains(e.target as Node)) {
        setProductsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Products Mega Menu */}
            <div className="relative" ref={productsMenuRef}>
              <button
                onClick={() => setProductsMenuOpen(!productsMenuOpen)}
                className="flex items-center text-brand-brown hover:text-brand-green transition font-medium"
              >
                Découvrir
                <ChevronDown className={`h-4 w-4 ml-1 transition ${productsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {productsMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-brand-cream-dark py-3 z-50">
                  <Link
                    href="/products"
                    onClick={() => setProductsMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-brand-green font-medium hover:bg-brand-cream"
                  >
                    <Package className="h-4 w-4 mr-3" />
                    Tous les produits
                  </Link>
                  <Link
                    href="/products?seasonal=true"
                    onClick={() => setProductsMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-brand-terracotta font-medium hover:bg-brand-cream"
                  >
                    <span className="mr-3">🍊</span>
                    Produits de saison
                  </Link>
                  <hr className="my-2 border-brand-cream-dark" />
                  <p className="px-4 py-1 text-xs font-semibold text-brand-brown/60 uppercase">Catégories</p>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.id}`}
                      onClick={() => setProductsMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-brand-brown hover:bg-brand-cream transition"
                    >
                      <span className="mr-3 text-lg">{cat.emoji}</span>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/farms"
              className="text-brand-brown hover:text-brand-green transition font-medium"
            >
              Nos Fermes
            </Link>

            <Link
              href="/get-started"
              className="text-brand-brown hover:text-brand-green transition font-medium"
            >
              S&apos;abonner
            </Link>

            <Link
              href="/about"
              className="text-brand-brown hover:text-brand-green transition font-medium"
            >
              À Propos
            </Link>
          </nav>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-brown/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="pl-9 pr-4 py-2 w-48 border border-brand-cream-dark rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm bg-brand-cream/50"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-brand-cream rounded-lg transition">
              <ShoppingCart className="h-5 w-5 text-brand-brown" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-green text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-brand-cream transition"
                >
                  <div className="w-8 h-8 bg-brand-green/10 rounded-full flex items-center justify-center">
                    <span className="text-brand-green font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-brand-brown">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-20 border border-brand-cream-dark">
                      <div className="px-4 py-3 border-b border-brand-cream-dark">
                        <p className="font-medium text-brand-green">{user.name}</p>
                        <p className="text-sm text-brand-brown/70">{user.email}</p>
                      </div>

                      {user.role === 'FARMER' ? (
                        <>
                          <Link
                            href="/farmer"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-brand-brown hover:bg-brand-cream"
                          >
                            <Store className="h-4 w-4 mr-3" />
                            Tableau de bord
                          </Link>
                          <Link
                            href="/farmer/products"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-brand-brown hover:bg-brand-cream"
                          >
                            <Package className="h-4 w-4 mr-3" />
                            Mes produits
                          </Link>
                          <Link
                            href="/farmer/orders"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-brand-brown hover:bg-brand-cream"
                          >
                            <ShoppingCart className="h-4 w-4 mr-3" />
                            Commandes
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-brand-brown hover:bg-brand-cream"
                          >
                            <User className="h-4 w-4 mr-3" />
                            Mon compte
                          </Link>
                          <Link
                            href="/dashboard/orders"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-brand-brown hover:bg-brand-cream"
                          >
                            <Package className="h-4 w-4 mr-3" />
                            Mes commandes
                          </Link>
                          <Link
                            href="/dashboard/subscriptions"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-brand-brown hover:bg-brand-cream"
                          >
                            <Heart className="h-4 w-4 mr-3" />
                            Mes abonnements
                          </Link>
                        </>
                      )}

                      <hr className="my-2 border-brand-cream-dark" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-brand-terracotta hover:bg-red-50 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-brand-brown hover:text-brand-green font-medium transition"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-brand-green-dark transition font-medium"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-brand-cream rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-brand-brown" />
              ) : (
                <Menu className="h-6 w-6 text-brand-brown" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-brand-cream-dark">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-brown/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full pl-9 pr-4 py-2 border border-brand-cream-dark rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent bg-brand-cream/50"
                />
              </div>
            </form>

            <nav className="flex flex-col space-y-1">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-green hover:bg-brand-cream font-medium py-2 px-3 rounded-lg"
              >
                Tous les produits
              </Link>

              <Link
                href="/products?seasonal=true"
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-terracotta hover:bg-brand-cream font-medium py-2 px-3 rounded-lg flex items-center"
              >
                <span className="mr-2">🍊</span>
                Produits de saison
              </Link>

              <div className="py-2 px-3">
                <span className="text-xs font-semibold text-brand-brown/60 uppercase">Catégories</span>
              </div>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-brand-brown hover:bg-brand-cream py-2 px-3 rounded-lg flex items-center"
                >
                  <span className="mr-2">{cat.emoji}</span>
                  {cat.name}
                </Link>
              ))}

              <hr className="my-2 border-brand-cream-dark" />

              <Link
                href="/farms"
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-brown hover:text-brand-green font-medium py-2 px-3"
              >
                Nos Fermes
              </Link>

              <Link
                href="/get-started"
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-brown hover:text-brand-green font-medium py-2 px-3"
              >
                S&apos;abonner
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-brown hover:text-brand-green font-medium py-2 px-3"
              >
                À Propos
              </Link>

              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-3 border-t border-brand-cream-dark mt-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-brand-brown font-medium"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center bg-brand-green text-white py-2 rounded-lg font-medium"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
