import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getStorage } from "firebase/storage";
import app from "./firebase";

export const storage = getStorage(app);

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 * @param file The File object from an input element
 * @param path The directory path in storage (e.g., 'institutions/logos')
 * @returns The download URL string
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!file) throw new Error("No file provided");

  // Create a unique filename to avoid overwrites
  const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  const extension = file.name.split(".").pop();
  const fullPath = `${path}/${uniqueId}.${extension}`;

  const storageRef = ref(storage, fullPath);
  
  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get the URL
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}
