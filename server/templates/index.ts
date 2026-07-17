import { env } from "../config/env";

// ─── Color Constants ─────────────────────────────────────────────────
export const GOLD = "#C9A96E";
export const DARK = "#18181B";
export const LIGHT_BG = "#FAFAFA";
export const WHITE = "#FFFFFF";
export const TEXT = "#27272A";
export const MUTED = "#71717A";
export const BORDER = "#E4E4E7";
export const EMERALD = "#10B981";
export const RED = "#EF4444";

// ─── Customer Display Name Helper & Input Schema ─────────────────────
export interface CustomerNameInput {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  shippingAddress?: { firstName?: string | null; lastName?: string | null } | null;
  billingAddress?: { firstName?: string | null; lastName?: string | null } | null;
  email?: string | null;
}

export function getCustomerDisplayName(data?: CustomerNameInput | null): string {
  if (!data) return "Valued Customer";

  // 1. customer.firstName + customer.lastName
  const profileName = [data.firstName, data.lastName].map(s => s?.trim()).filter(Boolean).join(" ");
  if (profileName) return profileName;

  // 2. shippingAddress.firstName + lastName
  if (data.shippingAddress) {
    const shippingName = [data.shippingAddress.firstName, data.shippingAddress.lastName]
      .map(s => s?.trim())
      .filter(Boolean)
      .join(" ");
    if (shippingName) return shippingName;
  }

  // 3. billingAddress.firstName + lastName
  if (data.billingAddress) {
    const billingName = [data.billingAddress.firstName, data.billingAddress.lastName]
      .map(s => s?.trim())
      .filter(Boolean)
      .join(" ");
    if (billingName) return billingName;
  }

  // 4. account display name
  if (data.displayName?.trim() && !data.displayName.includes("@")) return data.displayName.trim();

  return "Valued Customer";
}

// ─── Shared Types ────────────────────────────────────────────────────
export interface EmailItem {
  name: string;
  imageUrl?: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface ThankYouData {
  customer?: CustomerNameInput | null;
  customerName?: string; // fallback
  orderNumber: string;
  orderDate: string;
  items: EmailItem[];
  subtotal: number;
  shippingAddress: string;
  estimatedDelivery: string;
  shipping?: number;
  tax?: number;
  total?: number;
  paymentMethod?: string;
  trackingId?: string;
}

export interface InvoiceEmailData {
  customer?: CustomerNameInput | null;
  customerName?: string; // fallback
  invoiceNumber: string;
  orderNumber: string;
  orderDate: string;
  billingAddress: string;
  shippingAddress: string;
  items: EmailItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}

export interface AdminNotificationData {
  customer?: CustomerNameInput | null;
  customerName?: string; // fallback
  customerEmail: string;
  phone: string;
  orderNumber: string;
  invoiceNumber: string;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  items: EmailItem[];
  total: number;
  orderTime: string;
}

export interface ShippingUpdateData {
  customer?: CustomerNameInput | null;
  customerName?: string; // fallback
  orderNumber: string;
  status: "processing" | "packed" | "shipped" | "delivered";
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  items: EmailItem[];
}

export interface ReturnUpdateData {
  customer?: CustomerNameInput | null;
  customerName?: string; // fallback
  orderNumber: string;
  returnStatus: "requested" | "approved" | "rejected";
  reason?: string;
  items: EmailItem[];
}

export interface RefundUpdateData {
  customer?: CustomerNameInput | null;
  customerName?: string; // fallback
  orderNumber: string;
  refundStatus: "processed" | "completed";
  amount: number;
  items: EmailItem[];
}

export interface ContactAutoReplyData {
  name: string;
  message: string;
}

export interface ContactNotificationData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface WelcomeEmailData {
  customer?: CustomerNameInput | null;
  customerName?: string; // fallback
  shopUrl?: string;
}

export interface PasswordResetData {
  customer?: CustomerNameInput | null;
  customerName?: string; // fallback
  resetUrl: string;
}

export interface EmailVerificationData {
  customer?: CustomerNameInput | null;
  customerName?: string; // fallback
  verificationUrl: string;
}

export interface PaymentFailedData {
  customer?: CustomerNameInput | null;
  customerName?: string; // fallback
  orderNumber: string;
  totalAmount: number;
  retryUrl?: string;
}

export interface OrderCancelledData {
  customer?: CustomerNameInput | null;
  customerName?: string; // fallback
  orderNumber: string;
  reason?: string;
  items: EmailItem[];
  refundAmount?: number;
}

// ─── Shared Helpers ───────────────────────────────────────────────────
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── Layout Components ────────────────────────────────────────────────
export function wrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>ANORA</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${LIGHT_BG}; -webkit-font-smoothing: antialiased; }
    a { color: ${GOLD}; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 32px 24px !important; }
      .item-image { width: 56px !important; height: 56px !important; }
      .logo { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${LIGHT_BG};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_BG};">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table class="container" role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:${WHITE};border:1px solid ${BORDER};">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function header(): string {
  return `<tr>
    <td class="content" style="padding:48px 48px 32px;text-align:center;background-color:${WHITE};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:32px;border-bottom:1px solid ${BORDER};">
            <a href="https://anora-elegance.com" style="text-decoration:none;display:inline-block;">
              <h1 class="logo" style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:28px;letter-spacing:8px;color:${DARK};margin:0;font-weight:300;text-transform:uppercase;">ANORA</h1>
              <p style="font-size:10px;letter-spacing:4px;color:${MUTED};margin:6px 0 0;text-transform:uppercase;font-weight:400;">Atelier</p>
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export function footer(): string {
  return `<tr>
    <td class="content" style="padding:32px 48px 48px;background-color:${WHITE};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:32px 0 0;border-top:1px solid ${BORDER};">
            <p style="font-size:11px;color:${MUTED};text-align:center;margin:0 0 8px;line-height:1.6;letter-spacing:0.5px;">
              Thank you for shopping with ANORA.
            </p>
            <p style="font-size:11px;color:${MUTED};text-align:center;margin:0 0 8px;line-height:1.6;">
              Customer Support &nbsp;·&nbsp; 
              <a href="https://anora-elegance.com" style="color:${DARK};text-decoration:none;font-weight:500;">www.anora-elegance.com</a> &nbsp;·&nbsp;
              <a href="mailto:support@anora-elegance.com" style="color:${DARK};text-decoration:none;font-weight:500;">support@anora-elegance.com</a>
            </p>
            <p style="font-size:10px;color:${MUTED};text-align:center;margin:16px 0 0;line-height:1.5;">
              © ${new Date().getFullYear()} ANORA. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export function orderSummaryTable(items: EmailItem[]): string {
  if (items.length === 0) return "";
  const rows = items
    .map((item, i) => {
      const imageCell = item.imageUrl
        ? `<img class="item-image" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" width="56" height="56" style="display:block;width:56px;height:56px;object-fit:cover;border:1px solid ${BORDER};" />`
        : `<div class="item-image" style="width:56px;height:56px;background-color:${LIGHT_BG};border:1px solid ${BORDER};"></div>`;

      const subtotal = (item.unitPrice * item.quantity).toFixed(2);

      return `<tr>
      <td style="padding:16px 8px 16px 0;border-bottom:1px solid ${BORDER};">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;padding-right:16px;">${imageCell}</td>
            <td style="vertical-align:top;">
              <p style="font-size:13px;color:${DARK};margin:0 0 4px;font-weight:500;">${escapeHtml(item.name)}</p>
              <p style="font-size:11px;color:${MUTED};margin:0;text-transform:uppercase;letter-spacing:0.5px;">Size ${escapeHtml(item.size)} · Qty ${item.quantity}</p>
            </td>
          </tr>
        </table>
      </td>
      <td style="padding:16px 0 16px 8px;border-bottom:1px solid ${BORDER};text-align:right;vertical-align:top;font-size:13px;color:${DARK};font-weight:500;">
        $${subtotal}
      </td>
    </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:8px;">
    <thead>
      <tr>
        <th style="padding-bottom:12px;text-align:left;font-size:10px;letter-spacing:1px;color:${MUTED};text-transform:uppercase;font-weight:500;border-bottom:1px solid ${BORDER};">Selected Items</th>
        <th style="padding-bottom:12px;text-align:right;font-size:10px;letter-spacing:1px;color:${MUTED};text-transform:uppercase;font-weight:500;border-bottom:1px solid ${BORDER};">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function shippingBlock(label: string, address: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
    <tr>
      <td style="padding:8px 0;">
        <p style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 8px;font-weight:600;">${escapeHtml(label)}</p>
        <p style="font-size:13px;color:${TEXT};margin:0;line-height:1.6;">${escapeHtml(address).replace(/\n/g, "<br>")}</p>
      </td>
    </tr>
  </table>`;
}

export function totalRow(label: string, value: string, bold = false, color = TEXT): string {
  const weight = bold ? "font-weight:600;font-size:14px;color:${DARK};" : "font-size:13px;";
  return `<tr>
    <td style="padding:6px 0;text-align:right;"><span style="font-size:13px;color:${MUTED};">${escapeHtml(label)}</span></td>
    <td style="padding:6px 0;text-align:right;width:120px;"><span style="${weight}color:${color};">${value}</span></td>
  </tr>`;
}

export function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;">
      <p style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 4px;font-weight:500;">${escapeHtml(label)}</p>
      <p style="font-size:13px;color:${DARK};margin:0;">${value}</p>
    </td>
  </tr>`;
}

export function statusBadge(text: string, color: string): string {
  return `<span style="display:inline-block;padding:4px 12px;font-size:11px;color:${color};border:1px solid ${color};border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;font-weight:500;background-color:${LIGHT_BG};">${escapeHtml(text)}</span>`;
}

export function divider(): string {
  return `<tr><td style="padding:0 48px;background-color:${WHITE};"><div style="height:1px;background-color:${BORDER};"></div></td></tr>`;
}

// ─── Order Confirmation Email ────────────────────────────────────────
export function buildThankYouHtml(data: ThankYouData): string {
  const itemsHtml = orderSummaryTable(data.items);
  const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });

  const body = `
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;text-align:left;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:24px;color:${DARK};margin:0 0 24px;font-weight:400;letter-spacing:1px;text-align:center;">Order Confirmed</h2>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;">Dear ${escapeHtml(resolvedName)},</p>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;">Thank you for choosing ANORA.</p>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;">We are delighted to confirm that your order has been received successfully. Every piece is carefully prepared in our atelier to ensure it meets the quality and craftsmanship you expect from us.</p>
              <p style="font-size:14px;color:${TEXT};margin:0 0 24px;line-height:1.6;">Your order is now being processed, and you'll be able to track its progress from your account once it moves through our fulfillment stages.</p>
              <p style="font-size:14px;color:${TEXT};margin:0 0 8px;line-height:1.6;">Warm regards,</p>
              <p style="font-size:14px;color:${TEXT};margin:0;font-weight:500;line-height:1.6;">The ANORA Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};text-align:center;">
        <div style="border:1px solid ${BORDER};background-color:${LIGHT_BG};padding:24px;margin-bottom:24px;text-align:center;">
          <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};margin:0 0 8px;font-weight:500;">Secure Tracking ID</p>
          <h3 style="font-family:'Courier New',Courier,monospace;font-size:22px;letter-spacing:4px;color:${DARK};margin:0 0 16px;font-weight:700;">${escapeHtml(data.trackingId || '')}</h3>
          <button type="button" onclick="navigator.clipboard.writeText('${escapeHtml(data.trackingId || '')}').then(() => { this.innerText = '✓ Copied'; const self = this; setTimeout(() => { self.innerText = 'Copy Tracking ID'; }, 2000); }).catch(() => {})" style="display:inline-block;background-color:${WHITE};border:1px solid ${DARK};color:${DARK};padding:8px 18px;font-size:10px;letter-spacing:1px;text-transform:uppercase;text-decoration:none;font-weight:500;cursor:pointer;outline:none;font-family:inherit;line-height:normal;">Copy Tracking ID</button>
        </div>
        <a href="${escapeHtml(env.publicAppUrl)}/track?tracking=${escapeHtml(encodeURIComponent(data.trackingId || ''))}" style="display:inline-block;background-color:${DARK};color:${WHITE};padding:14px 36px;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;font-weight:500;border-radius:0;">View Your Order</a>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        <div style="border-top:1px solid ${BORDER};padding-top:24px;text-align:left;">
          <p style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 12px;font-weight:600;">Next Steps</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:${TEXT};line-height:1.6;">
            <tr>
              <td style="padding:4px 0;vertical-align:top;width:20px;color:${GOLD};">•</td>
              <td style="padding:4px 0;"><strong>Atelier Preparation:</strong> Our team is hand-packaging and verifying your selected items.</td>
            </tr>
            <tr>
              <td style="padding:4px 0;vertical-align:top;width:20px;color:${GOLD};">•</td>
              <td style="padding:4px 0;"><strong>Dispatch:</strong> As soon as your order ships, we will send you a tracking number via email.</td>
            </tr>
            <tr>
              <td style="padding:4px 0;vertical-align:top;width:20px;color:${GOLD};">•</td>
              <td style="padding:4px 0;"><strong>Invoice Attached:</strong> A detailed PDF copy of your invoice is attached to this email for your records.</td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_BG};border:1px solid ${BORDER};padding:24px;margin-bottom:16px;">
          <tr>
            <td style="text-align:center;padding:0 8px;border-right:1px solid ${BORDER};width:25%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Order Ref</p>
              <p style="font-size:13px;color:${DARK};margin:0;font-weight:500;">${escapeHtml(data.orderNumber)}</p>
            </td>
            <td style="text-align:center;padding:0 8px;border-right:1px solid ${BORDER};width:25%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Date Ordered</p>
              <p style="font-size:12px;color:${DARK};margin:0;">${new Date(data.orderDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </td>
            <td style="text-align:center;padding:0 8px;border-right:1px solid ${BORDER};width:25%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Est. Delivery</p>
              <p style="font-size:12px;color:${DARK};margin:0;">${data.estimatedDelivery}</p>
            </td>
            <td style="text-align:center;padding:0 8px;width:25%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Payment Method</p>
              <p style="font-size:12px;color:${DARK};margin:0;text-transform:capitalize;">${escapeHtml(data.paymentMethod || "Card")}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:16px 48px 0;background-color:${WHITE};">
        ${itemsHtml}
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${totalRow("Subtotal", `$${data.subtotal.toFixed(2)}`)}
          ${data.shipping && data.shipping > 0 ? totalRow("Shipping", `$${data.shipping.toFixed(2)}`) : totalRow("Shipping", "Complimentary")}
          ${data.tax && data.tax > 0 ? totalRow("Tax", `$${data.tax.toFixed(2)}`) : ""}
          <tr>
            <td style="padding:12px 0;text-align:right;border-top:1px solid ${BORDER};"><span style="font-size:14px;color:${DARK};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Grand Total</span></td>
            <td style="padding:12px 0;text-align:right;border-top:1px solid ${BORDER};width:120px;"><span style="font-size:16px;color:${DARK};font-weight:600;">$${(data.total ?? data.subtotal).toFixed(2)}</span></td>
          </tr>
          ${data.paymentMethod ? `
          <tr>
            <td colspan="2" style="padding:16px 0 0;text-align:right;">
              <p style="font-size:11px;color:${MUTED};margin:0;text-transform:uppercase;letter-spacing:0.5px;">
                Paid via ${escapeHtml(data.paymentMethod)}
              </p>
            </td>
          </tr>
          ` : ""}
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        ${shippingBlock("Shipping Address", data.shippingAddress)}
      </td>
    </tr>
    ${footer()}
  `;
  return wrap(body);
}

// ─── Invoice Email ────────────────────────────────────────────────────
export function buildInvoiceEmailHtml(data: InvoiceEmailData): string {
  const itemsHtml = orderSummaryTable(data.items);
  const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });

  const body = `
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;text-align:center;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:24px;color:${DARK};margin:0 0 16px;font-weight:400;letter-spacing:1px;">Invoice Details</h2>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;text-align:left;">Dear ${escapeHtml(resolvedName)},</p>
              <p style="font-size:14px;color:${TEXT};margin:0;line-height:1.6;text-align:left;">Thank you for your business. Please find your detailed invoice outline below. A PDF copy is attached to this email for your records.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_BG};border:1px solid ${BORDER};padding:24px;margin-bottom:16px;">
          <tr>
            <td style="text-align:center;padding:0 8px;border-right:1px solid ${BORDER};width:25%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Invoice No</p>
              <p style="font-size:13px;color:${DARK};margin:0;font-weight:500;">${escapeHtml(data.invoiceNumber)}</p>
            </td>
            <td style="text-align:center;padding:0 8px;border-right:1px solid ${BORDER};width:25%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Order ID</p>
              <p style="font-size:13px;color:${DARK};margin:0;">${escapeHtml(data.orderNumber)}</p>
            </td>
            <td style="text-align:center;padding:0 8px;border-right:1px solid ${BORDER};width:25%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Date</p>
              <p style="font-size:13px;color:${DARK};margin:0;">${new Date(data.orderDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </td>
            <td style="text-align:center;padding:0 8px;width:25%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Status</p>
              <p style="font-size:13px;color:${GOLD};margin:0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(data.paymentStatus)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;width:50%;padding-right:16px;">${shippingBlock("Billing Address", data.billingAddress)}</td>
            <td style="vertical-align:top;width:50%;padding-left:16px;">${shippingBlock("Shipping Address", data.shippingAddress)}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        ${itemsHtml}
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${totalRow("Subtotal", `$${data.subtotal.toFixed(2)}`)}
          ${data.shipping > 0 ? totalRow("Shipping", `$${data.shipping.toFixed(2)}`) : totalRow("Shipping", "Complimentary")}
          ${data.tax > 0 ? totalRow("Tax", `$${data.tax.toFixed(2)}`) : ""}
          <tr>
            <td style="padding:12px 0;text-align:right;border-top:1px solid ${BORDER};">
              <span style="font-size:14px;color:${DARK};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Grand Total</span>
            </td>
            <td style="padding:12px 0;text-align:right;border-top:1px solid ${BORDER};width:120px;">
              <span style="font-size:16px;color:${DARK};font-weight:600;">$${data.total.toFixed(2)}</span>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:16px 0 0;text-align:right;">
              <p style="font-size:11px;color:${MUTED};margin:0;text-transform:uppercase;letter-spacing:0.5px;">
                Paid via ${escapeHtml(data.paymentMethod)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${footer()}
  `;
  return wrap(body);
}

// ─── Admin Notification ───────────────────────────────────────────────
export function buildAdminNotificationHtml(data: AdminNotificationData): string {
  const itemsHtml = orderSummaryTable(data.items);
  const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });

  const body = `
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;text-align:center;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:22px;color:${DARK};margin:0 0 8px;font-weight:400;letter-spacing:1px;">New Order Received</h2>
              <p style="font-size:14px;color:${MUTED};margin:0;line-height:1.6;">Order and payment details outlined below.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_BG};border:1px solid ${BORDER};padding:24px;margin-bottom:16px;">
          <tr>
            <td style="text-align:center;padding:0 10px;border-right:1px solid ${BORDER};width:33%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Order No</p>
              <p style="font-size:13px;color:${DARK};margin:0;font-weight:500;">${escapeHtml(data.orderNumber)}</p>
            </td>
            <td style="text-align:center;padding:0 10px;border-right:1px solid ${BORDER};width:33%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Invoice No</p>
              <p style="font-size:13px;color:${DARK};margin:0;">${escapeHtml(data.invoiceNumber)}</p>
            </td>
            <td style="text-align:center;padding:0 10px;width:33%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Total</p>
              <p style="font-size:13px;color:${GOLD};margin:0;font-weight:600;">$${data.amountPaid.toFixed(2)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:20px 48px 0;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;width:50%;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                ${infoRow("Customer", escapeHtml(resolvedName))}
                ${infoRow("Email", `<a href="mailto:${escapeHtml(data.customerEmail)}" style="color:${DARK};text-decoration:none;font-weight:500;">${escapeHtml(data.customerEmail)}</a>`)}
                ${infoRow("Phone", escapeHtml(data.phone))}
              </table>
            </td>
            <td style="vertical-align:top;width:50%;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                ${infoRow("Payment Method", escapeHtml(data.paymentMethod).toUpperCase())}
                ${infoRow("Payment Status", statusBadge(data.paymentStatus, GOLD))}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:20px 48px 0;background-color:${WHITE};">
        ${shippingBlock("Shipping Address", data.shippingAddress)}
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        ${itemsHtml}
      </td>
    </tr>
    ${footer()}
  `;
  return wrap(body);
}

// ─── Shipping Update Email ────────────────────────────────────────────
export function buildShippingUpdateHtml(data: ShippingUpdateData): string {
  const itemsHtml = orderSummaryTable(data.items);
  const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });

  const statusLabels: Record<string, string> = {
    processing: "Order Processing",
    packed: "Order Packed",
    shipped: "Order Shipped",
    delivered: "Order Delivered",
  };

  const statusDescriptions: Record<string, string> = {
    processing: "Your order is being reviewed and processed by our atelier.",
    packed: "Your pieces have been securely packaged and prepared for dispatch.",
    shipped: "Your parcel is on its way. Use the tracking link below for logistics updates.",
    delivered: "Your package has been safely delivered. We hope you appreciate your new pieces.",
  };

  const body = `
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;text-align:center;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:24px;color:${DARK};margin:0 0 16px;font-weight:400;letter-spacing:1px;">${statusLabels[data.status] || "Order Shipment Update"}</h2>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;text-align:left;">Dear ${escapeHtml(resolvedName)},</p>
              <p style="font-size:14px;color:${TEXT};margin:0;line-height:1.6;text-align:left;">
                ${statusDescriptions[data.status] || "Your order status has been updated."}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_BG};border:1px solid ${BORDER};padding:24px;margin-bottom:16px;">
          <tr>
            <td style="text-align:center;padding:0 10px;border-right:1px solid ${BORDER};width:33%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Order Ref</p>
              <p style="font-size:14px;color:${DARK};margin:0;font-weight:500;">${escapeHtml(data.orderNumber)}</p>
            </td>
            ${
              data.trackingNumber
                ? `<td style="text-align:center;padding:0 10px;border-right:1px solid ${BORDER};width:33%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Tracking</p>
              <p style="font-size:13px;color:${DARK};margin:0;font-weight:500;">${escapeHtml(data.trackingNumber)}</p>
            </td>`
                : ""
            }
            ${
              data.estimatedDelivery
                ? `<td style="text-align:center;padding:0 10px;width:33%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Est. Delivery</p>
              <p style="font-size:13px;color:${DARK};margin:0;">${escapeHtml(data.estimatedDelivery)}</p>
            </td>`
                : ""
            }
          </tr>
        </table>
      </td>
    </tr>
    ${
      data.trackingUrl
        ? `<tr>
      <td class="content" style="padding:16px 48px;background-color:${WHITE};text-align:center;">
        <a href="${escapeHtml(data.trackingUrl)}" style="display:inline-block;background-color:${DARK};color:${WHITE};padding:14px 36px;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;font-weight:500;border-radius:0;">Track Delivery</a>
      </td>
    </tr>`
        : ""
    }
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        <h3 style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 16px;font-weight:600;">Items in This Shipment</h3>
        ${itemsHtml}
      </td>
    </tr>
    ${footer()}
  `;
  return wrap(body);
}

// ─── Return Update Email ──────────────────────────────────────────────
export function buildReturnUpdateHtml(data: ReturnUpdateData): string {
  const itemsHtml = orderSummaryTable(data.items);
  const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });

  const returnLabels: Record<string, string> = {
    requested: "Return Requested",
    approved: "Return Approved",
    rejected: "Return Rejected",
  };
  const returnColors: Record<string, string> = {
    requested: GOLD,
    approved: EMERALD,
    rejected: RED,
  };

  const statusText: Record<string, string> = {
    requested: "We have received your request for a return. Our team will review the details and provide instructions shortly.",
    approved: "Your return request has been approved. Please follow the instructions provided to ship the items back.",
    rejected: "We have reviewed your return request and regret to inform you that we cannot approve a return for these items.",
  };

  const body = `
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;text-align:center;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:24px;color:${DARK};margin:0 0 16px;font-weight:400;letter-spacing:1px;">${returnLabels[data.returnStatus] || "Return Status"}</h2>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;text-align:left;">Dear ${escapeHtml(resolvedName)},</p>
              <p style="font-size:14px;color:${TEXT};margin:0;line-height:1.6;text-align:left;">
                ${statusText[data.returnStatus] || "Your return status has been updated."}
              </p>
              ${data.reason ? `<p style="font-size:13px;color:${MUTED};margin:12px 0 0;line-height:1.6;text-align:left;font-style:italic;">Reason: "${escapeHtml(data.reason)}"</p>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};text-align:center;">
        ${statusBadge(returnLabels[data.returnStatus], returnColors[data.returnStatus] || GOLD)}
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        <h3 style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 16px;font-weight:600;">Returned Pieces</h3>
        ${itemsHtml}
      </td>
    </tr>
    ${footer()}
  `;
  return wrap(body);
}

// ─── Refund Update Email ──────────────────────────────────────────────
export function buildRefundUpdateHtml(data: RefundUpdateData): string {
  const itemsHtml = orderSummaryTable(data.items);
  const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });

  const refundLabels: Record<string, string> = {
    processed: "Refund Processed",
    completed: "Refund Completed",
  };

  const body = `
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;text-align:center;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:24px;color:${DARK};margin:0 0 16px;font-weight:400;letter-spacing:1px;">${refundLabels[data.refundStatus] || "Refund Notice"}</h2>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;text-align:left;">Dear ${escapeHtml(resolvedName)},</p>
              <p style="font-size:14px;color:${TEXT};margin:0;line-height:1.6;text-align:left;">
                ${data.refundStatus === "processed" ? `A refund of $${data.amount.toFixed(2)} has been initiated for your order. The funds should reflect in your account within 5-10 business days depending on your financial institution.` : `We have finalized your refund of $${data.amount.toFixed(2)}.`}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_BG};border:1px solid ${BORDER};padding:24px;margin-bottom:16px;">
          <tr>
            <td style="text-align:center;padding:0 10px;border-right:1px solid ${BORDER};width:50%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Order Ref</p>
              <p style="font-size:14px;color:${DARK};margin:0;font-weight:500;">${escapeHtml(data.orderNumber)}</p>
            </td>
            <td style="text-align:center;padding:0 10px;width:50%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Refund Amount</p>
              <p style="font-size:15px;color:${EMERALD};margin:0;font-weight:600;">$${data.amount.toFixed(2)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        <h3 style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 16px;font-weight:600;">Items</h3>
        ${itemsHtml}
      </td>
    </tr>
    ${footer()}
  `;
  return wrap(body);
}

// ─── Contact Auto-Reply Email ─────────────────────────────────────────
export function buildContactAutoReplyHtml(data: ContactAutoReplyData): string {
  const body = `
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:24px;color:${DARK};margin:0 0 16px;font-weight:400;letter-spacing:1px;text-align:center;">Thank You for Reaching Out</h2>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;">Dear ${escapeHtml(data.name)},</p>
              <p style="font-size:14px;color:${TEXT};margin:0;line-height:1.6;">We have successfully received your inquiry. A representative from our atelier will respond to you within 24 business hours.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_BG};border:1px solid ${BORDER};padding:24px;">
          <tr>
            <td>
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 8px;font-weight:600;">Your Message</p>
              <p style="font-size:13px;color:${TEXT};margin:0;line-height:1.6;font-style:italic;">"${escapeHtml(data.message)}"</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${footer()}
  `;
  return wrap(body);
}

// ─── Contact Notification (Admin) Email ──────────────────────────────
export function buildContactNotificationHtml(data: ContactNotificationData): string {
  const body = `
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;text-align:center;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:22px;color:${DARK};margin:0 0 8px;font-weight:400;letter-spacing:1px;">New Customer Inquiry</h2>
              <p style="font-size:14px;color:${MUTED};margin:0;line-height:1.6;">A contact message has been submitted on the site.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
          <tr>
            <td style="vertical-align:top;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                ${infoRow("Sender Name", escapeHtml(data.name))}
                ${infoRow("Sender Email", `<a href="mailto:${escapeHtml(data.email)}" style="color:${DARK};text-decoration:none;font-weight:500;">${escapeHtml(data.email)}</a>`)}
                ${infoRow("Sender Phone", escapeHtml(data.phone))}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_BG};border:1px solid ${BORDER};padding:24px;">
          <tr>
            <td>
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 8px;font-weight:600;">Message</p>
              <p style="font-size:13px;color:${TEXT};margin:0;line-height:1.6;">${escapeHtml(data.message)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${footer()}
  `;
  return wrap(body);
}

// ─── Welcome Email ───────────────────────────────────────────────────
export function buildWelcomeEmailHtml(data: WelcomeEmailData): string {
  const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });
  const shopUrl = data.shopUrl || "https://anora-elegance.com/shop";

  const body = `
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;text-align:center;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:24px;color:${DARK};margin:0 0 16px;font-weight:400;letter-spacing:1px;">Welcome to ANORA</h2>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;text-align:left;">Dear ${escapeHtml(resolvedName)},</p>
              <p style="font-size:14px;color:${TEXT};margin:0 0 24px;line-height:1.6;text-align:left;">
                Thank you for creating an account with ANORA. We are dedicated to providing quiet, considered luxury pieces crafted in our atelier for every moment of a lifetime.
              </p>
              <a href="${escapeHtml(shopUrl)}" style="display:inline-block;background-color:${DARK};color:${WHITE};padding:14px 36px;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;font-weight:500;border-radius:0;">Explore the Collection</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${footer()}
  `;
  return wrap(body);
}

// ─── Password Reset Email ────────────────────────────────────────────
export function buildPasswordResetHtml(data: PasswordResetData): string {
  const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });

  const body = `
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;text-align:center;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:24px;color:${DARK};margin:0 0 16px;font-weight:400;letter-spacing:1px;">Reset Your Password</h2>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;text-align:left;">Dear ${escapeHtml(resolvedName)},</p>
              <p style="font-size:14px;color:${TEXT};margin:0 0 24px;line-height:1.6;text-align:left;">
                We received a request to reset your password. Click the link below to configure a new password. If you did not request this change, please ignore this email.
              </p>
              <a href="${escapeHtml(data.resetUrl)}" style="display:inline-block;background-color:${DARK};color:${WHITE};padding:14px 36px;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;font-weight:500;border-radius:0;">Reset Password</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${footer()}
  `;
  return wrap(body);
}

// ─── Email Verification Email ────────────────────────────────────────
export function buildEmailVerificationHtml(data: EmailVerificationData): string {
  const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });

  const body = `
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;text-align:center;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:24px;color:${DARK};margin:0 0 16px;font-weight:400;letter-spacing:1px;">Confirm Your Email</h2>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;text-align:left;">Dear ${escapeHtml(resolvedName)},</p>
              <p style="font-size:14px;color:${TEXT};margin:0 0 24px;line-height:1.6;text-align:left;">
                Thank you for signing up. Please verify your email address by clicking the confirmation link below.
              </p>
              <a href="${escapeHtml(data.verificationUrl)}" style="display:inline-block;background-color:${DARK};color:${WHITE};padding:14px 36px;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;font-weight:500;border-radius:0;">Verify Email</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${footer()}
  `;
  return wrap(body);
}

// ─── Payment Failed Email ────────────────────────────────────────────
export function buildPaymentFailedHtml(data: PaymentFailedData): string {
  const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });
  const retryUrl = data.retryUrl || "https://anora-elegance.com/checkout";

  const body = `
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;text-align:center;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:24px;color:${RED};margin:0 0 16px;font-weight:400;letter-spacing:1px;">Payment Transaction Failed</h2>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;text-align:left;">Dear ${escapeHtml(resolvedName)},</p>
              <p style="font-size:14px;color:${TEXT};margin:0 0 24px;line-height:1.6;text-align:left;">
                We were unable to process the payment for order ${escapeHtml(data.orderNumber)} (amounting to $${data.totalAmount.toFixed(2)}). Please click the button below to update your billing details and complete checkout.
              </p>
              <a href="${escapeHtml(retryUrl)}" style="display:inline-block;background-color:${DARK};color:${WHITE};padding:14px 36px;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;font-weight:500;border-radius:0;">Retry Payment</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${footer()}
  `;
  return wrap(body);
}

// ─── Order Cancelled Email ───────────────────────────────────────────
export function buildOrderCancelledHtml(data: OrderCancelledData): string {
  const itemsHtml = orderSummaryTable(data.items);
  const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });

  const body = `
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;text-align:center;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:24px;color:${DARK};margin:0 0 16px;font-weight:400;letter-spacing:1px;">Your Order has been Cancelled</h2>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;text-align:left;">Dear ${escapeHtml(resolvedName)},</p>
              <p style="font-size:14px;color:${TEXT};margin:0;line-height:1.6;text-align:left;">
                We have cancelled order ${escapeHtml(data.orderNumber)} per request or automatic verification.
                ${data.refundAmount && data.refundAmount > 0 ? ` A refund of $${data.refundAmount.toFixed(2)} has been processed to your original payment method.` : ""}
              </p>
              ${data.reason ? `<p style="font-size:13px;color:${MUTED};margin:12px 0 0;line-height:1.6;text-align:left;font-style:italic;">Reason: "${escapeHtml(data.reason)}"</p>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        <h3 style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 16px;font-weight:600;">Cancelled Items</h3>
        ${itemsHtml}
      </td>
    </tr>
    ${footer()}
  `;
  return wrap(body);
}
