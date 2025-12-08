'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(formData);
      const { user, token } = response.data;

      setAuth(user, token);

      // Redirect based on role or redirect param
      if (user.role === 'FARMER') {
        router.push('/farmer');
      } else if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(redirect);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error || 'Identifiants incorrects. Veuillez reessayer.'
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
            Bon retour!
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour acceder a votre compte
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Pas encore de compte? </span>
            <Link
              href={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
              className="text-primary-600 font-medium hover:underline"
            >
              Creer un compte
            </Link>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm">
          <p className="font-medium text-gray-700 mb-2">Comptes de demonstration:</p>
          <div className="space-y-1 text-gray-600">
            <p>Client: sonia@example.tn / customer123</p>
            <p>Fermier: ahmed@fermebensalem.tn / farmer123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
