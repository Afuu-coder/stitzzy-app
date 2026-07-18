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
export type Gender = "male" | "female" | "unisex";

export interface Product {
  id:                  string;
  institutionId:       string;
  departmentId?:       string;
  courseId?:           string;
  categoryId?:         string;
  name:                string;
  slug:                string;
  description?:        string;
  gender:              Gender;
  applicableSemesters: number[];
  sku:                 string;
  basePrice:           number;
  discountPrice?:      number;
  tags:                string[];
  isActive:            boolean;
  createdAt:           string;
  updatedAt:           string;
  // Denormalized for display (populated client-side)
  images?:    ProductImage[];
  variants?:  ProductVariant[];
  imageUrls?: string[];
  sizes?:     string[];
  category?:  string;
}

export interface ProductImage {
  id:        string;
  productId: string;
  url:       string;
  sortOrder: number;
}

export interface ProductVariant {
  id:                string;
  productId:         string;
  size:              string;  // S, M, L, XL, XXL, 32, 34 etc.
  stockQuantity:     number;
  lowStockThreshold: number;
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
  notes?:      string;
  department:  string;
  semester:    number;
  gender:      Gender;
}
