'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu, LogOut, Store, Package, X } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';

export default function Header() {
  const router = useRouter();
  const itemCount = useCartStore((state) => state.getItemCount());
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">FarmBox</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/farms"
              className="text-gray-600 hover:text-primary-600 transition font-medium"
            >
              Nos Fermes
            </Link>
            <Link
              href="/#how-it-works"
              className="text-gray-600 hover:text-primary-600 transition font-medium"
            >
              Comment ca marche
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20 border">
                      <div className="px-4 py-2 border-b">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>

                      {user.role === 'FARMER' ? (
                        <>
                          <Link
                            href="/farmer"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            <Store className="h-4 w-4 mr-3" />
                            Tableau de bord
                          </Link>
                          <Link
                            href="/farmer/products"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            <Package className="h-4 w-4 mr-3" />
                            Mes produits
                          </Link>
                          <Link
                            href="/farmer/orders"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
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
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            <User className="h-4 w-4 mr-3" />
                            Mon compte
                          </Link>
                          <Link
                            href="/dashboard/orders"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            <Package className="h-4 w-4 mr-3" />
                            Mes commandes
                          </Link>
                        </>
                      )}

                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Deconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-primary-600 font-medium transition"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/farms"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-primary-600 font-medium py-2"
              >
                Nos Fermes
              </Link>
              <Link
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-primary-600 font-medium py-2"
              >
                Comment ca marche
              </Link>
              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-3 border-t">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-gray-600 font-medium"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center bg-primary-600 text-white py-2 rounded-lg font-medium"
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
