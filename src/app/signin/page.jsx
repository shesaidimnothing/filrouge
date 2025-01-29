'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import Navbar from '@/components/Navbar';

export default function SignIn() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      router.push('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <main className="max-w-md mx-auto px-8 pt-32">
          <Link href="/">
            <span className="nav-link">← Retour</span>
          </Link>

          <div className="mt-16 mb-12">
            <h1 className="text-3xl font-light tracking-wider uppercase mb-8">
              Connexion
            </h1>

            {error && (
              <div className="mb-6 text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="glass-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm uppercase tracking-wider mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="glass-input w-full"
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="glass-button w-full mt-8"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </motion.button>

              <div className="text-center text-sm">
                <span className="text-black/60 dark:text-white/60">
                  Pas encore de compte ?{' '}
                </span>
                <Link href="/signup">
                  <span className="nav-link">S'inscrire</span>
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
