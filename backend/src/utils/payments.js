import crypto from "crypto";

/*
|--------------------------------------------------------------------------
| Payment providers
|--------------------------------------------------------------------------
| Supported: MOCK, CARD (saved method), COD, ESEWA, KHALTI.
|
| MOCK / CARD  → settle instantly (payment COMPLETED, order PROCESSING).
| COD          → settle on delivery (payment PENDING until the order is delivered).
| ESEWA/KHALTI → return a redirect payload; the client sends the user to the
|                gateway, which calls back; the app confirms via /payments/verify.
|
| eSewa v2 and Khalti ePayment credentials come from env. Without them the
| gateways run in a "sandbox" mode that auto-approves on verify so the flow is
| testable end-to-end locally.
*/

const APP_URL = (process.env.APP_URL || "http://localhost:5173").replace(/\/$/, "");

export const PROVIDERS = ["MOCK", "CARD", "COD", "ESEWA", "KHALTI"];

export const isInstant = (provider) => provider === "MOCK" || provider === "CARD";
export const isDeferred = (provider) => provider === "COD";
export const isRedirect = (provider) => provider === "ESEWA" || provider === "KHALTI";

const esewaConfigured = () => Boolean(process.env.ESEWA_SECRET_KEY && process.env.ESEWA_PRODUCT_CODE);
const khaltiConfigured = () => Boolean(process.env.KHALTI_SECRET_KEY);

// ── eSewa v2 signature ───────────────────────────────────────────────────────
const esewaSignature = (payload, secret) => {
  const message = `total_amount=${payload.total_amount},transaction_uuid=${payload.transaction_uuid},product_code=${payload.product_code}`;
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
};

/**
 * Build the initiation payload the client needs to start a redirect payment.
 * Returns { redirect: { method, url, fields } } or throws.
 */
export const buildRedirectPayload = ({ provider, order, amount }) => {
  const uuid = `${order.orderNumber}`;
  const successUrl = `${APP_URL}/order-confirmation?orderId=${order.id}&provider=${provider}`;
  const failureUrl = `${APP_URL}/checkout?payment=failed&orderId=${order.id}`;

  if (provider === "ESEWA") {
    const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
    const secret = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
    const fields = {
      amount: String(amount),
      tax_amount: "0",
      total_amount: String(amount),
      transaction_uuid: uuid,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };
    fields.signature = esewaSignature(fields, secret);
    return {
      redirect: {
        method: "POST",
        url: esewaConfigured()
          ? "https://epay.esewa.com.np/api/epay/main/v2/form"
          : "https://rc-epay.esewa.com.np/api/epay/main/v2/form", // sandbox
        fields,
      },
      sandbox: !esewaConfigured(),
    };
  }

  if (provider === "KHALTI") {
    // The real flow POSTs to Khalti from the server; here we hand the client the
    // config it needs (or, in sandbox, a direct confirm URL).
    return {
      redirect: {
        method: "GET",
        url: khaltiConfigured()
          ? "https://khalti.com/api/v2/epayment/initiate/"
          : `${APP_URL}/order-confirmation?orderId=${order.id}&provider=KHALTI&sandbox=1`,
        fields: {
          return_url: successUrl,
          amount: Math.round(amount * 100), // paisa
          purchase_order_id: order.id,
          purchase_order_name: order.orderNumber,
        },
      },
      sandbox: !khaltiConfigured(),
    };
  }

  throw new Error(`Unsupported redirect provider: ${provider}`);
};

/**
 * Verify a redirect payment after the gateway callback.
 * `ref` is the token/refId the gateway returned. Returns { ok, transactionId }.
 * In sandbox mode (no keys) it approves any non-empty ref, or a ref of "sandbox".
 */
export const verifyRedirectPayment = async ({ provider, amount, ref }) => {
  if (provider === "ESEWA") {
    if (!esewaConfigured()) {
      return { ok: Boolean(ref), transactionId: ref || `ESEWA_SANDBOX_${Date.now()}` };
    }
    try {
      const url = `https://epay.esewa.com.np/api/epay/transaction/status/?product_code=${process.env.ESEWA_PRODUCT_CODE}&total_amount=${amount}&transaction_uuid=${ref}`;
      const res = await fetch(url);
      const data = await res.json();
      return { ok: data.status === "COMPLETE", transactionId: data.ref_id || ref };
    } catch (err) {
      console.error("eSewa verify failed:", err.message);
      return { ok: false };
    }
  }

  if (provider === "KHALTI") {
    if (!khaltiConfigured()) {
      return { ok: Boolean(ref), transactionId: ref || `KHALTI_SANDBOX_${Date.now()}` };
    }
    try {
      const res = await fetch("https://khalti.com/api/v2/epayment/lookup/", {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pidx: ref }),
      });
      const data = await res.json();
      return { ok: data.status === "Completed", transactionId: data.transaction_id || ref };
    } catch (err) {
      console.error("Khalti verify failed:", err.message);
      return { ok: false };
    }
  }

  return { ok: false };
};
