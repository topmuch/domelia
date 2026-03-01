import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const where: Record<string, unknown> = {};
    if (role && role !== 'all') {
      where.role = role;
    }
    
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenantProfile: true,
          listings: true,
          services: true,
          colocations: true
        }
      }),
      db.user.count({ where })
    ]);
    
    // Remove password hashes
    const safeUsers = users.map(u => {
      const { passwordHash, ...safeUser } = u;
      return safeUser;
    });
    
    return NextResponse.json({
      users: safeUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { 
      email, 
      password, 
      name, 
      role,
      // Tenant fields
      firstName,
      lastName,
      city,
      budget,
      housingType,
      jobStatus,
      hasGuarantor,
      urgency,
      description,
      phone,
      // Pro fields
      siret,
      company,
      // Landlord listing fields
      listingType,
      title,
      location,
      price,
      surface,
      rooms,
      photos,
      // Service fields
      category,
      zone,
      // Coloc fields
      colocType
    } = data;
    
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, mot de passe et rôle requis' },
        { status: 400 }
      );
    }
    
    // Check if email exists
    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Cet email existe déjà' },
        { status: 400 }
      );
    }
    
    const passwordHash = await hashPassword(password);
    
    // Create user with role-specific data
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name || firstName || email.split('@')[0],
        role,
        // Create role-specific profile
        ...(role === 'locataire' && {
          tenantProfile: {
            create: {
              firstName: firstName || name || email.split('@')[0],
              lastName: lastName || '',
              city: city || 'Paris',
              budget: budget ? parseInt(budget) : 800,
              housingType: housingType || null,
              jobStatus: jobStatus || 'cdi',
              hasGuarantor: hasGuarantor || false,
              urgency: urgency || 'flexible',
              description: description || null,
              phone: phone || null,
              isActive: true
            }
          }
        }),
        ...(role === 'proprietaire' && listingType && {
          listings: {
            create: {
              type: listingType,
              title: title || 'Nouveau logement',
              location: location || city || 'Paris',
              price: price ? parseInt(price) : 0,
              surface: surface ? parseInt(surface) : null,
              rooms: rooms ? parseInt(rooms) : null,
              photos: photos || null,
              isActive: true
            }
          }
        }),
        ...(role === 'pro' && {
          services: {
            create: {
              company: company || name || email.split('@')[0],
              siret: siret || null,
              category: category || 'autre',
              title: title || 'Service professionnel',
              zone: zone || null,
              isVerified: true,
              isActive: true
            }
          }
        })
      },
      include: {
        tenantProfile: true,
        listings: true,
        services: true
      }
    });
    
    // Log activity
    await db.adminLog.create({
      data: {
        adminId: session.userId,
        action: 'create',
        targetType: 'user',
        targetId: user.id,
        details: JSON.stringify({ role, email })
      }
    });
    
    const { passwordHash: _, ...safeUser } = user;
    
    return NextResponse.json({ 
      success: true, 
      user: safeUser 
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, isActive, ...updates } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    // Utiliser une transaction pour mettre à jour l'utilisateur ET ses contenus
    const result = await db.$transaction(async (tx) => {
      // 1. Mettre à jour l'utilisateur
      const user = await tx.user.update({
        where: { id },
        data: {
          ...(isActive !== undefined && { isActive }),
          ...updates
        }
      });

      // 2. Si on change le statut isActive, mettre à jour tous les contenus liés
      if (isActive !== undefined) {
        // Suspendre/réactiver le profil locataire
        await tx.tenantProfile.updateMany({
          where: { userId: id },
          data: { isActive }
        });

        // Suspendre/réactiver les annonces de logement
        await tx.landlordListing.updateMany({
          where: { userId: id },
          data: { isActive }
        });

        // Suspendre/réactiver les annonces de colocation
        await tx.colocListing.updateMany({
          where: { userId: id },
          data: { isActive }
        });

        // Suspendre/réactiver les services
        await tx.serviceAd.updateMany({
          where: { proId: id },
          data: { isActive }
        });
      }

      return user;
    });

    // Log activity
    await db.adminLog.create({
      data: {
        adminId: session.userId,
        action: 'update',
        targetType: 'user',
        targetId: id,
        details: JSON.stringify({ updates, isActive })
      }
    });

    const { passwordHash: _, ...safeUser } = result;

    return NextResponse.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    // Prevent deleting self
    if (id === session.userId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      );
    }
    
    await db.user.delete({
      where: { id }
    });
    
    // Log activity
    await db.adminLog.create({
      data: {
        adminId: session.userId,
        action: 'delete',
        targetType: 'user',
        targetId: id
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
