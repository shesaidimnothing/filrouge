import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, password, birthday, gender } = body;

    console.log('Données reçues:', { first_name, last_name, email, birthday, gender });

    // Validation du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères, une majuscule et une minuscule' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { 
        email: email 
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        first_name: first_name || null,
        last_name: last_name || null,
        email: email,
        password: hashedPassword,
        birthday: birthday ? new Date(birthday) : null,
        gender: gender || null,
        created_at: new Date(),
        last_auth: new Date()
      },
    });

    console.log('Utilisateur créé:', user.id);

    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Erreur détaillée lors de l\'inscription:', error);
    
    // Gérer les différents types d'erreurs
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'inscription',
        details: error.message
      },
      { status: 500 }
    );
  }
} 