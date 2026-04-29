import { supabase } from "@/lib/supabase";

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export type InitiatePaymentResponse = {
  checkout_url: string;
};

export type VerifyPaymentResponse = {
  status: "pending" | "verified" | "failed" | "cancelled";
};

export type OrderStatusResponse = {
  order_status: string;
  payment_status: "pending" | "verified" | "failed" | "cancelled";
};

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("Not authenticated");
  }
  return data.session.access_token;
}

async function request<T>(path: string, init: RequestInit & { auth?: boolean } = { auth: true }): Promise<T> {
  const url = `${backendBaseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");

  if (init.auth !== false) {
    const token = await getAccessToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Add timeout to prevent hanging connections
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const res = await fetch(url, { ...init, headers, signal: controller.signal });

    let body: any = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    if (!res.ok) {
      const message = body?.detail || `Request failed with status ${res.status}`;
      throw new Error(message);
    }

    return body as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Chapa ─────────────────────────────────────────────────────────────────────

export async function initiatePayment(order_id: string): Promise<InitiatePaymentResponse> {
  return request<InitiatePaymentResponse>("/api/payments/chapa/initiate/", {
    method: "POST",
    body: JSON.stringify({ order_id }),
  });
}

export async function verifyPayment(tx_ref: string): Promise<VerifyPaymentResponse> {
  return request<VerifyPaymentResponse>("/api/payments/chapa/verify/", {
    method: "POST",
    body: JSON.stringify({ tx_ref }),
  });
}

// ── Telebirr C2B ──────────────────────────────────────────────────────────────

export async function initiateTelebirrPayment(order_id: string): Promise<InitiatePaymentResponse> {
  return request<InitiatePaymentResponse>("/api/payments/telebirr/initiate/", {
    method: "POST",
    body: JSON.stringify({ order_id }),
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrderStatus(order_id: string): Promise<OrderStatusResponse> {
  return request<OrderStatusResponse>(`/api/orders/${order_id}/status/`, {
    method: "GET",
  });
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export type NewsletterSubscribeResponse = {
  success: boolean;
  message: string;
  email: string;
  reactivated?: boolean;
};

export async function subscribeNewsletter(email: string, source: string = 'homepage'): Promise<NewsletterSubscribeResponse> {
  return request<NewsletterSubscribeResponse>("/api/newsletter/subscribe/", {
    method: "POST",
    body: JSON.stringify({ email, source }),
    auth: false, // Public endpoint
  });
}
