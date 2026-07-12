import React, { createContext, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  User,
  Vehicle,
  Driver,
  Trip,
  MaintenanceLog,
  FuelLog,
  Expense,
  Settings,
  VehicleStatus,
  DriverStatus,
} from "./types";
import {
  seedUsers,
  seedVehicles,
  seedDrivers,
  seedTrips,
  seedMaintenance,
  seedFuelLogs,
  seedExpenses,
  seedSettings,
} from "./seed";

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

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

  login: (email: string, password: string) => boolean;
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

  updateSettings: (s: Partial<Settings>) => void;
}

const StoreContext = createContext<StoreState | null>(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>(seedUsers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [drivers, setDrivers] = useState<Driver[]>(seedDrivers);
  const [trips, setTrips] = useState<Trip[]>(seedTrips);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>(seedMaintenance);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(seedFuelLogs);
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [settings, setSettings] = useState<Settings>(seedSettings);
  const [tripCounter, setTripCounter] = useState(1005);

  const setVehicleStatus = (id: string, status: VehicleStatus) =>
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
  const setDriverStatusInternal = (id: string, status: DriverStatus) =>
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));

  const api = useMemo<StoreState>(() => {
    return {
      currentUser,
      users,
      vehicles,
      drivers,
      trips,
      maintenance,
      fuelLogs,
      expenses,
      settings,

      login: (email, password) => {
        const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
        if (!u || u.password !== password) {
          toast.error("Invalid credentials. Please try again.");
          return false;
        }
        setCurrentUser(u);
        toast.success(`Welcome back, ${u.name}`);
        return true;
      },
      logout: () => setCurrentUser(null),

      addVehicle: (v) => {
        const reg = v.registrationNumber.trim().toUpperCase();
        if (vehicles.some((x) => x.registrationNumber === reg)) {
          toast.error("Registration number must be unique.");
          return;
        }
        setVehicles((prev) => [{ ...v, registrationNumber: reg, id: uid(), status: "Available" }, ...prev]);
        toast.success("Vehicle added to registry.");
      },
      updateVehicle: (id, patch) => {
        setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
        toast.success("Vehicle updated.");
      },
      retireVehicle: (id) => {
        const v = vehicles.find((x) => x.id === id);
        if (!v) return;
        if (v.status === "On Trip") {
          toast.error("Cannot retire a vehicle that is On Trip.");
          return;
        }
        setVehicleStatus(id, "Retired");
        toast.success(`${v.registrationNumber} retired.`);
      },

      addDriver: (d) => {
        const lic = d.licenseNumber.trim().toUpperCase();
        if (drivers.some((x) => x.licenseNumber === lic)) {
          toast.error("License number must be unique.");
          return;
        }
        setDrivers((prev) => [{ ...d, licenseNumber: lic, id: uid(), status: "Available" }, ...prev]);
        toast.success("Driver profile created.");
      },
      updateDriver: (id, patch) => {
        setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
        toast.success("Driver updated.");
      },
      setDriverStatus: (id, status) => {
        const d = drivers.find((x) => x.id === id);
        if (!d) return;
        if (d.status === "On Trip") {
          toast.error("Driver is On Trip. Close the trip first.");
          return;
        }
        setDriverStatusInternal(id, status);
        toast.success(`${d.name} set to ${status}.`);
      },

      addTrip: (t) => {
        if (t.source.trim().toLowerCase() === t.destination.trim().toLowerCase()) {
          toast.error("Source and destination cannot be identical.");
          return;
        }
        if (t.cargoWeightKg <= 0 || t.plannedDistanceKm <= 0) {
          toast.error("Cargo weight and distance must be positive.");
          return;
        }
        const code = `TRP-${tripCounter}`;
        setTripCounter((c) => c + 1);
        setTrips((prev) => [
          {
            id: uid(),
            tripCode: code,
            source: t.source.trim(),
            destination: t.destination.trim(),
            vehicleId: t.vehicleId,
            driverId: t.driverId,
            cargoWeightKg: t.cargoWeightKg,
            plannedDistanceKm: t.plannedDistanceKm,
            actualDistanceKm: null,
            startOdometerKm: null,
            finalOdometerKm: null,
            fuelConsumedLiters: null,
            revenue: t.revenue,
            status: "Draft",
            createdAt: today(),
          },
          ...prev,
        ]);
        toast.success(`Draft trip ${code} created.`);
      },

      dispatchTrip: (id) => {
        const trip = trips.find((t) => t.id === id);
        if (!trip) return;
        if (trip.status !== "Draft") {
          toast.error("Only Draft trips can be dispatched.");
          return;
        }
        const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
        const driver = drivers.find((d) => d.id === trip.driverId);
        if (!vehicle || !driver) {
          toast.error("Assign an available vehicle and driver first.");
          return;
        }
        if (vehicle.status !== "Available") {
          toast.error(`Vehicle ${vehicle.registrationNumber} is ${vehicle.status}.`);
          return;
        }
        if (driver.status !== "Available") {
          toast.error(`Driver ${driver.name} is ${driver.status}.`);
          return;
        }
        if (new Date(driver.licenseExpiryDate) < new Date(today())) {
          toast.error(`Driver ${driver.name} has an expired license.`);
          return;
        }
        if (trip.cargoWeightKg > vehicle.maxLoadKg) {
          toast.error(`Cargo ${trip.cargoWeightKg}kg exceeds capacity ${vehicle.maxLoadKg}kg.`);
          return;
        }
        // transaction
        setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Dispatched", startOdometerKm: vehicle.odometerKm } : t)));
        setVehicleStatus(vehicle.id, "On Trip");
        setDriverStatusInternal(driver.id, "On Trip");
        toast.success("Trip dispatched. Vehicle and driver marked On Trip.");
      },

      completeTrip: (id, data) => {
        const trip = trips.find((t) => t.id === id);
        if (!trip || trip.status !== "Dispatched") {
          toast.error("Only dispatched trips can be completed.");
          return;
        }
        setTrips((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "Completed",
                  finalOdometerKm: data.finalOdometerKm,
                  actualDistanceKm: data.actualDistanceKm,
                  fuelConsumedLiters: data.fuelConsumedLiters,
                  revenue: data.revenue,
                }
              : t
          )
        );
        if (trip.vehicleId) {
          setVehicles((prev) =>
            prev.map((v) => (v.id === trip.vehicleId ? { ...v, status: "Available", odometerKm: data.finalOdometerKm } : v))
          );
        }
        if (trip.driverId) setDriverStatusInternal(trip.driverId, "Available");
        if (trip.vehicleId && data.fuelConsumedLiters > 0) {
          setFuelLogs((prev) => [
            { id: uid(), vehicleId: trip.vehicleId!, tripId: trip.id, liters: data.fuelConsumedLiters, cost: Math.round(data.fuelConsumedLiters * 95), logDate: today(), odometerKm: data.finalOdometerKm },
            ...prev,
          ]);
        }
        toast.success("Trip completed. Vehicle and driver restored to Available.");
      },

      cancelTrip: (id, reason) => {
        const trip = trips.find((t) => t.id === id);
        if (!trip || (trip.status !== "Draft" && trip.status !== "Dispatched")) {
          toast.error("Only Draft or Dispatched trips can be cancelled.");
          return;
        }
        setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Cancelled", cancelReason: reason } : t)));
        if (trip.status === "Dispatched") {
          if (trip.vehicleId) setVehicleStatus(trip.vehicleId, "Available");
          if (trip.driverId) setDriverStatusInternal(trip.driverId, "Available");
        }
        toast.success("Trip cancelled. Resources restored.");
      },

      addMaintenance: (m) => {
        const v = vehicles.find((x) => x.id === m.vehicleId);
        if (!v) return;
        if (v.status === "Retired") {
          toast.error("Cannot service a retired vehicle.");
          return;
        }
        if (v.status === "On Trip") {
          toast.error("Vehicle is On Trip. Complete the trip first.");
          return;
        }
        if (maintenance.some((x) => x.vehicleId === m.vehicleId && x.status === "Active")) {
          toast.error("An active maintenance record already exists for this vehicle.");
          return;
        }
        setMaintenance((prev) => [
          { id: uid(), vehicleId: m.vehicleId, serviceType: m.serviceType, description: m.description, cost: m.cost, startDate: today(), endDate: null, status: "Active" },
          ...prev,
        ]);
        setVehicleStatus(m.vehicleId, "In Shop");
        toast.success(`${v.registrationNumber} moved to In Shop.`);
      },
      closeMaintenance: (id) => {
        const rec = maintenance.find((x) => x.id === id);
        if (!rec || rec.status === "Completed") return;
        setMaintenance((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Completed", endDate: today() } : x)));
        const v = vehicles.find((x) => x.id === rec.vehicleId);
        if (v && v.status !== "Retired") setVehicleStatus(rec.vehicleId, "Available");
        toast.success("Maintenance closed.");
      },

      addFuelLog: (f) => {
        if (f.liters <= 0 || f.cost < 0) {
          toast.error("Liters must be positive and cost non-negative.");
          return;
        }
        setFuelLogs((prev) => [{ ...f, id: uid() }, ...prev]);
        toast.success("Fuel log recorded.");
      },
      addExpense: (e) => {
        if (e.amount < 0) {
          toast.error("Amount must be non-negative.");
          return;
        }
        setExpenses((prev) => [{ ...e, id: uid() }, ...prev]);
        toast.success("Expense recorded.");
      },

      updateSettings: (s) => {
        setSettings((prev) => ({ ...prev, ...s }));
        toast.success("Settings saved.");
      },
    };
  }, [currentUser, users, vehicles, drivers, trips, maintenance, fuelLogs, expenses, settings, tripCounter]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}
