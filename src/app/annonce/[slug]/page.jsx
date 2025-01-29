'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import Navbar from '@/components/Navbar';

export default function AnnonceDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await fetch(`/api/ads/${params.slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de la récupération de l\'annonce');
        }

        setCar(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [params.slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/signin');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          adId: car.id,
          receiverId: car.user_id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du message');
      }

      setMessage('');
      setShowForm(false);
      setSuccess('Message envoyé avec succès !');

      router.push('/messages');
    } catch (error) {
      setError(error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return null;
  if (error) return <div>Erreur: {error}</div>;
  if (!car) return <div>Annonce non trouvée</div>;

  return (
    <PageTransition>
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        {/* Contenu principal */}
        <main className="pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Galerie d'images */}
              <div className="space-y-8">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={car.images[0] || '/images/default-car.jpg'}
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {car.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {car.images.slice(1).map((image, index) => (
                      <div key={index} className="aspect-square overflow-hidden">
                        <img
                          src={image}
                          alt={`${car.name} - Vue ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Informations */}
              <div className="lg:pt-12 space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl font-light tracking-wider uppercase">
                    {car.name}
                  </h1>
                  <div className="text-3xl font-light">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(car.price)}
                  </div>
                </div>

                <div className="space-y-6 text-black/60 dark:text-white/60">
                  <p className="text-lg">{car.description}</p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="uppercase text-sm tracking-wider">Marque</span>
                      <span className="text-black dark:text-white">{car.style}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="uppercase text-sm tracking-wider">Type</span>
                      <span className="text-black dark:text-white">{car.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="uppercase text-sm tracking-wider">Couleur</span>
                      <span className="text-black dark:text-white">{car.color}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="uppercase text-sm tracking-wider">Localisation</span>
                      <span className="text-black dark:text-white">{car.location}</span>
                    </div>
                  </div>

                  <div className="pt-8">
                    <div className="flex items-center gap-4">
                      <span className="uppercase text-sm tracking-wider">Vendeur</span>
                      <span className="text-black dark:text-white">
                        {car.user?.first_name} {car.user?.last_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section contact */}
                {!showForm ? (
                  <motion.button
                    onClick={() => setShowForm(true)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="glass-button w-full"
                  >
                    Contacter le vendeur
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-light tracking-wider uppercase">
                      Envoyer un message
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Votre message..."
                          className="glass-input w-full h-32 resize-none"
                          required
                        />
                      </div>

                      <div className="flex gap-4">
                        <motion.button
                          type="button"
                          onClick={() => setShowForm(false)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="glass-button flex-1"
                        >
                          Annuler
                        </motion.button>
                        
                        <motion.button
                          type="submit"
                          disabled={sending}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="glass-button flex-1"
                        >
                          {sending ? 'Envoi...' : 'Envoyer'}
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
} 