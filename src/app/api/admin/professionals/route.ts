// API SuperAdmin pour gérer les professionnels - Domelia.fr
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

// GET - Liste tous les professionnels
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "pending", "approved", "all"
    const search = searchParams.get("search");

    const where: any = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status === "pending") {
      where.isApproved = false;
    } else if (status === "approved") {
      where.isApproved = true;
    }

    const professionals = await db.professionalAccount.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
            isActive: true,
          },
        },
        services: {
          select: {
            id: true,
            title: true,
            category: true,
            isActive: true,
            isPaid: true,
          },
        },
        _count: {
          select: {
            services: true,
            requests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Statistiques
    const stats = {
      total: await db.professionalAccount.count(),
      pending: await db.professionalAccount.count({ where: { isApproved: false } }),
      approved: await db.professionalAccount.count({ where: { isApproved: true } }),
      verified: await db.professionalAccount.count({ where: { isVerified: true } }),
      partners: await db.professionalAccount.count({ where: { partnerBadge: true } }),
    };

    return NextResponse.json({ professionals, stats });
  } catch (error: any) {
    console.error("Erreur récupération professionnels:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}
