import { PrismaClient } from '@prisma/client';

let prisma;

try {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    // In development, use a global variable to share the connection
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
      });
    }
    prisma = global.prisma;
  }

  // Test the connection
  prisma.$connect().then(() => {
    console.log('Successfully connected to the database');
  }).catch((error) => {
    console.error('Failed to connect to the database:', error);
  });

} catch (error) {
  console.error('Error initializing Prisma:', error);
  throw error;
}

export default prisma; 