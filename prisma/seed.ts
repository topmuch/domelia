import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin
  const passwordHash = crypto.createHash('sha256').update('admin123').digest('hex');
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@domelia.fr' },
    update: {},
    create: {
      email: 'admin@domelia.fr',
      passwordHash,
      name: 'SuperAdmin',
      role: 'admin',
    },
  });

  console.log('✅ Admin created:', admin.email);

  // Create demo tenant profiles
  const tenantUser1 = await prisma.user.upsert({
    where: { email: 'marie@demo.fr' },
    update: {},
    create: {
      email: 'marie@demo.fr',
      passwordHash: crypto.createHash('sha256').update('demo123').digest('hex'),
      name: 'Marie L.',
      role: 'locataire',
      tenantProfile: {
        create: {
          firstName: 'Marie',
          lastName: 'L.',
          city: 'Bordeaux',
          budget: 850,
          housingType: 't2',
          jobStatus: 'cdi',
          hasGuarantor: true,
          urgency: 'immediate',
          description: 'Je recherche un appartement lumineux près du centre-ville.',
          isActive: true,
        },
      },
    },
    include: { tenantProfile: true },
  });

  const tenantUser2 = await prisma.user.upsert({
    where: { email: 'thomas@demo.fr' },
    update: {},
    create: {
      email: 'thomas@demo.fr',
      passwordHash: crypto.createHash('sha256').update('demo123').digest('hex'),
      name: 'Thomas D.',
      role: 'locataire',
      tenantProfile: {
        create: {
          firstName: 'Thomas',
          lastName: 'D.',
          city: 'Lyon',
          budget: 1200,
          housingType: 't3',
          jobStatus: 'cdi',
          hasGuarantor: true,
          urgency: '1_mois',
          description: 'Actif dans la tech, je cherche un logement calme.',
          isActive: true,
        },
      },
    },
    include: { tenantProfile: true },
  });

  const tenantUser3 = await prisma.user.upsert({
    where: { email: 'sophie@demo.fr' },
    update: {},
    create: {
      email: 'sophie@demo.fr',
      passwordHash: crypto.createHash('sha256').update('demo123').digest('hex'),
      name: 'Sophie M.',
      role: 'locataire',
      tenantProfile: {
        create: {
          firstName: 'Sophie',
          lastName: 'M.',
          city: 'Paris',
          budget: 1500,
          housingType: 'studio',
          jobStatus: 'etudiant',
          hasGuarantor: true,
          urgency: 'flexible',
          description: 'Étudiante en médecine, je cherche un studio bien situé.',
          isActive: true,
        },
      },
    },
    include: { tenantProfile: true },
  });

  console.log('✅ Demo tenants created');

  // Create demo landlord with listings
  const landlordUser = await prisma.user.upsert({
    where: { email: 'proprietaire@demo.fr' },
    update: {},
    create: {
      email: 'proprietaire@demo.fr',
      passwordHash: crypto.createHash('sha256').update('demo123').digest('hex'),
      name: 'Jean Propriétaire',
      role: 'proprietaire',
      listings: {
        create: [
          {
            type: 'logement',
            title: 'T2 Lumineux avec Balcon',
            location: 'Bordeaux Centre',
            price: 1250,
            surface: 45,
            rooms: 2,
            photos: JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop']),
            isActive: true,
          },
          {
            type: 'logement',
            title: 'Studio Rénové Haussmannien',
            location: 'Paris 11e',
            price: 980,
            surface: 28,
            rooms: 1,
            photos: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop']),
            isActive: true,
          },
        ],
      },
    },
    include: { listings: true },
  });

  console.log('✅ Demo landlord created with listings');

  // Create demo professional with services
  const proUser = await prisma.user.upsert({
    where: { email: 'pro@demo.fr' },
    update: {},
    create: {
      email: 'pro@demo.fr',
      passwordHash: crypto.createHash('sha256').update('demo123').digest('hex'),
      name: 'Déménagement Express',
      role: 'pro',
      services: {
        create: {
          company: 'Déménagement Express',
          siret: '12345678901234',
          category: 'demenagement',
          title: 'Déménagement professionnel',
          description: 'Déménagement complet partout en France. Service clé en main avec emballage inclus.',
          price: 350,
          zone: 'France entière',
          isVerified: true,
          isActive: true,
        },
      },
    },
    include: { services: true },
  });

  console.log('✅ Demo professional created');

  // Create demo colocation listings
  const colocUser = await prisma.user.upsert({
    where: { email: 'coloc@demo.fr' },
    update: {},
    create: {
      email: 'coloc@demo.fr',
      passwordHash: crypto.createHash('sha256').update('demo123').digest('hex'),
      name: 'Colocation Paris',
      role: 'proprietaire',
      colocations: {
        create: [
          {
            type: 'chambre',
            title: 'Chambre dans T4 Spacieux',
            location: 'Paris 18e',
            price: 550,
            surface: 14,
            photos: JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop']),
            isActive: true,
          },
          {
            type: 'chambre',
            title: 'Chambre Lumineuse Colocation',
            location: 'Bordeaux',
            price: 480,
            surface: 12,
            photos: JSON.stringify(['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop']),
            isActive: true,
          },
        ],
      },
    },
    include: { colocations: true },
  });

  console.log('✅ Demo colocations created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
