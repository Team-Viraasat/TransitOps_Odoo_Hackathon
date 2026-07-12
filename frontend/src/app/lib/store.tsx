import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  User,
  RoleName,
  Vehicle,
  Driver,
  Trip,
  MaintenanceLog,
  FuelLog,
  Expense,
  Settings,
  DriverStatus,
} from "./types";
import { api } from "./api";

interface StoreState {
  currentUser: User | null;
  users: User[];
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceLog[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  settings: Settings;
  loading: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  addVehicle: (v: Omit<Vehicle, "id" | "status">) => void;
  updateVehicle: (id: string, v: Partial<Vehicle>) => void;
  retireVehicle: (id: string) => void;

  addDriver: (d: Omit<Driver, "id" | "status">) => void;
  updateDriver: (id: string, d: Partial<Driver>) => void;
  setDriverStatus: (id: string, status: DriverStatus) => void;

  addTrip: (t: {
    source: string;
    destination: string;
    vehicleId: string | null;
    driverId: string | null;
    cargoWeightKg: number;
    plannedDistanceKm: number;
    revenue: number;
  }) => void;
  dispatchTrip: (id: string) => void;
  completeTrip: (id: string, data: { finalOdometerKm: number; actualDistanceKm: number; fuelConsumedLiters: number; revenue: number }) => void;
  cancelTrip: (id: string, reason: string) => void;

  addMaintenance: (m: { vehicleId: string; serviceType: string; description: string; cost: number }) => void;
  closeMaintenance: (id: string) => void;

  addFuelLog: (f: Omit<FuelLog, "id">) => void;
  addExpense: (e: Omit<Expense, "id">) => void;

  theme: "light" | "dark";
  toggleTheme: () => void;
  updateSettings: (s: Partial<Settings>) => void;
}

const StoreContext = createContext<StoreState | null>(null);
const ALLOWED_USER_ROLES: ReadonlySet<RoleName> = new Set([
  "Fleet Manager",
  "Dispatcher",
  "Safety Officer",
  "Financial Analyst",
  "Admin",
]);
const ALLOWED_USER_STATUSES: ReadonlySet<User["status"]> = new Set([
  "Active",
  "Locked",
  "Disabled",
]);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<Settings>({ depotName: "TransitOps", currency: "INR", distanceUnit: "km" });
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const local = localStorage.getItem("theme");
    if (local === "light" || local === "dark") return local;
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Map API user response to our User type
  const mapUser = (u: { id: string; name: string; email: string; role: string; status: string }): User => {
    if (!ALLOWED_USER_ROLES.has(u.role as RoleName) || !ALLOWED_USER_STATUSES.has(u.status as User["status"])) {
      throw new Error("Invalid user role or status received from server.");
    }
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as User["role"],
      status: u.status as User["status"],
    };
  };

  // Fetch all data from API
  const fetchAll = useCallback(async () => {
    try {
      const [vRes, dRes, tRes, mRes, flRes, exRes, sRes] = await Promise.all([
        api.vehicles.list(),
        api.drivers.list(),
        api.trips.list(),
        api.maintenance.list(),
        api.fuel.list(),
        api.expenses.list(),
        api.settings.get(),
      ]);
      setVehicles(vRes.items);
      setDrivers(dRes.items);
      setTrips(tRes.items);
      setMaintenance(mRes.items);
      setFuelLogs(flRes.items);
      setExpenses(exRes.items);
      setSettings(sRes.settings);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    api.auth.me()
      .then(({ user }) => {
        setCurrentUser(mapUser(user));
        return fetchAll();
      })
      .catch(() => {
        setCurrentUser(null);
        api.auth.logout();
      })
      .finally(() => setLoading(false));
  }, [fetchAll]);

  const storeApi = useMemo<StoreState>(() => {
    const refetchVehicles = () => api.vehicles.list().then((r) => setVehicles(r.items)).catch(() => {});
    const refetchDrivers = () => api.drivers.list().then((r) => setDrivers(r.items)).catch(() => {});
    const refetchTrips = () => api.trips.list().then((r) => setTrips(r.items)).catch(() => {});
    const refetchMaintenance = () => api.maintenance.list().then((r) => setMaintenance(r.items)).catch(() => {});
    const refetchFuelLogs = () => api.fuel.list().then((r) => setFuelLogs(r.items)).catch(() => {});
    const refetchExpenses = () => api.expenses.list().then((r) => setExpenses(r.items)).catch(() => {});

    return {
      currentUser,
      users: [],
      vehicles,
      drivers,
      trips,
      maintenance,
      fuelLogs,
      expenses,
      settings,
      loading,
      theme,
      toggleTheme,

      login: async (email, password) => {
        try {
          const { user } = await api.auth.login(email, password);
          const mappedUser = mapUser(user);
          setCurrentUser(mappedUser);
          toast.success(`Welcome back, ${mappedUser.name}`);
          await fetchAll();
          return true;
        } catch (err: any) {
          setCurrentUser(null);
          await api.auth.logout();
          toast.error(err?.message || "Invalid credentials");
          return false;
        }
      },

      logout: () => {
        api.auth.logout().then(() => {
          setCurrentUser(null);
          toast.success("Logged out");
        });
      },

      // ── Vehicles ────────────────────────────────
      addVehicle: (v) => {
        api.vehicles.create(v)
          .then(() => { toast.success("Vehicle added to registry."); refetchVehicles(); })
          .catch((err) => toast.error(err.message));
      },
      updateVehicle: (id, patch) => {
        api.vehicles.update(id, patch)
          .then(() => { toast.success("Vehicle updated."); refetchVehicles(); })
          .catch((err) => toast.error(err.message));
      },
      retireVehicle: (id) => {
        api.vehicles.retire(id)
          .then(() => { toast.success("Vehicle retired."); refetchVehicles(); })
          .catch((err) => toast.error(err.message));
      },

      // ── Drivers ─────────────────────────────────
      addDriver: (d) => {
        api.drivers.create(d)
          .then(() => { toast.success("Driver profile created."); refetchDrivers(); })
          .catch((err) => toast.error(err.message));
      },
      updateDriver: (id, patch) => {
        api.drivers.update(id, patch)
          .then(() => { toast.success("Driver updated."); refetchDrivers(); })
          .catch((err) => toast.error(err.message));
      },
      setDriverStatus: (id, status) => {
        api.drivers.setStatus(id, status)
          .then(() => { toast.success(`Driver set to ${status}.`); refetchDrivers(); })
          .catch((err) => toast.error(err.message));
      },

      // ── Trips ───────────────────────────────────
      addTrip: (t) => {
        api.trips.create(t)
          .then(() => { toast.success("Draft trip created."); refetchTrips(); })
          .catch((err) => toast.error(err.message));
      },
      dispatchTrip: (id) => {
        api.trips.dispatch(id)
          .then(() => {
            toast.success("Trip dispatched. Vehicle and driver marked On Trip.");
            refetchTrips();
            refetchVehicles();
            refetchDrivers();
          })
          .catch((err) => toast.error(err.message));
      },
      completeTrip: (id, data) => {
        api.trips.complete(id, data)
          .then(() => {
            toast.success("Trip completed. Vehicle and driver restored to Available.");
            refetchTrips();
            refetchVehicles();
            refetchDrivers();
            refetchFuelLogs();
          })
          .catch((err) => toast.error(err.message));
      },
      cancelTrip: (id, reason) => {
        api.trips.cancel(id, reason)
          .then(() => {
            toast.success("Trip cancelled. Resources restored.");
            refetchTrips();
            refetchVehicles();
            refetchDrivers();
          })
          .catch((err) => toast.error(err.message));
      },

      // ── Maintenance ─────────────────────────────
      addMaintenance: (m) => {
        api.maintenance.create({ ...m, startDate: new Date().toISOString().slice(0, 10) })
          .then(() => {
            toast.success("Maintenance started. Vehicle moved to In Shop.");
            refetchMaintenance();
            refetchVehicles();
          })
          .catch((err) => toast.error(err.message));
      },
      closeMaintenance: (id) => {
        api.maintenance.close(id)
          .then(() => {
            toast.success("Maintenance closed.");
            refetchMaintenance();
            refetchVehicles();
          })
          .catch((err) => toast.error(err.message));
      },

      // ── Fuel & Expenses ─────────────────────────
      addFuelLog: (f) => {
        api.fuel.create(f)
          .then(() => { toast.success("Fuel log recorded."); refetchFuelLogs(); })
          .catch((err) => toast.error(err.message));
      },
      addExpense: (e) => {
        api.expenses.create(e)
          .then(() => { toast.success("Expense recorded."); refetchExpenses(); })
          .catch((err) => toast.error(err.message));
      },

      // ── Settings ────────────────────────────────
      updateSettings: (s) => {
        api.settings.update(s)
          .then((res) => {
            setSettings(res.settings);
            toast.success("Settings saved.");
          })
          .catch((err) => toast.error(err.message));
      },
    };
  }, [currentUser, vehicles, drivers, trips, maintenance, fuelLogs, expenses, settings, loading, theme, fetchAll]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-to-bg text-to-text">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-2 border-to-orange border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-to-muted">Loading TransitOps...</p>
        </div>
      </div>
    );
  }

  return <StoreContext.Provider value={storeApi}>{children}</StoreContext.Provider>;
}
