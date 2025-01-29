import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken?.value) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    const userId = parseInt(authToken.value);
    const { adId, message } = await request.json();

    // Récupérer l'annonce et son propriétaire
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: {
        user: true
      }
    });

    if (!ad) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      );
    }

    // Créer le message
    const newMessage = await prisma.message.create({
      data: {
        content: message,
        ad_id: adId,
        sender_id: userId,
        receiver_id: ad.user_id,
      },
      include: {
        sender: {
          select: {
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

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
} 