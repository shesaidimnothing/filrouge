'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import Navbar from '@/components/Navbar';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const socket = useSocket(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
  const messagesEndRef = useRef(null);
  const [deletingMessage, setDeletingMessage] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Charger les conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/messages/conversations');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setConversations(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Charger les messages de la conversation courante
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentConversation) return;

      try {
        setMessages([]); // Réinitialiser les messages lors du changement de conversation
        const response = await fetch(`/api/messages/${currentConversation.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setMessages(data.messages);
        // Mettre à jour les informations de l'annonce et de l'autre utilisateur
        setCurrentConversation(prev => ({
          ...prev,
          ad: data.ad,
          otherUser: data.otherUser
        }));
        scrollToBottom();
      } catch (error) {
        setError(error.message);
      }
    };

    fetchMessages();
  }, [currentConversation?.id]);

  // Socket.IO listeners
  useEffect(() => {
    if (socket && user && currentConversation) {
      socket.emit('join_conversation', currentConversation.id);

      socket.on('receive_message', (message) => {
        if (message.conversationId === currentConversation.id) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, user, currentConversation]);

  // Marquer un message comme lu
  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du marquage comme lu');
      }

      // Mettre à jour l'état local
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Supprimer un message
  const deleteMessage = async (messageId) => {
    try {
      setDeletingMessage(messageId);
      const response = await fetch(`/api/messages/${messageId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deleted: true }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Mettre à jour l'état local
      setMessages(messages.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setDeletingMessage(null);
    }
  };

  // Dans le composant Messages, ajoutez cette fonction pour marquer les messages comme lus
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!currentConversation || !messages.length) return;

      const unreadMessages = messages.filter(
        msg => !msg.read && msg.receiver_id === user?.id
      );

      for (const msg of unreadMessages) {
        await markAsRead(msg.id);
      }
    };

    markMessagesAsRead();
  }, [currentConversation, messages]);

  // Modifier le handleSubmit pour mieux gérer l'état sent
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation) return;

    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      content: newMessage,
      sender_id: user.id,
      receiver_id: currentConversation.otherUser.id,
      sent: false,
      read: false,
      created_at: new Date(),
    };

    // Ajouter le message temporaire
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    scrollToBottom();

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          adId: currentConversation.ad.id,
          receiverId: user.id === currentConversation.seller.id 
            ? currentConversation.otherUser.id 
            : currentConversation.seller.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Remplacer le message temporaire par le vrai message
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...data, sent: true } : msg
      ));

      socket.emit('send_message', {
        ...data,
        adId: currentConversation.ad.id,
      });
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, error: true } : msg
      ));
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-8 pt-32">
        <div className="flex h-[calc(100vh-200px)] bg-white/50 dark:bg-black/50 backdrop-blur-lg rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
          {/* Liste des conversations */}
          <div className="w-80 border-r border-black/10 dark:border-white/10">
            <div className="p-4 border-b border-black/10 dark:border-white/10">
              <h2 className="text-lg font-medium">Messages</h2>
            </div>
            
            <div className="overflow-y-auto h-full">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setCurrentConversation(conv)}
                  className={`p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 ${
                    currentConversation?.id === conv.id
                      ? 'bg-black/5 dark:bg-white/5'
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-lg">
                      <img 
                        src={conv.ad.image || '/images/default-car.jpg'} 
                        alt={conv.ad.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conv.ad.name}
                      </p>
                      <p className="text-xs text-black/40 dark:text-white/40">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(conv.ad.price)}
                      </p>
                      <p className="text-sm text-black/60 dark:text-white/60 truncate">
                        {conv.lastMessage?.content || 'Aucun message'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone des messages */}
          <div className="flex-1 flex flex-col relative">
            {currentConversation ? (
              <>
                {/* En-tête de la conversation */}
                <div className="sticky top-0 bg-white/50 dark:bg-black/50 backdrop-blur-lg border-b border-black/10 dark:border-white/10 z-10">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">
                          {currentConversation.ad.name}
                        </h3>
                        <p className="text-sm text-black/60 dark:text-white/60">
                          Vendeur: {currentConversation.seller.first_name} {currentConversation.seller.last_name}
                        </p>
                      </div>
                      <Link 
                        href={`/annonce/${currentConversation.ad.id}`}
                        className="text-sm text-black/60 dark:text-white/60 hover:underline"
                      >
                        Voir l'annonce
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Messages avec padding-top */}
                <div className="flex-1 overflow-y-auto">
                  <div className="pt-24 px-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className="relative group">
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              msg.sender_id === user?.id
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-black/5 dark:bg-white/5'
                            } ${msg.deleted ? 'opacity-50' : ''}`}
                          >
                            {msg.deleted ? (
                              <p className="italic">Message supprimé</p>
                            ) : (
                              <>
                                <p>{msg.content}</p>
                                <div className="flex items-center justify-end space-x-2 text-xs mt-1 opacity-60">
                                  <span>{new Date(msg.created_at).toLocaleString()}</span>
                                  {msg.sender_id === user?.id && (
                                    <div className="flex space-x-1">
                                      {msg.error ? (
                                        <span className="text-red-500">Non envoyé</span>
                                      ) : (
                                        <>
                                          <span className={msg.read ? 'opacity-50' : ''}>✓</span>
                                          {msg.read && <span>✓</span>}
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                          
                          {!msg.deleted && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="absolute top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={deletingMessage === msg.id}
                            >
                              {deletingMessage === msg.id ? (
                                <span className="animate-spin">⟳</span>
                              ) : (
                                <span>🗑️</span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Zone de saisie */}
                <div className="sticky bottom-0 bg-white/50 dark:bg-black/50 backdrop-blur-lg border-t border-black/10 dark:border-white/10">
                  <div className="p-4">
                    <form onSubmit={handleSubmit} className="flex space-x-4">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="flex-1 bg-transparent border border-black/10 dark:border-white/10 rounded-full px-4 py-2 focus:outline-none focus:border-black dark:focus:border-white"
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-90 transition-opacity"
                      >
                        Envoyer
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-black/60 dark:text-white/60">
                Sélectionnez une conversation
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 