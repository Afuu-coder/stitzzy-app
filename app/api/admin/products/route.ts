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
    const images: File[] = [];

    // Parse fields
    formData.forEach((value, key) => {
      if (key === "images") {
        images.push(value as File);
      } else if (key === "sizes") {
        try {
          data[key] = JSON.parse(value as string);
        } catch {
          data[key] = [];
        }
      } else {
        if (value === "true") data[key] = true;
        else if (value === "false") data[key] = false;
        else if (!isNaN(Number(value)) && (key === "price" || key === "mrp")) {
          data[key] = Number(value);
        } else {
          data[key] = value;
        }
      }
    });

    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    data.images = [];
    data.slug = (data.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    data.tags = Array.isArray(data.tags) ? data.tags : [];

    const bucket = adminStorage.bucket();

    // Upload all images in parallel
    if (images.length > 0) {
      const uploadPromises = images.map(async (file) => {
        if (file.size === 0) return null;
        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        const ext = file.name.split(".").pop();
        const filePath = `products/images/${uniqueId}.${ext}`;
        const storageFile = bucket.file(filePath);

        await storageFile.save(buffer, { contentType: file.type });
        return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
      });

      const urls = await Promise.all(uploadPromises);
      data.images = urls.filter(Boolean);
    }

    // Save to Firestore
    const docRef = await adminDb.collection("products").add(data);

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
    await adminDb.collection("products").doc(id).update({
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

    await adminDb.collection("products").doc(id).delete();
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
    const images: File[] = [];

    // Parse fields
    formData.forEach((value, key) => {
      if (key === "images") {
        images.push(value as File);
      } else if (key === "sizes") {
        try {
          data[key] = JSON.parse(value as string);
        } catch {
          data[key] = [];
        }
      } else if (key !== "id") {
        if (value === "true") data[key] = true;
        else if (value === "false") data[key] = false;
        else if (!isNaN(Number(value)) && (key === "price" || key === "mrp")) {
          data[key] = Number(value);
        } else {
          data[key] = value;
        }
      }
    });

    data.updatedAt = new Date().toISOString();
    if (data.title) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }

    const bucket = adminStorage.bucket();

    // Upload all images in parallel (if any new ones are provided)
    if (images.length > 0) {
      const uploadPromises = images.map(async (file) => {
        if (file.size === 0) return null;
        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        const ext = file.name.split(".").pop();
        const filePath = `products/images/${uniqueId}.${ext}`;
        const storageFile = bucket.file(filePath);
        
        await storageFile.save(buffer, { contentType: file.type });
        return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
      });

      const urls = await Promise.all(uploadPromises);
      const newUrls = urls.filter(Boolean);
      if (newUrls.length > 0) {
        // If we want to append, we'd need to fetch first.
        // For simplicity, we overwrite images if new ones are uploaded.
        data.images = newUrls;
      }
    }

    // Update in Firestore
    await adminDb.collection("products").doc(id).update(data);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin API Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
