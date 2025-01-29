import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

// Récup toutes les annonces de la bdd
export async function GET() {
  try {
    // Check si on est co à la bdd
    await prisma.$connect();

    // Récup les annonces avec les infos des vendeurs
    const ads = await prisma.ad.findMany({
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      // Les plus récentes d'abord
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(ads);

  } catch (error) {
    console.error('Oups:', error);
    return NextResponse.json(
      { error: "Y'a eu un pb pour récup les annonces" },
      { status: 500 }
    );
  }
}

// Poster une nouvelle annonce
export async function POST(request) {
  try {
    // Check si l'user est co
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken?.value) {
      return NextResponse.json(
        { error: "Faut être co pour poster une annonce!" },
        { status: 401 }
      );
    }

    const userId = parseInt(authToken.value);
    const data = await request.json();

    // Créer l'annonce dans la bdd
    const newAd = await prisma.ad.create({
      data: {
        name: data.name,
        style: data.style,
        type: data.type,
        color: data.color,
        price: data.price,
        description: data.description,
        images: data.images,
        location: data.location,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Récup les infos du vendeur pour l'affichage
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return NextResponse.json(newAd, { status: 201 });
  } catch (error) {
    console.error('Aïe:', error);
    return NextResponse.json(
      { error: "Impossible de créer l'annonce :(" },
      { status: 500 }
    );
  }
} 