const fs = require('fs');

const content = `import { CartItem } from "@/types";

const ADMIN_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export interface WhatsAppOrderPayload {
  trackingCode:  string;
  customerName:  string;
  customerPhone: string;
  institution:   string;
  department:    string;
  semester:      number;
  gender:        string;
  items:         CartItem[];
  subTotal:      number;
  discountAmount: number;
  totalAmount:   number;
  address:       string;
  notes?:        string;
}

export function buildOrderMessage(payload: WhatsAppOrderPayload): string {
  const {
    trackingCode,
    customerName,
    customerPhone,
    institution,
    department,
    semester,
    gender,
    items,
    subTotal,
    discountAmount,
    totalAmount,
    address,
    notes,
  } = payload;

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemLines = items
    .map(
      (item, i) =>
        \`\${i + 1}. *\${item.productName}*\\n   Size: \${item.size} | Qty: \${item.qty}\\n   Price: ₹\${(item.unitPrice * item.qty).toLocaleString("en-IN")}\`
    )
    .join("\\n");

  return [
    \`*🎉 NEW ORDER RECEIVED | STITZZY 🎉*\`,
    \`*🆔 Order ID:* #\${trackingCode}\`,
    \`*📅 Date:* \${dateStr}\`,
    \`\`,
    \`*🎓 Academic Details*\`,
    \`• *🏫 Institution:* \${institution}\`,
    \`• *📚 Department:* \${department}\`,
    \`• *⏳ Semester:* \${semester}\${semester === 1 ? "st" : semester === 2 ? "nd" : semester === 3 ? "rd" : "th"} Semester\`,
    \`• *👕 Gender:* \${gender}\`,
    \`\`,
    \`*🛍️ Order Items*\`,
    itemLines,
    \`\`,
    \`*💳 Billing Summary*\`,
    \`• *💰 Subtotal:* ₹\${subTotal.toLocaleString("en-IN")}\`,
    discountAmount > 0 ? \`• *🎁 Combo Discount:* -₹\${discountAmount.toLocaleString("en-IN")}\` : null,
    \`• *🧾 Total Amount:* *₹\${totalAmount.toLocaleString("en-IN")}*\`,
    \`• *💸 Payment:* Pay on Delivery / UPI\`,
    null,
    \`*📍 Customer Information*\`,
    \`• *👤 Name:* \${customerName}\`,
    \`• *📱 Phone:* \${customerPhone}\`,
    \`• *🏠 Address:* \${address}\`,
    notes ? \`• *📝 Notes:* \${notes}\` : null,
    null,
    \`*🚚 Fulfillment*\`,
    \`• *📦 Est. Delivery:* 3-5 Business Days\`,
    null,
    \`_✨ Thank you for choosing Stitzzy! Please reply to this message to confirm your order. ✨_\`,
  ]
    .filter((line): line is string => line !== null)
    .join("\\n");
}

export function generateWhatsAppLink(payload: WhatsAppOrderPayload): string {
  const message = buildOrderMessage(payload);
  const encoded = encodeURIComponent(message);
  return \`https://wa.me/\${ADMIN_WHATSAPP_NUMBER}?text=\${encoded}\`;
}
`;

fs.writeFileSync('C:\\\\Users\\\\afjal\\\\Desktop\\\\Stitzzy\\\\stitzzy-app\\\\lib\\\\whatsapp.ts', content, { encoding: 'utf8' });
console.log("Rewrote whatsapp.ts with explicit UTF-8 encoding");
