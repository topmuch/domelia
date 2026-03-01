import { cookies } from 'next/headers';
import { db } from './db';
import crypto from 'crypto';

const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export async function createAdminSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  // Store session in cookie
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, JSON.stringify({
    userId,
    token,
    expiresAt: expiresAt.toISOString()
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt
  });
  
  return token;
}

export async function getAdminSession(): Promise<{ userId: string; email: string; name: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    const session = JSON.parse(sessionCookie.value);
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }
    
    // Verify user exists and is admin
    const user = await db.user.findUnique({
      where: { id: session.userId }
    });
    
    if (!user || user.role !== 'admin') {
      return null;
    }
    
    return {
      userId: user.id,
      email: user.email,
      name: user.name || 'Admin'
    };
  } catch {
    return null;
  }
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function createDefaultAdmin(): Promise<void> {
  const existingAdmin = await db.user.findFirst({
    where: { role: 'admin' }
  });
  
  if (!existingAdmin) {
    const passwordHash = await hashPassword('admin123');
    await db.user.create({
      data: {
        email: 'admin@domelia.fr',
        passwordHash,
        name: 'SuperAdmin',
        role: 'admin'
      }
    });
    console.log('Default admin created: admin@domelia.fr / admin123');
  }
}
