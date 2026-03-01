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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const where: Record<string, unknown> = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    
    const [reports, total] = await Promise.all([
      db.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { email: true, name: true } },
          handler: { select: { email: true, name: true } }
        }
      }),
      db.report.count({ where })
    ]);
    
    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This can be called from the public site to create reports
    const data = await request.json();
    const { reporterId, targetType, targetId, reason, description } = data;
    
    if (!targetType || !targetId || !reason) {
      return NextResponse.json(
        { error: 'Type, ID cible et raison requis' },
        { status: 400 }
      );
    }
    
    const report = await db.report.create({
      data: {
        reporterId: reporterId || 'anonymous',
        targetType,
        targetId,
        reason,
        description,
        status: 'nouveau'
      }
    });
    
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Create report error:', error);
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
    const { id, status, internalNote } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      );
    }
    
    const report = await db.report.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(internalNote !== undefined && { internalNote }),
        handlerId: session.userId
      }
    });
    
    // Log activity
    await db.adminLog.create({
      data: {
        adminId: session.userId,
        action: 'update',
        targetType: 'report',
        targetId: id,
        details: JSON.stringify({ status, internalNote })
      }
    });
    
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
