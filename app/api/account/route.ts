import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/admin-auth";

/**
 * GET /api/account — returns the signed-in user's profile + their own orders.
 * userId comes from the Clerk session, never from the client, so a user can
 * only ever read their own data.
 */
export async function GET() {
  const userId = await requireUser();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const [userDoc, ordersSnap] = await Promise.all([
      adminDb.collection("users").doc(userId).get(),
      adminDb.collection("orders").where("userId", "==", userId).get(),
    ]);

    const orders = ordersSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as { id: string; createdAt?: string })
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );

    return NextResponse.json({
      profile: userDoc.exists ? userDoc.data() : null,
      orders,
    });
  } catch (error: unknown) {
    console.error("Account fetch error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * PUT /api/account — save the signed-in user's profile.
 */
export async function PUT(request: Request) {
  const userId = await requireUser();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await request.json();
    const profile = {
      height:      String(body.height ?? ""),
      weight:      String(body.weight ?? ""),
      institution: String(body.institution ?? ""),
      department:  String(body.department ?? ""),
      phone:       String(body.phone ?? ""),
      address:     String(body.address ?? ""),
      pincode:     String(body.pincode ?? ""),
      updatedAt:   new Date().toISOString(),
    };

    await adminDb.collection("users").doc(userId).set(profile, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Account save error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
