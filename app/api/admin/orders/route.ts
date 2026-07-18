import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";

async function verifyAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  return true;
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
