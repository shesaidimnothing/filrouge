import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken?.value) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const userId = parseInt(authToken.value);

    // Récupérer d'abord tous les messages impliquant l'utilisateur
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          }
        },
        receiver: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          }
        },
        ad: {
          select: {
            id: true,
            name: true,
            images: true,
            price: true,
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Grouper les conversations par paire unique (ad_id, other_user_id)
    const conversationsMap = new Map();

    messages.forEach(message => {
      const isUserSender = message.sender_id === userId;
      const otherUserId = isUserSender ? message.receiver_id : message.sender_id;
      const otherUser = isUserSender ? message.receiver : message.sender;
      const key = `${message.ad_id}-${otherUserId}`;

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          id: `${message.ad_id}-${otherUserId}`, // ID unique pour la conversation
          ad: message.ad,
          seller: message.ad.user,
          otherUser: otherUser,
          lastMessage: {
            content: message.content,
            created_at: message.created_at,
            isFromMe: isUserSender
          }
        });
      }
    });

    // Convertir la Map en tableau de conversations
    const conversations = Array.from(conversationsMap.values());

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des conversations" },
      { status: 500 }
    );
  }
} 