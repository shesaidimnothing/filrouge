'use client';
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export function useSocket(url) {
  const socketRef = useRef();

  useEffect(() => {
    // Créer la connexion Socket.IO
    socketRef.current = io(url, {
      path: '/api/socket',
    });

    // Nettoyage à la déconnexion
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);

  return socketRef.current;
} 