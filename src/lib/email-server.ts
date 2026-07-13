// =============================================
// SERVER-SIDE EMAIL HELPER
// EmailJS REST API — safe to call from Next.js Route Handlers (server-side).
// The @emailjs/browser package uses XMLHttpRequest which is browser-only.
// This uses the official EmailJS REST endpoint instead.
// =============================================

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_rjysbwg";
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "mJfuz0ZKGAq69Jzcw";
const TEMPLATE_ORDER_CONFIRM = process.env.EMAILJS_TEMPLATE_BUY || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_BUY || "template_yd1azyl";
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

export async function sendOrderConfirmationEmailServer(params: {
  buyer_name: string;
  email: string;
  order_id: string;
  product_name: string;
  product_emoji: string;
  subtotal: string;
  discount: string;
  amount: string;
  coupon_code: string;
  edit_link: string;
}): Promise<boolean> {
  try {
    const payload = {
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ORDER_CONFIRM,
      user_id: PUBLIC_KEY,
      ...(PRIVATE_KEY ? { accessToken: PRIVATE_KEY } : {}),
      template_params: {
        buyer_name: params.buyer_name,
        email: params.email,
        to_email: params.email,
        reply_to: params.email,
        order_id: params.order_id,
        product_name: params.product_name,
        product_emoji: params.product_emoji,
        subtotal: params.subtotal,
        discount: params.discount,
        amount: params.amount,
        coupon_code: params.coupon_code,
        edit_link: params.edit_link,
      },
    };

    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log("✅ [server-email] Order confirmation sent to", params.email);
      return true;
    } else {
      const errText = await res.text();
      console.error("❌ [server-email] EmailJS error:", errText);
      return false;
    }
  } catch (err) {
    console.error("❌ [server-email] Failed to send email:", err);
    return false;
  }
}
