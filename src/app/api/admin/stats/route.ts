import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    // Get counts
    const [
      tenantCount,
      landlordCount,
      proCount,
      listingCount,
      colocCount,
      serviceCount,
      reportCount,
      cities
    ] = await Promise.all([
      db.tenantProfile.count({ where: { isActive: true } }),
      db.user.count({ where: { role: 'proprietaire' } }),
      db.user.count({ where: { role: 'pro' } }),
      db.landlordListing.count({ where: { isActive: true } }),
      db.colocListing.count({ where: { isActive: true } }),
      db.serviceAd.count({ where: { isActive: true } }),
      db.report.count({ where: { status: 'nouveau' } }),
      db.tenantProfile.findMany({
        where: { isActive: true },
        select: { city: true }
      })
    ]);
    
    // Unique cities
    const uniqueCities = new Set(cities.map(t => t.city.toLowerCase()));
    
    // Activity over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await db.adminLog.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      _count: { id: true }
    });
    
    // Recent logs
    const recentLogs = await db.adminLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({
      stats: {
        tenants: tenantCount,
        landlords: landlordCount,
        pros: proCount,
        listings: listingCount,
        colocations: colocCount,
        services: serviceCount,
        reports: reportCount,
        cities: uniqueCities.size
      },
      recentLogs
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
