import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind classes safely, resolving conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a price number as Indian Rupees */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Generate a Stitzzy order tracking code */
export function generateTrackingCode(institutionPrefix: string = "STZ"): string {
  const prefix = institutionPrefix.toUpperCase().slice(0, 3);
  const num = Math.floor(1000 + Math.random() * 9000);
  const ts = Date.now().toString(36).toUpperCase().slice(-3);
  return `${prefix}-${num}-${ts}`;
}

/** Truncate a string with ellipsis */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

/** Format a date for display */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** Slugify a string for URL use */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Sleep/delay utility */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
