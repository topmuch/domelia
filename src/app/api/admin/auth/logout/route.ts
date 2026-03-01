import { NextResponse } from 'next/server';
import { clearAdminSession, getAdminSession } from '@/lib/admin-auth';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const session = await getAdminSession();
    
    if (session) {
      // Log activity
      await db.adminLog.create({
        data: {
          adminId: session.userId,
          action: 'logout'
        }
      });
    }
    
    await clearAdminSession();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
