import { BACKEND_URL } from "@config";
import { getSession } from "@utils/session";

export const CHECKOUT_TOKEN_KEY = "farmora-checkout-token";

export type CheckoutOrder = {
  id: string;
  request_id: string;
  status: "pending" | "completed";
  checkout_required: boolean;
  subscription_id: number | null;
  package_id: number;
  package_name: string;
  amount: number;
  currency: string;
  razorpay_order_id: string | null;
  key_id: string | null;
  customer: { name: string; email: string; contact: string };
};

export type CheckoutSession = {
  active: boolean;
  kind: "initial" | "renewal";
  request_id: string;
  order: CheckoutOrder | null;
  packages: {
    id: number;
    name: string;
    actual_price: string;
    discount_price: string;
    duration: number;
  }[];
};

export const checkoutRequest = async <T>(
  path: string,
  payload?: unknown,
): Promise<T> => {
  const response = await fetch(new URL(`/api/checkout/${path}`, BACKEND_URL), {
    method: payload === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getSession().token || sessionStorage.getItem(CHECKOUT_TOKEN_KEY) || ""}`,
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok)
    throw Object.assign(
      new Error(json.error?.message || "Unable to complete checkout"),
      { code: json.error?.code, details: json.error?.details },
    );
  return json.data;
};

type PaymentResult = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
type RazorpayInstance = { open(): void };
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: CheckoutOrder["customer"];
  handler: (result: PaymentResult) => void;
  modal: { ondismiss: () => void };
};
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let loading: Promise<void> | null = null;
const loadCheckout = () => {
  if (window.Razorpay) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    const timeout = window.setTimeout(() => fail(), 15000);
    const fail = () => {
      window.clearTimeout(timeout);
      script.remove();
      loading = null;
      reject(new Error("Unable to load secure checkout. Please retry."));
    };
    script.onload = () => {
      window.clearTimeout(timeout);
      if (window.Razorpay) resolve();
      else fail();
    };
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return loading;
};

export const openCheckout = async (
  order: CheckoutOrder,
): Promise<CheckoutOrder> => {
  if (!order.checkout_required) return order;
  const current = await checkoutRequest<CheckoutOrder>(`orders/${order.id}`);
  if (current.status === "completed") return current;
  if (!order.key_id || !order.razorpay_order_id)
    throw new Error("Payment checkout is not ready. Please retry.");
  await loadCheckout();
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay!({
      key: order.key_id!,
      amount: order.amount,
      currency: order.currency,
      order_id: order.razorpay_order_id!,
      name: "Farmora",
      description: order.package_name,
      prefill: order.customer,
      handler: (result) => {
        checkoutRequest<CheckoutOrder>(
          `orders/${order.id}/verify`,
          result,
        ).then(resolve, reject);
      },
      modal: {
        ondismiss: () => {
          checkoutRequest<CheckoutOrder>(`orders/${order.id}`).then(
            (result) => {
              if (result.status === "completed") resolve(result);
              else
                reject(
                  new Error(
                    "Payment was not completed. Your account is saved; you can retry.",
                  ),
                );
            },
            reject,
          );
        },
      },
    });
    checkout.open();
  });
};

export const purchasePackage = async (payload: {
  package_id: number;
  kind: "initial" | "renewal";
  user_id?: number;
  referral_partner_id?: number | null;
}) => {
  // Reuse the request ID after refresh, cancellation, or a lost response.
  const key = `farmora-purchase:${JSON.stringify(payload)}`;
  const request_id = sessionStorage.getItem(key) || crypto.randomUUID();
  sessionStorage.setItem(key, request_id);
  let order: CheckoutOrder;
  try {
    order = await checkoutRequest<CheckoutOrder>("orders", {
      ...payload,
      request_id,
    });
  } catch (error) {
    const pending = error as {
      code?: string;
      details?: { request_id?: string };
    };
    if (pending.code !== "CHECKOUT_PENDING" || !pending.details?.request_id)
      throw error;
    sessionStorage.setItem(key, pending.details.request_id);
    order = await checkoutRequest<CheckoutOrder>("orders", {
      ...payload,
      request_id: pending.details.request_id,
    });
  }
  sessionStorage.setItem(key, order.request_id);
  const result = await openCheckout(order);
  sessionStorage.removeItem(key);
  return result;
};
