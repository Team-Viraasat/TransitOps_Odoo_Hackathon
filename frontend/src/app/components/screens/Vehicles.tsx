import React, { useMemo, useState } from "react";
import { Plus, Pencil, Ban, Search } from "lucide-react";
import { useStore } from "../../lib/store";
import { canWrite } from "../../lib/rbac";
import { fmtMoney } from "../../lib/metrics";
import type { Vehicle, VehicleType } from "../../lib/types";
import { Button, Field, Input, Select, Panel, PageHeader, StatusBadge, Modal, EmptyState } from "../ui/primitives";
import { Combobox } from "../ui/combobox";

const TYPES: VehicleType[] = ["Van", "Truck", "Mini", "Container", "Other"];

export function Vehicles({ globalSearch }: { globalSearch: string }) {
  const { vehicles, addVehicle, updateVehicle, retireVehicle, currentUser } = useStore();
  const writable = canWrite(currentUser!.role, "Vehicles");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [local, setLocal] = useState("");
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);

  const q = (globalSearch || local).toLowerCase();
  const filtered = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          (!type || v.type === type) &&
          (!status || v.status === status) &&
          (!q || v.registrationNumber.toLowerCase().includes(q) || v.nameModel.toLowerCase().includes(q))
      ),
    [vehicles, type, status, q]
  );

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setShowForm(true);
  };

  return (
    <div>
      <PageHeader
        title="Vehicle Registry"
        subtitle="Retired and In Shop vehicles are automatically hidden from dispatch."
        action={writable && <Button variant="primary" onClick={openAdd}><Plus size={16} /> Add Vehicle</Button>}
      />

      <Panel className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-to-muted" />
            <Input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Search registration or model" className="pl-9" />
          </div>
          <Combobox
            value={type}
            onChange={setType}
            options={[
              { label: "All Types", value: "" },
              ...TYPES.map(t => ({ label: t, value: t }))
            ]}
            className="w-auto"
          />
          <Combobox
            value={status}
            onChange={setStatus}
            options={[
              { label: "All Statuses", value: "" },
              ...["Available", "On Trip", "In Shop", "Retired"].map(s => ({ label: s, value: s }))
            ]}
            className="w-auto"
          />
        </div>
      </Panel>

      <Panel>
        {filtered.length === 0 ? (
          <EmptyState message="No vehicles match your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-to-muted">
                  <th className="px-4 py-3">Registration</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Odometer</th>
                  <th className="px-4 py-3">Acquisition</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Status</th>
                  {writable && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-t border-to-border hover:bg-to-panel2/40">
                    <td className="px-4 py-3 font-mono">{v.registrationNumber}</td>
                    <td className="px-4 py-3">{v.nameModel}</td>
                    <td className="px-4 py-3 text-to-muted">{v.type}</td>
                    <td className="px-4 py-3 text-to-muted">{v.maxLoadKg.toLocaleString()} kg</td>
                    <td className="px-4 py-3 text-to-muted">{v.odometerKm.toLocaleString()} km</td>
                    <td className="px-4 py-3 text-to-muted">{fmtMoney(v.acquisitionCost)}</td>
                    <td className="px-4 py-3 text-to-muted">{v.region}</td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                    {writable && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(v)} className="rounded p-1.5 text-to-muted hover:bg-to-panel2 hover:text-to-blue" title="Edit">
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => retireVehicle(v.id)}
                            disabled={v.status === "Retired" || v.status === "On Trip"}
                            className="rounded p-1.5 text-to-muted hover:bg-to-panel2 hover:text-to-red disabled:opacity-30"
                            title="Retire"
                          >
                            <Ban size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {showForm && (
        <VehicleForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSubmit={(data) => {
            if (editing) updateVehicle(editing.id, data);
            else addVehicle(data);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function VehicleForm({
  initial,
  onClose,
  onSubmit,
}: {
  initial: Vehicle | null;
  onClose: () => void;
  onSubmit: (v: Omit<Vehicle, "id" | "status">) => void;
}) {
  const [reg, setReg] = useState(initial?.registrationNumber ?? "");
  const [model, setModel] = useState(initial?.nameModel ?? "");
  const [type, setType] = useState<VehicleType>(initial?.type ?? "Van");
  const [maxLoad, setMaxLoad] = useState(String(initial?.maxLoadKg ?? ""));
  const [odo, setOdo] = useState(String(initial?.odometerKm ?? ""));
  const [cost, setCost] = useState(String(initial?.acquisitionCost ?? ""));
  const [region, setRegion] = useState(initial?.region ?? "West");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const maxLoadN = Number(maxLoad);
    const odoN = Number(odo);
    const costN = Number(cost);
    if (!reg.trim() || !model.trim()) return setErr("Registration and model are required.");
    if (!(maxLoadN > 0)) return setErr("Capacity must be positive.");
    if (odoN < 0 || costN < 0) return setErr("Odometer and cost must be non-negative.");
    onSubmit({ registrationNumber: reg, nameModel: model, type, maxLoadKg: maxLoadN, odometerKm: odoN, acquisitionCost: costN, region });
  };

  return (
    <Modal open onClose={onClose} title={initial ? "Edit Vehicle" : "Add Vehicle"} wide>
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Registration Number"><Input value={reg} onChange={(e) => setReg(e.target.value.toUpperCase())} placeholder="MH12AB1234" /></Field>
        <Field label="Name / Model"><Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Tata Ace" /></Field>
        <Field label="Type">
          <Combobox
            value={type}
            onChange={(v) => setType(v as VehicleType)}
            options={TYPES.map(t => ({ label: t, value: t }))}
          />
        </Field>
        <Field label="Max Load (kg)"><Input type="number" value={maxLoad} onChange={(e) => setMaxLoad(e.target.value)} /></Field>
        <Field label="Odometer (km)"><Input type="number" value={odo} onChange={(e) => setOdo(e.target.value)} /></Field>
        <Field label="Acquisition Cost (₹)"><Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} /></Field>
        <Field label="Region"><Input value={region} onChange={(e) => setRegion(e.target.value)} /></Field>
        {err && <div className="sm:col-span-2 rounded-lg border border-to-red/30 bg-to-red/10 px-3 py-2 text-xs text-to-red">{err}</div>}
        <div className="sm:col-span-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{initial ? "Save Changes" : "Add Vehicle"}</Button>
        </div>
      </form>
    </Modal>
  );
}
