import { D as logger, b as getContainer, y as formatAddress } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/order-lifecycle-D6OSpTgj.js
var GOLD = "#C9A96E";
var DARK = "#18181B";
var LIGHT_BG = "#FAFAFA";
var WHITE = "#FFFFFF";
var TEXT = "#27272A";
var MUTED = "#71717A";
var BORDER = "#E4E4E7";
function getCustomerDisplayName(data) {
	if (!data) return "Valued Customer";
	const profileName = [data.firstName, data.lastName].map((s) => s?.trim()).filter(Boolean).join(" ");
	if (profileName) return profileName;
	if (data.shippingAddress) {
		const shippingName = [data.shippingAddress.firstName, data.shippingAddress.lastName].map((s) => s?.trim()).filter(Boolean).join(" ");
		if (shippingName) return shippingName;
	}
	if (data.billingAddress) {
		const billingName = [data.billingAddress.firstName, data.billingAddress.lastName].map((s) => s?.trim()).filter(Boolean).join(" ");
		if (billingName) return billingName;
	}
	if (data.displayName?.trim()) return data.displayName.trim();
	if (data.email?.trim()) return data.email.trim();
	return "Valued Customer";
}
function escapeHtml(str) {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function wrap(content) {
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
function header() {
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
function footer() {
	return `<tr>
    <td class="content" style="padding:32px 48px 48px;background-color:${WHITE};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:32px 0 0;border-top:1px solid ${BORDER};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <a href="https://instagram.com/anora_ny" style="display:inline-block;margin:0 12px;color:${MUTED};font-size:11px;letter-spacing:1px;text-transform:uppercase;">Instagram</a>
                  <span style="color:${BORDER};margin:0 4px;">·</span>
                  <a href="https://facebook.com/anora" style="display:inline-block;margin:0 12px;color:${MUTED};font-size:11px;letter-spacing:1px;text-transform:uppercase;">Facebook</a>
                  <span style="color:${BORDER};margin:0 4px;">·</span>
                  <a href="https://pinterest.com/anora" style="display:inline-block;margin:0 12px;color:${MUTED};font-size:11px;letter-spacing:1px;text-transform:uppercase;">Pinterest</a>
                </td>
              </tr>
            </table>
            <p style="font-size:11px;color:${MUTED};text-align:center;margin:0 0 6px;line-height:1.6;letter-spacing:0.5px;">
              ANORA Atelier — Elegance Crafted For Every Moment
            </p>
            <p style="font-size:11px;color:${MUTED};text-align:center;margin:0;line-height:1.6;">
              <a href="mailto:support@anora-elegance.com" style="color:${DARK};text-decoration:none;font-weight:500;">support@anora-elegance.com</a>
              &nbsp;&nbsp;·&nbsp;&nbsp; +1 (347) 325-6525
            </p>
            <p style="font-size:10px;color:${MUTED};text-align:center;margin:16px 0 0;line-height:1.5;">
              © ${(/* @__PURE__ */ new Date()).getFullYear()} ANORA. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}
function orderSummaryTable(items) {
	if (items.length === 0) return "";
	return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:8px;">
    <thead>
      <tr>
        <th style="padding-bottom:12px;text-align:left;font-size:10px;letter-spacing:1px;color:${MUTED};text-transform:uppercase;font-weight:500;border-bottom:1px solid ${BORDER};">Selected Items</th>
        <th style="padding-bottom:12px;text-align:right;font-size:10px;letter-spacing:1px;color:${MUTED};text-transform:uppercase;font-weight:500;border-bottom:1px solid ${BORDER};">Total</th>
      </tr>
    </thead>
    <tbody>${items.map((item, i) => {
		const imageCell = item.imageUrl ? `<img class="item-image" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" width="56" height="56" style="display:block;width:56px;height:56px;object-fit:cover;border:1px solid ${BORDER};" />` : `<div class="item-image" style="width:56px;height:56px;background-color:${LIGHT_BG};border:1px solid ${BORDER};"></div>`;
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
	}).join("")}</tbody>
  </table>`;
}
function shippingBlock(label, address) {
	return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
    <tr>
      <td style="padding:8px 0;">
        <p style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 8px;font-weight:600;">${escapeHtml(label)}</p>
        <p style="font-size:13px;color:${TEXT};margin:0;line-height:1.6;">${escapeHtml(address).replace(/\n/g, "<br>")}</p>
      </td>
    </tr>
  </table>`;
}
function totalRow(label, value, bold = false, color = TEXT) {
	const weight = bold ? "font-weight:600;font-size:14px;color:${DARK};" : "font-size:13px;";
	return `<tr>
    <td style="padding:6px 0;text-align:right;"><span style="font-size:13px;color:${MUTED};">${escapeHtml(label)}</span></td>
    <td style="padding:6px 0;text-align:right;width:120px;"><span style="${weight}color:${color};">${value}</span></td>
  </tr>`;
}
function infoRow(label, value) {
	return `<tr>
    <td style="padding:8px 0;">
      <p style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 4px;font-weight:500;">${escapeHtml(label)}</p>
      <p style="font-size:13px;color:${DARK};margin:0;">${value}</p>
    </td>
  </tr>`;
}
function statusBadge(text, color) {
	return `<span style="display:inline-block;padding:4px 12px;font-size:11px;color:${color};border:1px solid ${color};border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;font-weight:500;background-color:${LIGHT_BG};">${escapeHtml(text)}</span>`;
}
function buildThankYouHtml(data) {
	const itemsHtml = orderSummaryTable(data.items);
	const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });
	return wrap(`
    ${header()}
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0 32px;text-align:center;">
              <h2 style="font-family:'Didot','Playfair Display','Times New Roman',serif;font-size:24px;color:${DARK};margin:0 0 16px;font-weight:400;letter-spacing:1px;">Your Order is Confirmed</h2>
              <p style="font-size:14px;color:${TEXT};margin:0 0 16px;line-height:1.6;text-align:left;">Dear ${escapeHtml(resolvedName)},</p>
              <p style="font-size:14px;color:${TEXT};margin:0;line-height:1.6;text-align:left;">We are pleased to confirm your purchase. Your order is being meticulously prepared at our atelier and will be delivered to you shortly.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:0 48px;background-color:${WHITE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_BG};border:1px solid ${BORDER};padding:24px;margin-bottom:16px;">
          <tr>
            <td style="text-align:center;padding:0 12px;border-right:1px solid ${BORDER};width:33%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Order Ref</p>
              <p style="font-size:14px;color:${DARK};margin:0;font-weight:500;">${escapeHtml(data.orderNumber)}</p>
            </td>
            <td style="text-align:center;padding:0 12px;border-right:1px solid ${BORDER};width:33%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Date Ordered</p>
              <p style="font-size:13px;color:${DARK};margin:0;">${new Date(data.orderDate).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	})}</p>
            </td>
            <td style="text-align:center;padding:0 12px;width:33%;">
              <p style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">Est. Delivery</p>
              <p style="font-size:13px;color:${DARK};margin:0;">${data.estimatedDelivery}</p>
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
          <tr>
            <td style="padding:12px 0;text-align:right;border-top:1px solid ${BORDER};"><span style="font-size:14px;color:${DARK};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Total Paid</span></td>
            <td style="padding:12px 0;text-align:right;border-top:1px solid ${BORDER};width:120px;"><span style="font-size:16px;color:${DARK};font-weight:600;">$${data.subtotal.toFixed(2)}</span></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="content" style="padding:24px 48px 0;background-color:${WHITE};">
        ${shippingBlock("Shipping Address", data.shippingAddress)}
      </td>
    </tr>
    ${footer()}
  `);
}
function buildInvoiceEmailHtml(data) {
	const itemsHtml = orderSummaryTable(data.items);
	const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });
	return wrap(`
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
              <p style="font-size:13px;color:${DARK};margin:0;">${new Date(data.orderDate).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	})}</p>
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
  `);
}
function buildAdminNotificationHtml(data) {
	const itemsHtml = orderSummaryTable(data.items);
	const resolvedName = getCustomerDisplayName(data.customer || { displayName: data.customerName });
	return wrap(`
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
  `);
}
function estimatedDeliveryFrom(orderDateIso) {
	const deliveryDate = new Date(orderDateIso);
	deliveryDate.setDate(deliveryDate.getDate() + 7);
	return deliveryDate.toISOString().slice(0, 10);
}
function buildEmailPayload(input) {
	const shippingAddressText = formatAddress(input.shippingAddress);
	const billingAddressText = formatAddress(input.billingAddress);
	const customerNameInput = {
		firstName: input.customerProfile?.firstName,
		lastName: input.customerProfile?.lastName,
		displayName: input.customerProfile?.displayName,
		shippingAddress: {
			firstName: input.shippingAddress.firstName,
			lastName: input.shippingAddress.lastName
		},
		billingAddress: {
			firstName: input.billingAddress.firstName,
			lastName: input.billingAddress.lastName
		},
		email: input.customerEmail
	};
	return {
		...input,
		shippingAddressText,
		billingAddressText,
		thankYouHtml: buildThankYouHtml({
			customer: customerNameInput,
			orderNumber: input.orderNumber,
			orderDate: input.orderDate,
			items: input.items,
			subtotal: input.subtotal,
			shippingAddress: shippingAddressText,
			estimatedDelivery: estimatedDeliveryFrom(input.orderDate)
		}),
		invoiceEmailHtml: buildInvoiceEmailHtml({
			customer: customerNameInput,
			invoiceNumber: input.invoiceNumber,
			orderNumber: input.orderNumber,
			orderDate: input.orderDate,
			billingAddress: billingAddressText,
			shippingAddress: shippingAddressText,
			items: input.items,
			subtotal: input.subtotal,
			shipping: input.shipping,
			tax: input.tax,
			total: input.total,
			paymentMethod: input.paymentMethod,
			paymentStatus: input.paymentStatus
		}),
		adminSubject: `New order ${input.orderNumber}`,
		adminHtml: buildAdminNotificationHtml({
			customer: customerNameInput,
			customerEmail: input.customerEmail,
			phone: input.phone,
			orderNumber: input.orderNumber,
			invoiceNumber: input.invoiceNumber,
			amountPaid: input.total,
			paymentMethod: input.paymentMethod,
			paymentStatus: input.paymentStatus,
			shippingAddress: shippingAddressText,
			items: input.items,
			total: input.total,
			orderTime: input.orderDate
		})
	};
}
async function nextOrderNumber() {
	const { supabase } = getContainer();
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	const { data, error } = await supabase.rpc("next_order_number");
	if (error || !data) throw new Error("Failed to generate order number");
	return `AN-${year}-${String(Number(data)).padStart(6, "0")}`;
}
async function nextInvoiceNumber() {
	const { supabase } = getContainer();
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	const { data, error } = await supabase.rpc("next_invoice_number");
	if (error || !data) throw new Error("Failed to generate invoice number");
	return `INV-${year}-${String(Number(data)).padStart(6, "0")}`;
}
async function verifyPaymentIntent(paymentIntentId) {
	const { stripe } = getContainer();
	try {
		const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
		if (pi.status !== "succeeded") return {
			ok: false,
			error: `Payment not completed: ${pi.status}`
		};
		const metadata = pi.metadata ?? {};
		const userId = metadata.user_id;
		const email = metadata.email;
		const subtotal = parseFloat(metadata.subtotal ?? "0");
		if (!userId || !email) return {
			ok: false,
			error: "PaymentIntent missing user metadata"
		};
		let shippingAddress = {};
		try {
			shippingAddress = metadata.shipping_address ? JSON.parse(metadata.shipping_address) : {};
		} catch {
			shippingAddress = {};
		}
		let billingAddress;
		if (metadata.billing_address) try {
			billingAddress = JSON.parse(metadata.billing_address);
		} catch {}
		let items = [];
		try {
			if (metadata.validated_items) items = JSON.parse(metadata.validated_items);
		} catch {
			return {
				ok: false,
				error: "Invalid items metadata"
			};
		}
		if (items.length === 0) return {
			ok: false,
			error: "No items in PaymentIntent metadata"
		};
		const methodType = (pi.latest_charge?.payment_method_details)?.type ?? "card";
		return {
			ok: true,
			userId,
			email,
			subtotal,
			shippingAddress,
			billingAddress,
			items,
			paymentMethod: methodType,
			amount: pi.amount_received ?? 0,
			currency: pi.currency ?? "usd",
			checkoutRequestId: metadata.checkout_request_id || void 0
		};
	} catch (err) {
		return {
			ok: false,
			error: `Stripe verification failed: ${err instanceof Error ? err.message : "unknown error"}`
		};
	}
}
async function createOrderFromPaymentIntent(input) {
	const { paymentIntentId } = input;
	const { supabase, queue } = getContainer();
	logger.info("Creating order from PaymentIntent", { paymentIntentId });
	const verification = await verifyPaymentIntent(paymentIntentId);
	if (!verification.ok) {
		logger.warn("PaymentIntent verification failed", { error: verification.error });
		return {
			success: false,
			error: verification.error
		};
	}
	const { data: existingOrder } = await supabase.from("orders").select("id, order_number, status").eq("stripe_payment_intent_id", paymentIntentId).maybeSingle();
	if (existingOrder) {
		logger.info("Existing order found", { orderId: existingOrder.id });
		const { data: invoiceRecord } = await supabase.from("invoices").select("id, invoice_number").eq("order_id", existingOrder.id).maybeSingle();
		return {
			success: true,
			orderId: existingOrder.id,
			orderNumber: existingOrder.order_number ?? void 0,
			invoiceNumber: invoiceRecord?.invoice_number ?? void 0,
			invoiceId: invoiceRecord?.id ?? void 0
		};
	}
	const checkoutRequestId = verification.checkoutRequestId;
	if (checkoutRequestId) await supabase.from("payment_sessions").update({ status: "processing" }).eq("checkout_request_id", checkoutRequestId);
	const orderNumber = await nextOrderNumber();
	const invoiceNumber = await nextInvoiceNumber();
	const amount = verification.amount ? verification.amount / 100 : verification.subtotal ?? 0;
	const total = verification.subtotal ?? amount;
	const orderItems = (verification.items ?? []).map((item) => ({
		product_id: item.productId,
		variant_id: item.variantId ?? null,
		name: item.productName,
		price: item.unitPrice,
		quantity: item.quantity,
		image_url: item.imageUrl ?? null,
		size: item.size,
		attributes: JSON.stringify({ size: item.size })
	}));
	const shippingAddressJson = JSON.stringify(verification.shippingAddress ?? {});
	const billingAddressJson = verification.billingAddress ? JSON.stringify(verification.billingAddress) : shippingAddressJson;
	const { data: rpcResult, error: rpcError } = await supabase.rpc("create_order_from_payment", {
		p_user_id: verification.userId,
		p_order_number: orderNumber,
		p_subtotal: total,
		p_total: total,
		p_shipping_address: shippingAddressJson,
		p_billing_address: billingAddressJson,
		p_stripe_session_id: "",
		p_stripe_payment_intent_id: paymentIntentId,
		p_payment_method: verification.paymentMethod ?? "card",
		p_currency: verification.currency ?? "usd",
		p_amount: amount,
		p_invoice_number: invoiceNumber,
		p_items: JSON.stringify(orderItems),
		p_checkout_request_id: checkoutRequestId ?? null
	});
	if (rpcError) {
		logger.error("RPC create_order_from_payment failed", { error: rpcError.message });
		return {
			success: false,
			error: `Database error: ${rpcError.message}`
		};
	}
	const result = rpcResult;
	if (!result?.success) {
		logger.error("RPC returned failure", { error: result?.error });
		return {
			success: false,
			error: result?.error ?? "Failed to create order"
		};
	}
	const orderId = result.order_id;
	const outInvoiceNumber = result.invoice_number ?? invoiceNumber;
	const invoiceId = result.invoice_id ?? "";
	logger.info("Order created via RPC", {
		orderId,
		orderNumber,
		invoiceId
	});
	const shippingAddr = verification.shippingAddress ?? {};
	const billingAddr = verification.billingAddress ?? verification.shippingAddress ?? {};
	let customerProfile = null;
	try {
		const { data: profile } = await supabase.from("profiles").select("first_name, last_name, email, metadata").eq("id", verification.userId).maybeSingle();
		if (profile) customerProfile = {
			firstName: profile.first_name,
			lastName: profile.last_name,
			displayName: profile.metadata?.displayName || "",
			email: profile.email
		};
	} catch (err) {
		logger.warn("Failed to fetch customer profile for order email", { error: String(err) });
	}
	const orderDate = (/* @__PURE__ */ new Date()).toISOString();
	const emailPayload = buildEmailPayload({
		orderId,
		invoiceId,
		customerEmail: verification.email ?? "",
		customerProfile,
		phone: shippingAddr.phone ?? "",
		orderNumber,
		invoiceNumber: outInvoiceNumber,
		orderDate,
		billingAddress: billingAddr,
		shippingAddress: shippingAddr,
		items: (verification.items ?? []).map((i) => ({
			name: i.productName,
			imageUrl: i.imageUrl,
			size: i.size,
			quantity: i.quantity,
			unitPrice: i.unitPrice
		})),
		subtotal: total,
		shipping: 0,
		tax: 0,
		total,
		paymentMethod: verification.paymentMethod ?? "card",
		paymentStatus: "completed"
	});
	queue.enqueue(orderId, emailPayload).catch((err) => {
		logger.error("Job enqueue failed", {
			orderId,
			error: String(err)
		});
	});
	return {
		success: true,
		orderId,
		orderNumber: result.order_number,
		invoiceNumber: outInvoiceNumber,
		invoiceId
	};
}
async function createOrderFromPayPal(input) {
	const { supabase, queue } = getContainer();
	logger.info("Creating order from PayPal", { paypalOrderId: input.paypalOrderId });
	const { data: existingOrder } = await supabase.from("orders").select("id, order_number, status").eq("paypal_order_id", input.paypalOrderId).maybeSingle();
	if (existingOrder) {
		logger.info("Existing order found for PayPal", { orderId: existingOrder.id });
		const { data: invoiceRecord } = await supabase.from("invoices").select("id, invoice_number").eq("order_id", existingOrder.id).maybeSingle();
		return {
			success: true,
			orderId: existingOrder.id,
			orderNumber: existingOrder.order_number ?? void 0,
			invoiceNumber: invoiceRecord?.invoice_number ?? void 0,
			invoiceId: invoiceRecord?.id ?? void 0
		};
	}
	const orderNumber = await nextOrderNumber();
	const invoiceNumber = await nextInvoiceNumber();
	const total = input.total;
	const orderItems = input.items.map((item) => ({
		product_id: item.productId,
		variant_id: item.variantId ?? null,
		name: item.productName,
		price: item.unitPrice,
		quantity: item.quantity,
		image_url: item.imageUrl ?? null,
		size: item.size,
		attributes: JSON.stringify({ size: item.size })
	}));
	const shippingAddressJson = JSON.stringify(input.shippingAddress);
	const billingAddressJson = JSON.stringify(input.billingAddress);
	const { data: rpcResult, error: rpcError } = await supabase.rpc("create_order_from_payment", {
		p_user_id: input.userId,
		p_order_number: orderNumber,
		p_subtotal: total,
		p_total: total,
		p_shipping_address: shippingAddressJson,
		p_billing_address: billingAddressJson,
		p_stripe_session_id: "",
		p_stripe_payment_intent_id: `paypal_${input.paypalOrderId}`,
		p_payment_method: input.paymentMethod,
		p_currency: "usd",
		p_amount: total,
		p_invoice_number: invoiceNumber,
		p_items: JSON.stringify(orderItems),
		p_checkout_request_id: null
	});
	if (rpcError) {
		logger.error("RPC create_order_from_payment failed for PayPal", { error: rpcError.message });
		return {
			success: false,
			error: `Database error: ${rpcError.message}`
		};
	}
	const result = rpcResult;
	if (!result?.success) {
		logger.error("RPC returned failure for PayPal", { error: result?.error });
		return {
			success: false,
			error: result?.error ?? "Failed to create order"
		};
	}
	const orderId = result.order_id;
	const outInvoiceNumber = result.invoice_number ?? invoiceNumber;
	const invoiceId = result.invoice_id ?? "";
	logger.info("Order created via PayPal", {
		orderId,
		orderNumber,
		invoiceId
	});
	try {
		await supabase.from("orders").update({ paypal_order_id: input.paypalOrderId }).eq("id", orderId);
	} catch {}
	const shippingAddr = input.shippingAddress;
	const billingAddr = input.billingAddress;
	let customerProfile = null;
	try {
		const { data: profile } = await supabase.from("profiles").select("first_name, last_name, email, metadata").eq("id", input.userId).maybeSingle();
		if (profile) customerProfile = {
			firstName: profile.first_name,
			lastName: profile.last_name,
			displayName: profile.metadata?.displayName || "",
			email: profile.email
		};
	} catch (err) {
		logger.warn("Failed to fetch customer profile for order email", { error: String(err) });
	}
	const orderDate = (/* @__PURE__ */ new Date()).toISOString();
	const emailPayload = buildEmailPayload({
		orderId,
		invoiceId,
		customerEmail: input.email,
		customerProfile,
		phone: shippingAddr.phone ?? "",
		orderNumber,
		invoiceNumber: outInvoiceNumber,
		orderDate,
		billingAddress: billingAddr,
		shippingAddress: shippingAddr,
		items: input.items.map((i) => ({
			name: i.productName,
			imageUrl: i.imageUrl,
			size: i.size,
			quantity: i.quantity,
			unitPrice: i.unitPrice
		})),
		subtotal: total,
		shipping: 0,
		tax: 0,
		total,
		paymentMethod: input.paymentMethod,
		paymentStatus: "completed"
	});
	queue.enqueue(orderId, emailPayload).catch((err) => {
		logger.error("Job enqueue failed", {
			orderId,
			error: String(err)
		});
	});
	return {
		success: true,
		orderId,
		orderNumber: result.order_number,
		invoiceNumber: outInvoiceNumber,
		invoiceId
	};
}
//#endregion
export { createOrderFromPayPal, createOrderFromPaymentIntent };
