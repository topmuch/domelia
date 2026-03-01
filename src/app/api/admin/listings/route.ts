import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { db } from '@/lib/db';

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
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    let listings: unknown[] = [];
    let total = 0;
    
    if (type === 'logement' || type === 'all' || !type) {
      const [landlordListings, landlordTotal] = await Promise.all([
        db.landlordListing.findMany({
          skip: type === 'logement' ? skip : 0,
          take: type === 'logement' ? limit : 100,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { email: true, name: true } } }
        }),
        db.landlordListing.count()
      ]);
      listings.push(...landlordListings.map(l => ({ ...l, listingType: 'landlord' })));
      if (type === 'logement') total = landlordTotal;
    }
    
    if (type === 'colocation' || type === 'all' || !type) {
      const [colocListings, colocTotal] = await Promise.all([
        db.colocListing.findMany({
          skip: type === 'colocation' ? skip : 0,
          take: type === 'colocation' ? limit : 100,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { email: true, name: true } } }
        }),
        db.colocListing.count()
      ]);
      listings.push(...colocListings.map(l => ({ ...l, listingType: 'coloc' })));
      if (type === 'colocation') total = colocTotal;
    }
    
    if (type === 'service' || type === 'all' || !type) {
      const [serviceListings, serviceTotal] = await Promise.all([
        db.serviceAd.findMany({
          skip: type === 'service' ? skip : 0,
          take: type === 'service' ? limit : 100,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { email: true, name: true } } }
        }),
        db.serviceAd.count()
      ]);
      listings.push(...serviceListings.map(l => ({ ...l, listingType: 'service' })));
      if (type === 'service') total = serviceTotal;
    }
    
    if (!type || type === 'all') {
      total = listings.length;
      listings = listings.slice(skip, skip + limit);
    }
    
    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
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
      listingType,
      type,
      title,
      description,
      location,
      address,
      price,
      surface,
      rooms,
      photos,
      category,
      zone,
      company,
      userId
    } = data;
    
    // Validation: photo obligatoire
    if (!photos) {
      return NextResponse.json(
        { error: 'Une photo est requise pour créer une annonce' },
        { status: 400 }
      );
    }
    
    // Convertir les photos en JSON string si c'est une URL ou base64 simple
    const photosJson = photos.startsWith('[') ? photos : JSON.stringify([photos]);
    
    let result;
    
    if (listingType === 'landlord') {
      result = await db.landlordListing.create({
        data: {
          userId: userId || session.userId,
          type: type || 'logement',
          title: title || 'Nouveau logement',
          description,
          location: location || 'Paris',
          address,
          price: price ? parseInt(price) : 0,
          surface: surface ? parseInt(surface) : null,
          rooms: rooms ? parseInt(rooms) : null,
          photos: photosJson,
          isActive: true
        }
      });
    } else if (listingType === 'coloc') {
      result = await db.colocListing.create({
        data: {
          userId: userId || session.userId,
          type: type || 'chambre',
          title: title || 'Nouvelle colocation',
          description,
          location: location || 'Paris',
          address,
          price: price ? parseInt(price) : 0,
          surface: surface ? parseInt(surface) : null,
          photos: photosJson,
          isActive: true
        }
      });
    } else if (listingType === 'service') {
      result = await db.serviceAd.create({
        data: {
          proId: userId || session.userId,
          company,
          category: category || 'autre',
          title: title || 'Nouveau service',
          description,
          price: price ? parseInt(price) : null,
          zone,
          photo: photosJson,
          isVerified: true,
          isActive: true
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Type d\'annonce invalide' },
        { status: 400 }
      );
    }
    
    // Log activity
    await db.adminLog.create({
      data: {
        adminId: session.userId,
        action: 'create',
        targetType: listingType,
        targetId: result.id,
        details: JSON.stringify({ title, type })
      }
    });
    
    return NextResponse.json({ success: true, listing: result });
  } catch (error) {
    console.error('Create listing error:', error);
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
    const { id, listingType, isActive, ...updates } = data;
    
    if (!id || !listingType) {
      return NextResponse.json(
        { error: 'ID et type d\'annonce requis' },
        { status: 400 }
      );
    }
    
    let result;
    
    if (listingType === 'landlord') {
      result = await db.landlordListing.update({
        where: { id },
        data: {
          ...(isActive !== undefined && { isActive }),
          ...updates
        }
      });
    } else if (listingType === 'coloc') {
      result = await db.colocListing.update({
        where: { id },
        data: {
          ...(isActive !== undefined && { isActive }),
          ...updates
        }
      });
    } else if (listingType === 'service') {
      result = await db.serviceAd.update({
        where: { id },
        data: {
          ...(isActive !== undefined && { isActive }),
          ...updates
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Type d\'annonce invalide' },
        { status: 400 }
      );
    }
    
    // Log activity
    await db.adminLog.create({
      data: {
        adminId: session.userId,
        action: 'update',
        targetType: listingType,
        targetId: id,
        details: JSON.stringify({ updates })
      }
    });
    
    return NextResponse.json({ success: true, listing: result });
  } catch (error) {
    console.error('Update listing error:', error);
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
    const listingType = searchParams.get('listingType');
    
    if (!id || !listingType) {
      return NextResponse.json(
        { error: 'ID et type d\'annonce requis' },
        { status: 400 }
      );
    }
    
    if (listingType === 'landlord') {
      await db.landlordListing.delete({ where: { id } });
    } else if (listingType === 'coloc') {
      await db.colocListing.delete({ where: { id } });
    } else if (listingType === 'service') {
      await db.serviceAd.delete({ where: { id } });
    } else {
      return NextResponse.json(
        { error: 'Type d\'annonce invalide' },
        { status: 400 }
      );
    }
    
    // Log activity
    await db.adminLog.create({
      data: {
        adminId: session.userId,
        action: 'delete',
        targetType: listingType,
        targetId: id
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete listing error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
