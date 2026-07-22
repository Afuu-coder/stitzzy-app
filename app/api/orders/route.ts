import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/admin-auth";

/**
 * POST /api/orders — create an order (from checkout).
 * Anonymous checkout is allowed (userId is optional), but the write goes
 * through the Admin SDK so Firestore rules stay locked down.
 */
export async function POST(request: Request) {
  try {
    const userId = await requireUser(); // may be null for guest checkout
    const body = await request.json();

    // Validate the minimum required fields — never trust the client blindly.
    if (!body?.trackingCode || !Array.isArray(body?.items) || body.items.length === 0) {
      return new NextResponse("Invalid order payload", { status: 400 });
    }

    const order = {
      trackingCode:   String(body.trackingCode),
      userId:         userId ?? null,
      customerName:   String(body.customerName ?? ""),
      customerPhone:  String(body.customerPhone ?? ""),
      institution:    String(body.institution ?? ""),
      department:     String(body.department ?? ""),
      status:         "whatsapp_sent",
      subTotal:       Number(body.subTotal ?? 0),
      discountAmount: Number(body.discountAmount ?? 0),
      totalAmount:    Number(body.totalAmount ?? 0),
      address:        String(body.address ?? ""),
      notes:          String(body.notes ?? ""),
      items: body.items.map((i: Record<string, unknown>) => ({
        productId:   String(i.productId ?? ""),
        productName: String(i.productName ?? ""),
        size:        String(i.size ?? ""),
        qty:         Number(i.qty ?? 0),
        unitPrice:   Number(i.unitPrice ?? 0),
        imageUrl:    String(i.imageUrl ?? ""),
      })),
      createdAt: new Date().toISOString(),
    };

    const ref = await adminDb.collection("orders").add(order);
    return NextResponse.json({ id: ref.id, trackingCode: order.trackingCode, success: true });
  } catch (error: unknown) {
    console.error("Order create error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * GET /api/orders?trackingCode=STZ-... — public order tracking by code.
 * The tracking code is the unguessable secret, so this is safe to expose.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get("trackingCode");
    if (!trackingCode) return new NextResponse("Missing trackingCode", { status: 400 });

    const snap = await adminDb
      .collection("orders")
      .where("trackingCode", "==", trackingCode)
      .limit(1)
      .get();

    if (snap.empty) return new NextResponse("Order not found", { status: 404 });

    const doc = snap.docs[0];
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error: unknown) {
    console.error("Order lookup error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
