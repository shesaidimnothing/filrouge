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
    const { adId, content, receiverId } = await request.json();

    // Log pour le débogage
    console.log('Données reçues:', { adId, content, receiverId });

    if (!adId || !content || !receiverId) {
      return NextResponse.json(
        { error: "Données manquantes", details: { adId, content, receiverId } },
        { status: 400 }
      );
    }

    // Vérifier que l'annonce existe
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

    // Vérifier que l'utilisateur n'envoie pas un message à lui-même
    if (userId === receiverId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous envoyer un message à vous-même" },
        { status: 400 }
      );
    }

    // Créer le message
    const newMessage = await prisma.message.create({
      data: {
        content,
        ad_id: adId,
        sender_id: userId,
        receiver_id: receiverId,
        sent: true,
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
          }
        }
      }
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Erreur détaillée:', error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
} 