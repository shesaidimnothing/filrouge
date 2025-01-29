import { Server } from 'socket.io';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? 'https://votre-domaine.com' 
        : 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Un utilisateur connecté:', socket.id);

    // Rejoindre une room spécifique pour les messages privés
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    // Gérer l'envoi de nouveaux messages
    socket.on('send_message', async (messageData) => {
      // Émettre le message aux utilisateurs dans la conversation
      io.to(`conversation_${messageData.conversationId}`).emit('receive_message', messageData);
    });

    socket.on('disconnect', () => {
      console.log('Utilisateur déconnecté:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO non initialisé');
  }
  return io;
} 