import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!(await verifyAdmin())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const formData = await request.formData();
    const data: Record<string, any> = {};
    
    // Parse fields
    formData.forEach((value, key) => {
      if (key !== "logo" && key !== "cover") {
        if (value === "true") data[key] = true;
        else if (value === "false") data[key] = false;
        else data[key] = value;
      }
    });

    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    data.logoUrl = "";
    data.coverImageUrl = "";

    const bucket = adminStorage.bucket();

    // Upload Logo
    const logoFile = formData.get("logo") as File | null;
    if (logoFile && logoFile.size > 0) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const ext = logoFile.name.split(".").pop();
      const filePath = `institutions/logos/${uniqueId}.${ext}`;
      const file = bucket.file(filePath);
      
      await file.save(buffer, { contentType: logoFile.type });
      data.logoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
    }

    // Upload Cover
    const coverFile = formData.get("cover") as File | null;
    if (coverFile && coverFile.size > 0) {
      const buffer = Buffer.from(await coverFile.arrayBuffer());
      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const ext = coverFile.name.split(".").pop();
      const filePath = `institutions/covers/${uniqueId}.${ext}`;
      const file = bucket.file(filePath);
      
      await file.save(buffer, { contentType: coverFile.type });
      data.coverImageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
    }

    // Save to Firestore
    const docRef = await adminDb.collection("institutions").add(data);

    return NextResponse.json({ id: docRef.id, success: true });
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
    await adminDb.collection("institutions").doc(id).update({
      ...body,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin API Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await verifyAdmin())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return new NextResponse("Missing ID", { status: 400 });

    await adminDb.collection("institutions").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin API Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await verifyAdmin())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return new NextResponse("Missing ID", { status: 400 });

    const formData = await request.formData();
    const data: Record<string, any> = {};
    
    // Parse fields
    formData.forEach((value, key) => {
      if (key !== "logo" && key !== "cover" && key !== "id") {
        if (value === "true") data[key] = true;
        else if (value === "false") data[key] = false;
        else data[key] = value;
      }
    });

    data.updatedAt = new Date().toISOString();

    const bucket = adminStorage.bucket();

    // Upload Logo
    const logoFile = formData.get("logo") as File | null;
    if (logoFile && logoFile.size > 0) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const ext = logoFile.name.split(".").pop();
      const filePath = `institutions/logos/${uniqueId}.${ext}`;
      const file = bucket.file(filePath);
      
      await file.save(buffer, { contentType: logoFile.type });
      data.logoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
    }

    // Upload Cover
    const coverFile = formData.get("cover") as File | null;
    if (coverFile && coverFile.size > 0) {
      const buffer = Buffer.from(await coverFile.arrayBuffer());
      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const ext = coverFile.name.split(".").pop();
      const filePath = `institutions/covers/${uniqueId}.${ext}`;
      const file = bucket.file(filePath);
      
      await file.save(buffer, { contentType: coverFile.type });
      data.coverImageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
    }

    // Update in Firestore
    await adminDb.collection("institutions").doc(id).update(data);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin API Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
