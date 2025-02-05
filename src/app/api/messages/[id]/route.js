import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
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
    const [adId, otherUserId] = params.id.split('-').map(Number);

    // Récupérer tous les messages entre ces deux utilisateurs pour cette annonce
    const messages = await prisma.message.findMany({
      where: {
        ad_id: adId,
        AND: [
          {
            OR: [
              {
                AND: [
                  { sender_id: userId },
                  { receiver_id: otherUserId }
                ]
              },
              {
                AND: [
                  { sender_id: otherUserId },
                  { receiver_id: userId }
                ]
              }
            ]
          }
        ]
      },
      orderBy: {
        created_at: 'asc'
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
      }
    });

    // Récupérer les informations complètes de l'annonce
    const ad = await prisma.ad.findUnique({
      where: {
        id: adId
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          }
        }
      }
    });

    // Retourner à la fois les messages et les informations de l'annonce
    return NextResponse.json({
      messages,
      ad,
      otherUser: messages[0]?.sender_id === userId ? messages[0]?.receiver : messages[0]?.sender
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des messages" },
      { status: 500 }
    );
  }
} 