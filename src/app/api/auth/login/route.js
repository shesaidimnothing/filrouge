import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Check si l'user existe
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        first_name: true,
        last_name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email inconnu :/" },
        { status: 400 }
      );
    }

    // Check si le mdp est bon
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Mdp incorrect!" },
        { status: 400 }
      );
    }

    // Créer un cookie de session qui expire dans 7 jours
    const cookieStore = cookies();
    cookieStore.set('auth_token', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 
    });

    // On renvoie pas le mdp
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Oups:', error);
    return NextResponse.json(
      { error: "Pb de connexion :(" },
      { status: 500 }
    );
  }
} 