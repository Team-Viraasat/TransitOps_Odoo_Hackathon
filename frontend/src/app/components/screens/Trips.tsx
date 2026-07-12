import React, { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Send, AlertTriangle, ShieldCheck } from "lucide-react";
import { useStore } from "../../lib/store";
import { canWrite } from "../../lib/rbac";
import { fmtMoney } from "../../lib/metrics";
import type { Trip } from "../../lib/types";
import { Button, Field, Input, Select, Panel, PageHeader, StatusBadge, Modal, EmptyState } from "../ui/primitives";

const today = () => new Date().toISOString().slice(0, 10);
const isExpired = (d: string) => new Date(d) < new Date(today());

export function Trips() {
  const { trips, vehicles, drivers, addTrip, dispatchTrip, completeTrip, cancelTrip, currentUser } = useStore();
  const writable = canWrite(currentUser!.role, "Trips");

  // form state
  const [source, setSource] = useState("");
  const [dest, setDest] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargo, setCargo] = useState("");
  const [distance, setDistance] = useState("");
  const [revenue, setRevenue] = useState("");

  const availableVehicles = vehicles.filter((v) => v.status === "Available");
  const availableDrivers = drivers.filter((d) => d.status === "Available" && !isExpired(d.licenseExpiryDate));

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const cargoN = Number(cargo);
  const capacityExceeded = selectedVehicle ? cargoN > selectedVehicle.maxLoadKg : false;

  const validation = useMemo(() => {
    const checks: { label: string; ok: boolean }[] = [
      { label: "Source & destination provided and differ", ok: !!source.trim() && !!dest.trim() && source.trim().toLowerCase() !== dest.trim().toLowerCase() },
      { label: "Vehicle selected (Available only)", ok: !!selectedVehicle },
      { label: "Driver selected (valid license)", ok: !!driverId },
      { label: "Cargo weight is positive", ok: cargoN > 0 },
      { label: "Planned distance is positive", ok: Number(distance) > 0 },
      {
        label: selectedVehicle ? `Cargo ≤ capacity (${selectedVehicle.maxLoadKg.toLocaleString()} kg)` : "Cargo within vehicle capacity",
        ok: !!selectedVehicle && cargoN > 0 && !capacityExceeded,
      },
    ];
    return { checks, valid: checks.every((c) => c.ok) };
  }, [source, dest, selectedVehicle, driverId, cargoN, distance, capacityExceeded]);

  const submitDraft = (autoDispatch: boolean) => {
    if (!validation.valid) return;
    // create draft then optionally dispatch: capture id by wrapping
    const beforeIds = new Set(trips.map((t) => t.id));
    addTrip({
      source,
      destination: dest,
      vehicleId: vehicleId || null,
      driverId: driverId || null,
      cargoWeightKg: cargoN,
      plannedDistanceKm: Number(distance),
      revenue: Number(revenue) || 0,
    });
    // dispatch handled from board after creation to keep transaction in store
    setSource(""); setDest(""); setVehicleId(""); setDriverId(""); setCargo(""); setDistance(""); setRevenue("");
    void beforeIds; void autoDispatch;
  };

  const groups: { key: Trip["status"]; label: string }[] = [
    { key: "Draft", label: "Draft" },
    { key: "Dispatched", label: "Dispatched" },
    { key: "Completed", label: "Completed" },
    { key: "Cancelled", label: "Cancelled" },
  ];

  const [completeFor, setCompleteFor] = useState<Trip | null>(null);
  const [cancelFor, setCancelFor] = useState<Trip | null>(null);

  return (
    <div>
      <PageHeader title="Trip Dispatcher" subtitle="Create trips, validate against live capacity & compliance, then dispatch." />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Create form + validation */}
        {writable && (
          <div className="space-y-4 xl:col-span-1">
            <Panel className="p-4">
              <h3 className="mb-3">Create Trip</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Source"><Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Mumbai" /></Field>
                  <Field label="Destination"><Input value={dest} onChange={(e) => setDest(e.target.value)} placeholder="Pune" /></Field>
                </div>
                <Field label="Vehicle (available only)">
                  <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                    <option value="">Select vehicle</option>
                    {availableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.registrationNumber} · {v.nameModel} ({v.maxLoadKg}kg)</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Driver (available, valid license)">
                  <Select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                    <option value="">Select driver</option>
                    {availableDrivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} · {d.licenseCategory}</option>
                    ))}
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Cargo Weight (kg)"><Input type="number" value={cargo} onChange={(e) => setCargo(e.target.value)} /></Field>
                  <Field label="Planned Distance (km)"><Input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} /></Field>
                </div>
                <Field label="Expected Revenue (₹)"><Input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} /></Field>
              </div>
            </Panel>

            {/* Live validation card */}
            <Panel className={`p-4 ${capacityExceeded ? "border-to-red/40" : ""}`}>
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck size={16} className={validation.valid ? "text-to-green" : "text-to-muted"} />
                <h3>Live Validation</h3>
              </div>
              {selectedVehicle && (
                <div className="mb-3 flex items-center justify-between rounded-lg border border-to-border bg-to-bg px-3 py-2 text-sm">
                  <span className="text-to-muted">Load</span>
                  <span className={capacityExceeded ? "text-to-red" : "text-to-green"}>
                    {cargoN || 0} / {selectedVehicle.maxLoadKg.toLocaleString()} kg
                  </span>
                </div>
              )}
              {capacityExceeded && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-to-red/30 bg-to-red/10 px-3 py-2 text-xs text-to-red">
                  <AlertTriangle size={14} /> Cargo exceeds vehicle capacity. Dispatch blocked.
                </div>
              )}
              <ul className="space-y-1.5">
                {validation.checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-xs">
                    {c.ok ? <CheckCircle2 size={14} className="text-to-green shrink-0" /> : <XCircle size={14} className="text-to-muted shrink-0" />}
                    <span className={c.ok ? "text-to-text" : "text-to-muted"}>{c.label}</span>
                  </li>
                ))}
              </ul>
              <Button variant="primary" disabled={!validation.valid} className="mt-4 w-full" onClick={() => submitDraft(false)}>
                <Send size={15} /> Create Draft Trip
              </Button>
              <p className="mt-2 text-center text-[11px] text-to-muted">Dispatch the draft from the board once created.</p>
            </Panel>
          </div>
        )}

        {/* Board */}
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${writable ? "xl:col-span-2" : "xl:col-span-3 xl:grid-cols-4"}`}>
          {groups.map((g) => {
            const list = trips.filter((t) => t.status === g.key);
            return (
              <Panel key={g.key} className="flex flex-col">
                <div className="flex items-center justify-between border-b border-to-border px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={g.key} />
                  </div>
                  <span className="text-xs text-to-muted">{list.length}</span>
                </div>
                <div className="flex-1 space-y-2 p-3">
                  {list.length === 0 ? (
                    <EmptyState message="None" />
                  ) : (
                    list.map((t) => {
                      const v = vehicles.find((x) => x.id === t.vehicleId);
                      const d = drivers.find((x) => x.id === t.driverId);
                      return (
                        <div key={t.id} className="rounded-lg border border-to-border bg-to-bg p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-to-muted">{t.tripCode}</span>
                            <span className="text-xs text-to-muted">{(t.actualDistanceKm ?? t.plannedDistanceKm)} km</span>
                          </div>
                          <div className="mt-1 text-sm">{t.source} → {t.destination}</div>
                          <div className="mt-1 text-xs text-to-muted">
                            {v?.registrationNumber ?? "No vehicle"} · {d?.name ?? "No driver"} · {t.cargoWeightKg}kg
                          </div>
                          {t.revenue > 0 && <div className="mt-1 text-xs text-to-green">{fmtMoney(t.revenue)}</div>}
                          {t.cancelReason && <div className="mt-1 text-xs text-to-red">Reason: {t.cancelReason}</div>}
                          {writable && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {t.status === "Draft" && (
                                <>
                                  <Button variant="primary" className="px-2 py-1 text-xs" onClick={() => dispatchTrip(t.id)}>Dispatch</Button>
                                  <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setCancelFor(t)}>Cancel</Button>
                                </>
                              )}
                              {t.status === "Dispatched" && (
                                <>
                                  <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => setCompleteFor(t)}>Complete</Button>
                                  <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setCancelFor(t)}>Cancel</Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      </div>

      {completeFor && (
        <CompleteTripModal
          trip={completeFor}
          startOdo={completeFor.startOdometerKm ?? vehicles.find((v) => v.id === completeFor.vehicleId)?.odometerKm ?? 0}
          onClose={() => setCompleteFor(null)}
          onSubmit={(data) => {
            completeTrip(completeFor.id, data);
            setCompleteFor(null);
          }}
        />
      )}

      {cancelFor && (
        <CancelTripModal
          trip={cancelFor}
          onClose={() => setCancelFor(null)}
          onSubmit={(reason) => {
            cancelTrip(cancelFor.id, reason);
            setCancelFor(null);
          }}
        />
      )}
    </div>
  );
}

function CompleteTripModal({
  trip,
  startOdo,
  onClose,
  onSubmit,
}: {
  trip: Trip;
  startOdo: number;
  onClose: () => void;
  onSubmit: (d: { finalOdometerKm: number; actualDistanceKm: number; fuelConsumedLiters: number; revenue: number }) => void;
}) {
  const [finalOdo, setFinalOdo] = useState(String(startOdo + trip.plannedDistanceKm));
  const [fuel, setFuel] = useState("");
  const [rev, setRev] = useState(String(trip.revenue));
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const f = Number(finalOdo);
    const fu = Number(fuel);
    if (f < startOdo) return setErr(`Final odometer must be ≥ start (${startOdo.toLocaleString()} km).`);
    if (fu < 0 || Number(rev) < 0) return setErr("Values must be non-negative.");
    onSubmit({ finalOdometerKm: f, actualDistanceKm: f - startOdo, fuelConsumedLiters: fu, revenue: Number(rev) });
  };

  return (
    <Modal open onClose={onClose} title={`Complete ${trip.tripCode}`}>
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-to-border bg-to-bg px-3 py-2 text-xs text-to-muted">
          Start odometer: <span className="text-to-text">{startOdo.toLocaleString()} km</span>
        </div>
        <Field label="Final Odometer (km)"><Input type="number" value={finalOdo} onChange={(e) => setFinalOdo(e.target.value)} /></Field>
        <Field label="Fuel Consumed (liters)"><Input type="number" value={fuel} onChange={(e) => setFuel(e.target.value)} placeholder="0" /></Field>
        <Field label="Revenue (₹)"><Input type="number" value={rev} onChange={(e) => setRev(e.target.value)} /></Field>
        {err && <div className="rounded-lg border border-to-red/30 bg-to-red/10 px-3 py-2 text-xs text-to-red">{err}</div>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Complete Trip</Button>
        </div>
      </form>
    </Modal>
  );
}

function CancelTripModal({ trip, onClose, onSubmit }: { trip: Trip; onClose: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Modal open onClose={onClose} title={`Cancel ${trip.tripCode}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(reason.trim() || "No reason provided");
        }}
        className="space-y-4"
      >
        <p className="text-sm text-to-muted">
          {trip.status === "Dispatched"
            ? "Cancelling will restore the assigned vehicle and driver to Available."
            : "This draft trip will be marked as Cancelled."}
        </p>
        <Field label="Cancellation Reason"><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Customer postponed shipment" /></Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Back</Button>
          <Button type="submit" variant="danger">Cancel Trip</Button>
        </div>
      </form>
    </Modal>
  );
}
