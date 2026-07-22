import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

/**
 * GET /api/admin/orders?limit=500 — list orders for the admin dashboard.
 * Admin-only; reads go through the Admin SDK so Firestore rules stay locked.
 */
export async function GET(request: Request) {
  if (!(await verifyAdmin())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const max = Math.min(Number(searchParams.get("limit") ?? 500) || 500, 1000);

    const snap = await adminDb
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(max)
      .get();

    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Admin API Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await verifyAdmin())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return new NextResponse("Missing ID", { status: 400 });

    const body = await request.json();
    await adminDb.collection("orders").doc(id).update({
      ...body,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin API Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
