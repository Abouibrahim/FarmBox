'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const isFarmer = searchParams.get('role') === 'farmer';
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
      });
      const { user, token } = response.data;

      setAuth(user, token);

      // Redirect - if farmer, they need to create a farm first
      if (isFarmer) {
        router.push('/farmer/onboarding');
      } else {
        router.push(redirect);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.error || 'Erreur lors de l\'inscription. Veuillez reessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-primary-600">
            FarmBox
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-2">
            {isFarmer ? 'Devenir producteur' : 'Creer un compte'}
          </h1>
          <p className="text-gray-600">
            {isFarmer
              ? 'Vendez vos produits directement aux consommateurs'
              : 'Rejoignez FarmBox et commandez des produits frais'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="label block mb-1">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input pl-10 w-full"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label block mb-1">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input pl-10 w-full"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="label block mb-1">
                Telephone <span className="text-gray-400">(optionnel)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="input pl-10 w-full"
                  placeholder="+216 XX XXX XXX"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label block mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input pl-10 pr-10 w-full"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label block mb-1">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="input pl-10 w-full"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creation du compte...' : 'Creer mon compte'}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            En creant un compte, vous acceptez nos{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">
              conditions d&apos;utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="/privacy" className="text-primary-600 hover:underline">
              politique de confidentialite
            </Link>
          </p>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Deja un compte? </span>
            <Link
              href={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
              className="text-primary-600 font-medium hover:underline"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* Farmer/Customer Toggle */}
        <div className="mt-6 text-center">
          {isFarmer ? (
            <Link
              href={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
              className="text-sm text-gray-600 hover:text-primary-600"
            >
              Je suis un consommateur →
            </Link>
          ) : (
            <Link
              href={`/register?role=farmer${redirect !== '/' ? `&redirect=${redirect}` : ''}`}
              className="text-sm text-gray-600 hover:text-primary-600"
            >
              Je suis un producteur →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
