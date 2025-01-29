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

    // Récupérer toutes les conversations groupées par annonce
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      orderBy: {
        created_at: 'desc'
      },
      distinct: ['ad_id'],
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
      }
    });

    // Formater les conversations
    const formattedConversations = conversations.map(msg => ({
      id: msg.ad_id,
      ad: {
        id: msg.ad.id,
        name: msg.ad.name,
        image: msg.ad.images[0],
        price: msg.ad.price,
      },
      seller: msg.ad.user,
      otherUser: msg.sender_id === userId ? msg.receiver : msg.sender,
      lastMessage: {
        content: msg.content,
        created_at: msg.created_at,
        isFromMe: msg.sender_id === userId
      }
    }));

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des conversations" },
      { status: 500 }
    );
  }
} 