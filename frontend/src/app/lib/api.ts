declare global {
  interface Window {
    __TRANSITOPS_API_BASE_URL__?: string;
  }
}

const RUNTIME_BASE = typeof window !== "undefined" ? window.__TRANSITOPS_API_BASE_URL__ : undefined;
const ENV_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
const BASE = (RUNTIME_BASE || ENV_BASE || "http://localhost:4000").replace(/\/+$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || body.message || res.statusText);
  }
  if (res.status === 204 || res.status === 205) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("text/csv")) {
    return (await res.text()) as unknown as T;
  }
  if (contentType.includes("application/json") || contentType.includes("+json")) {
    return res.json();
  }

  const body = await res.text();
  return (body.length ? body : undefined) as T;
}

// ── Auth ──────────────────────────────────────────
export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: { id: string; name: string; email: string; role: string; status: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    logout: () => request<void>("/api/auth/logout", { method: "POST" }).catch(() => {}),
    me: () =>
      request<{ user: { id: string; name: string; email: string; role: string; status: string } }>("/api/auth/me"),
  },

  // ── Dashboard ────────────────────────────────────
  dashboard: {
    kpis: () => request<Record<string, number>>("/api/dashboard/kpis"),
    recentTrips: () => request<any[]>("/api/dashboard/recent-trips"),
    vehicleStatusBreakdown: () => request<{ status: string; count: number }[]>("/api/dashboard/vehicle-status-breakdown"),
  },

  // ── Vehicles ─────────────────────────────────────
  vehicles: {
    list: () => request<{ items: any[] }>("/api/vehicles?page=1"),
    availableForDispatch: () => request<{ items: any[] }>("/api/vehicles/available-for-dispatch"),
    get: (id: string) => request<any>(`/api/vehicles/${id}`),
    create: (data: any) => request<{ item: any }>("/api/vehicles", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<{ item: any }>(`/api/vehicles/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    retire: (id: string) => request<{ item: any }>(`/api/vehicles/${id}/retire`, { method: "PATCH" }),
  },

  // ── Drivers ──────────────────────────────────────
  drivers: {
    list: () => request<{ items: any[] }>("/api/drivers?page=1"),
    availableForDispatch: () => request<{ items: any[] }>("/api/drivers/available-for-dispatch"),
    get: (id: string) => request<any>(`/api/drivers/${id}`),
    create: (data: any) => request<{ item: any }>("/api/drivers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<{ item: any }>(`/api/drivers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    setStatus: (id: string, status: string) =>
      request<{ item: any }>(`/api/drivers/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  },

  // ── Trips ────────────────────────────────────────
  trips: {
    list: () => request<{ items: any[] }>("/api/trips?page=1"),
    get: (id: string) => request<any>(`/api/trips/${id}`),
    create: (data: any) => request<{ item: any }>("/api/trips", { method: "POST", body: JSON.stringify(data) }),
    dispatch: (id: string) => request<{ item: any }>(`/api/trips/${id}/dispatch`, { method: "POST" }),
    complete: (id: string, data: any) =>
      request<{ item: any }>(`/api/trips/${id}/complete`, { method: "POST", body: JSON.stringify(data) }),
    cancel: (id: string, reason: string) =>
      request<{ item: any }>(`/api/trips/${id}/cancel`, { method: "POST", body: JSON.stringify({ reason }) }),
  },

  // ── Maintenance ──────────────────────────────────
  maintenance: {
    list: () => request<{ items: any[] }>("/api/maintenance?page=1"),
    create: (data: any) =>
      request<{ item: any }>("/api/maintenance", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<{ item: any }>(`/api/maintenance/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    close: (id: string) => request<{ item: any }>(`/api/maintenance/${id}/close`, { method: "POST" }),
  },

  // ── Fuel Logs ────────────────────────────────────
  fuel: {
    list: () => request<{ items: any[] }>("/api/fuel-logs?page=1"),
    create: (data: any) =>
      request<{ item: any }>("/api/fuel-logs", { method: "POST", body: JSON.stringify(data) }),
  },

  // ── Expenses ─────────────────────────────────────
  expenses: {
    list: () => request<{ items: any[] }>("/api/expenses?page=1"),
    create: (data: any) =>
      request<{ item: any }>("/api/expenses", { method: "POST", body: JSON.stringify(data) }),
  },

  // ── Analytics ────────────────────────────────────
  analytics: {
    summary: () => request<any>("/api/analytics/summary"),
    fuelEfficiency: () => request<any[]>("/api/analytics/fuel-efficiency"),
    fleetUtilization: () => request<{ status: string; count: number }[]>("/api/analytics/fleet-utilization"),
    operationalCost: () => request<{ fuel: number; maintenance: number; otherExpenses: number }>("/api/analytics/operational-cost"),
    vehicleRoi: () => request<any[]>("/api/analytics/vehicle-roi"),
    exportCsv: () => request<string>("/api/analytics/export.csv"),
  },

  // ── Settings ─────────────────────────────────────
  settings: {
    get: () => request<{ settings: any; roles: any[] }>("/api/settings"),
    update: (data: any) =>
      request<{ settings: any }>("/api/settings", { method: "PATCH", body: JSON.stringify(data) }),
  },
};
