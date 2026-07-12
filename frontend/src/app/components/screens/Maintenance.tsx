import React, { useState } from "react";
import { Plus, Wrench } from "lucide-react";
import { useStore } from "../../lib/store";
import { canWrite } from "../../lib/rbac";
import { fmtMoney } from "../../lib/metrics";
import { Button, Field, Input, Select, Panel, PageHeader, StatusBadge, Modal, EmptyState } from "../ui/primitives";

export function Maintenance() {
  const { maintenance, vehicles, addMaintenance, closeMaintenance, currentUser } = useStore();
  const writable = canWrite(currentUser!.role, "Maintenance");
  const [showForm, setShowForm] = useState(false);

  const eligible = vehicles.filter((v) => v.status === "Available" || v.status === "In Shop");

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle="Active maintenance moves a vehicle to In Shop and hides it from dispatch."
        action={writable && <Button variant="primary" onClick={() => setShowForm(true)}><Plus size={16} /> Log Service</Button>}
      />

      <Panel>
        {maintenance.length === 0 ? (
          <EmptyState message="No service records yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-to-muted">
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Service Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">End</th>
                  <th className="px-4 py-3">Status</th>
                  {writable && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {maintenance.map((m) => {
                  const v = vehicles.find((x) => x.id === m.vehicleId);
                  return (
                    <tr key={m.id} className="border-t border-to-border hover:bg-to-panel2/40">
                      <td className="px-4 py-3 font-mono">{v?.registrationNumber ?? "—"}</td>
                      <td className="px-4 py-3">{m.serviceType}</td>
                      <td className="px-4 py-3 text-to-muted">{m.description}</td>
                      <td className="px-4 py-3 text-to-muted">{fmtMoney(m.cost)}</td>
                      <td className="px-4 py-3 text-to-muted">{m.startDate}</td>
                      <td className="px-4 py-3 text-to-muted">{m.endDate ?? "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                      {writable && (
                        <td className="px-4 py-3 text-right">
                          {m.status === "Active" && (
                            <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => closeMaintenance(m.id)}>
                              Close & Restore
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {showForm && (
        <Modal open onClose={() => setShowForm(false)} title="Log Service Record">
          <MaintenanceForm
            vehicles={eligible.map((v) => ({ id: v.id, label: `${v.registrationNumber} · ${v.nameModel} (${v.status})` }))}
            onClose={() => setShowForm(false)}
            onSubmit={(data) => {
              addMaintenance(data);
              setShowForm(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function MaintenanceForm({
  vehicles,
  onClose,
  onSubmit,
}: {
  vehicles: { id: string; label: string }[];
  onClose: () => void;
  onSubmit: (m: { vehicleId: string; serviceType: string; description: string; cost: number }) => void;
}) {
  const [vehicleId, setVehicleId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !serviceType.trim()) return setErr("Vehicle and service type are required.");
    if (Number(cost) < 0) return setErr("Cost must be non-negative.");
    onSubmit({ vehicleId, serviceType, description, cost: Number(cost) || 0 });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-to-amber/30 bg-to-amber/10 px-3 py-2 text-xs text-to-amber">
        <Wrench size={14} /> Vehicle will move to In Shop and disappear from dispatch selection.
      </div>
      <Field label="Vehicle">
        <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          <option value="">Select vehicle</option>
          {vehicles.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
        </Select>
      </Field>
      <Field label="Service Type"><Input value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="Engine Overhaul" /></Field>
      <Field label="Description"><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details of the work" /></Field>
      <Field label="Cost (₹)"><Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} /></Field>
      {err && <div className="rounded-lg border border-to-red/30 bg-to-red/10 px-3 py-2 text-xs text-to-red">{err}</div>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">Create & Move to In Shop</Button>
      </div>
    </form>
  );
}
