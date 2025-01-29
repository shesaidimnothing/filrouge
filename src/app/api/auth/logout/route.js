import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Supprimer le cookie de session
  cookies().delete('auth_token');
  
  return NextResponse.json({ message: "Déconnecté avec succès" });
} 