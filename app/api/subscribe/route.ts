import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/subscribe — newsletter signup (from the footer).
 * Public endpoint; write goes through the Admin SDK so the `subscribers`
 * collection stays locked to client access.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();

    // Basic email shape check — don't trust the client.
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return new NextResponse("Invalid email", { status: 400 });
    }

    await adminDb.collection("subscribers").add({
      email,
      subscribedAt: new Date().toISOString(),
      source: String(body?.source ?? "footer"),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Subscribe error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
