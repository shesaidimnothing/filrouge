'use client';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function SignUp() {
  const { darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    birthday: '',
    gender: '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Validation côté client
      if (!formData.email || !formData.password) {
        throw new Error('Email et mot de passe sont requis');
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
      if (!passwordRegex.test(formData.password)) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères, une majuscule et une minuscule');
      }

      // Créer l'utilisateur
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      // Connecter automatiquement l'utilisateur
      await login({
        email: formData.email,
        password: formData.password,
      });

      router.push('/');
    } catch (error) {
      console.error('Erreur complète:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formControls = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <main className="max-w-xl mx-auto px-8 pt-32">
          <Link href="/">
            <span className="nav-link">← Retour</span>
          </Link>

          <div className="mt-16 mb-12">
            <h1 className="text-3xl font-light tracking-wider uppercase mb-8">
              Inscription
            </h1>

            {error && (
              <div className="mb-6 text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm uppercase tracking-wider mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="glass-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-wider mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="glass-input w-full"
                    required
                  />
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm uppercase tracking-wider mb-2">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="glass-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-wider mb-2">
                    Genre
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="glass-input w-full"
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                    <option value="O">Autre</option>
                  </select>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="glass-button w-full mt-8"
              >
                {loading ? 'Inscription en cours...' : 'S\'inscrire'}
              </motion.button>
            </form>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
