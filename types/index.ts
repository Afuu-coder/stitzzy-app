// ── Institution & Academic Structure ────────────────────────────────────
export interface Institution {
  id:        string;
  name:      string;
  slug:      string;
  type:      "university" | "college" | "school" | "coaching";
  logoUrl?:  string;
  coverImageUrl?: string;
  city?:     string;
  state?:    string;
  isActive:  boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id:            string;
  institutionId: string;
  name:          string;
  isActive:      boolean;
  createdAt:     string;
}

export interface Course {
  id:             string;
  departmentId:   string;
  name:           string;
  totalSemesters: number;
  isActive:       boolean;
  createdAt:      string;
}

// ── Product Catalog ──────────────────────────────────────────────────────
/** The customer's gender, captured on the checkout form. */
export type Gender = "male" | "female" | "unisex";

/** Product-level fit. Distinct from the customer's gender at checkout. */
export type ProductGender = "men" | "women" | "unisex";

/** One selectable size with its own stock and SKU (per products schema). */
export interface ProductSize {
  size:  string;   // "S", "M", "32", "34" …
  stock: number;
  sku:   string;
}

export interface Product {
  id:              string;
  slug:            string;              // "duiet-cse-formal-shirt"
  institutionId:   string;
  institutionName: string;              // denormalized for card/list display
  departmentId?:   string;
  departmentName?: string;              // e.g. "CSE dept" / "all depts"
  category:        string;              // "shirt" | "pants" | "blazer" … drives size chart
  gender:          ProductGender;
  title:           string;
  description?:       string;
  fabricDetails?:     string;
  careInstructions?:  string;
  images:          string[];            // Storage URLs, first = card thumbnail
  price:           number;
  mrp:             number;
  discountPercent?: number;             // denormalized; derive from mrp/price if absent
  sizes:           ProductSize[];
  tags:            string[];
  ratingAvg?:      number;
  ratingCount?:    number;
  isVerified?:     boolean;
  isActive:        boolean;
  isFeatured?:     boolean;
  status?:         "draft" | "active" | "archived";
  createdAt:       string;
  updatedAt:       string;
}

// ── Cart ─────────────────────────────────────────────────────────────────
export interface CartItem {
  productId:   string;
  productName: string;
  size:        string;
  qty:         number;
  unitPrice:   number;
  imageUrl?:   string;
  category?:   string;
}

// ── Users & Addresses ────────────────────────────────────────────────────
export interface UserProfile {
  id:            string; // Clerk user ID
  fullName:      string;
  phone:         string;
  email?:        string;
  institutionId?: string;
  departmentId?:  string;
  courseId?:      string;
  semester?:      number;
  createdAt:     string;
}

export interface Address {
  id:        string;
  userId:    string;
  label?:    string;  // Home, Hostel, etc.
  line1:     string;
  line2?:    string;
  city:      string;
  state:     string;
  pincode:   string;
  isDefault: boolean;
}

// ── Orders ───────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "whatsapp_sent"
  | "confirmed"
  | "packed"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "rejected";

export interface Order {
  id:              string;
  trackingCode:    string;
  userId:          string;
  addressId:       string;
  institutionId:   string;
  status:          OrderStatus;
  totalAmount:     number;
  deliveryNotes?:  string;
  whatsappSentAt?: string;
  confirmedAt?:    string;
  createdAt:       string;
  updatedAt:       string;
  // Populated
  items?:          OrderItem[];
  address?:        Address;
}

export interface OrderItem {
  id:        string;
  orderId:   string;
  productId: string;
  variantId: string;
  quantity:  number;
  unitPrice: number;
  // Populated
  productName?: string;
  size?:        string;
}

// ── Admin & RBAC ─────────────────────────────────────────────────────────
export type AdminRole = "super_admin" | "institution_staff" | "support";

export interface AdminUser {
  id:            string; // Clerk user ID
  fullName:      string;
  email:         string;
  role:          AdminRole;
  institutionId?: string; // null = platform-wide
  isActive:      boolean;
  createdAt:     string;
}

// ── Reviews ──────────────────────────────────────────────────────────────
export interface Review {
  id:        string;
  productId: string;
  userId:    string;
  userName:  string;
  rating:    1 | 2 | 3 | 4 | 5;
  comment?:  string;
  createdAt: string;
}

// ── Checkout form ─────────────────────────────────────────────────────────
export interface CheckoutFormData {
  fullName:    string;
  phone:       string;
  addressLine: string;
  city:        string;
  state:       string;
  pincode:     string;
  institution: string;
  notes?:      string;
  department:  string;
  semester:    number;
  gender:      Gender;
}
