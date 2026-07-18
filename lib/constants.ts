// Firestore collection path constants — single source of truth
export const COLLECTIONS = {
  INSTITUTIONS:     "institutions",
  DEPARTMENTS:      "departments",    // subcollection under institutions
  COURSES:          "courses",         // subcollection under departments
  PRODUCTS:         "products",
  PRODUCT_IMAGES:   "images",          // subcollection under products
  PRODUCT_VARIANTS: "variants",        // subcollection under products
  USERS:            "users",
  ADDRESSES:        "addresses",       // subcollection under users
  ORDERS:           "orders",
  ORDER_ITEMS:      "items",           // subcollection under orders
  REVIEWS:          "reviews",
  WISHLISTS:        "wishlists",
  NOTIFICATIONS:    "notifications",
  SUPPORT_TICKETS:  "support_tickets",
  ACTIVITY_LOGS:    "activity_logs",
  ADMINS:           "admins",
  SETTINGS:         "settings",
} as const;
