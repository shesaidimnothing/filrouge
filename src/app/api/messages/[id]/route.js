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
    const adId = parseInt(params.id);

    // Récupérer tous les messages de cette annonce où l'utilisateur est impliqué
    const messages = await prisma.message.findMany({
      where: {
        AND: [
          { ad_id: adId },
          {
            OR: [
              { sender_id: userId },
              { receiver_id: userId }
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
            name: true,
          }
        }
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des messages" },
      { status: 500 }
    );
  }
} 