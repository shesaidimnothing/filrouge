import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken?.value) {
      return NextResponse.json(null);
    }

    // Récupérer l'utilisateur à partir de l'ID stocké dans le cookie
    const userId = parseInt(authToken.value);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        gender: true,
        created_at: true,
        last_auth: true
      }
    });

    if (!user) {
      return NextResponse.json(null);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur de vérification auth:', error);
    return NextResponse.json(null);
  }
} 