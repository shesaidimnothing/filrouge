import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PATCH(request, { params }) {
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
    const messageId = parseInt(params.id);
    const { read, deleted } = await request.json();

    // Vérifier que l'utilisateur est le destinataire ou l'expéditeur
    // et que le message appartient à la bonne conversation
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        AND: [
          {
            OR: [
              {
                AND: [
                  { sender_id: userId },
                  { receiver_id: message.receiver_id }
                ]
              },
              {
                AND: [
                  { receiver_id: userId },
                  { sender_id: message.sender_id }
                ]
              }
            ]
          }
        ]
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: "Message non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        read: read !== undefined ? read : message.read,
        deleted: deleted !== undefined ? deleted : message.deleted,
        updated_at: new Date()
      }
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du message" },
      { status: 500 }
    );
  }
} 