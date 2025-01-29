'use client';
import Link from "next/link";
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function Home() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, loading } = useAuth();
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCars, setFilteredCars] = useState([]);

  // Récupérer les annonces depuis l'API
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setError(null);
        const response = await fetch('/api/ads');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de la récupération des annonces');
        }

        if (data.error) {
          throw new Error(data.error);
        }

        setCars(data);
      } catch (error) {
        console.error('Erreur détaillée:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Effet pour filtrer les annonces
  useEffect(() => {
    if (!cars) return;
    
    const filtered = cars.filter(car => 
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.style.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCars(filtered);
  }, [searchTerm, cars]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white dark:bg-black relative">
        <Navbar />
        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto px-8 pt-32 pb-12">
          <div className="mb-12">
            <input
              type="text"
              placeholder="Rechercher une annonce..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              Annonces récentes
            </h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="self-end sm:self-auto px-4 py-2 rounded-full border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
            >
              Filtrer
            </motion.button>
          </div>

          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse bg-white dark:bg-gray-800 h-80" />
              ))}
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black/60 dark:text-white/60">
                Aucune annonce ne correspond à votre recherche
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredCars.map((car) => (
                <Link 
                  key={car.id} 
                  href={`/annonce/${car.id}-${car.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="group"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden mb-4">
                      <img
                        src={car.images[0] || '/images/default-car.jpg'}
                        alt={car.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-light uppercase tracking-wider">
                          {car.name}
                        </h3>
                        <span className="text-lg">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(car.price)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-black/60 dark:text-white/60">
                        <span>{car.style}</span>
                        <span>•</span>
                        <span>{car.type}</span>
                        <span>•</span>
                        <span>{car.color}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-black/60 dark:text-white/60">
                        <span>{car.location}</span>
                        <span>{car.user?.first_name} {car.user?.last_name}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
}