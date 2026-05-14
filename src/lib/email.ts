import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_rjysbwg";
const PUBLIC_KEY = "mJfuz0ZKGAq69Jzcw";

// Template IDs
const TEMPLATE_ORDER_CONFIRM = "template_yd1azyl";
const TEMPLATE_FINALIZE = "template_15dylig";

// Initialize EmailJS once
let initialized = false;
function initEmailJS() {
  if (!initialized) {
    emailjs.init(PUBLIC_KEY);
    initialized = true;
  }
}

export async function sendOrderConfirmationEmail(params: {
  buyer_name: string;
  email: string;
  order_id: string;
  product_name: string;
  product_emoji: string;
  amount: string;
  edit_link: string;
}) {
  try {
    initEmailJS();
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ORDER_CONFIRM, {
      buyer_name: params.buyer_name,
      email: params.email,
      to_email: params.email,
      reply_to: params.email,
      order_id: params.order_id,
      product_name: params.product_name,
      product_emoji: params.product_emoji,
      amount: params.amount,
      edit_link: params.edit_link,
    });
    console.log("✅ Order confirmation email sent to", params.email, "Status:", result.status, result.text);
    return true;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "text" in err) {
      console.error("❌ EmailJS error:", (err as { text: string }).text);
    } else {
      console.error("❌ Failed to send email:", String(err));
    }
    return false;
  }
}

export async function sendFinalizationEmail(params: {
  buyer_name: string;
  email: string;
  order_id: string;
  product_name: string;
  product_emoji: string;
  view_link: string;
}) {
  try {
    initEmailJS();
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_FINALIZE, {
      buyer_name: params.buyer_name,
      email: params.email,
      to_email: params.email,
      reply_to: params.email,
      order_id: params.order_id,
      product_name: params.product_name,
      product_emoji: params.product_emoji,
      view_link: params.view_link,
    });
    console.log("✅ Finalization email sent to", params.email, "Status:", result.status, result.text);
    return true;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "text" in err) {
      console.error("❌ EmailJS error:", (err as { text: string }).text);
    } else {
      console.error("❌ Failed to send finalization email:", String(err));
    }
    return false;
  }
}
