import React, { useMemo, useState } from "react";
import { Plus, Pencil, Search, AlertTriangle } from "lucide-react";
import { useStore } from "../../lib/store";
import { canWrite } from "../../lib/rbac";
import type { Driver, DriverStatus, LicenseCategory } from "../../lib/types";
import { Button, Field, Input, Select, Panel, PageHeader, StatusBadge, Modal, EmptyState } from "../ui/primitives";

const CATEGORIES: LicenseCategory[] = ["LMV", "HMV", "Transport", "Other"];
const STATUSES: DriverStatus[] = ["Available", "On Trip", "Off Duty", "Suspended"];

const isExpired = (d: string) => new Date(d) < new Date(new Date().toISOString().slice(0, 10));

export function Drivers({ globalSearch }: { globalSearch: string }) {
  const { drivers, trips, addDriver, updateDriver, setDriverStatus, currentUser } = useStore();
  const writable = canWrite(currentUser!.role, "Drivers");
  const [status, setStatus] = useState("");
  const [cat, setCat] = useState("");
  const [local, setLocal] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);

  const q = (globalSearch || local).toLowerCase();
  const filtered = useMemo(
    () =>
      drivers.filter(
        (d) =>
          (!status || d.status === status) &&
          (!cat || d.licenseCategory === cat) &&
          (!q || d.name.toLowerCase().includes(q) || d.licenseNumber.toLowerCase().includes(q))
      ),
    [drivers, status, cat, q]
  );

  const completionPct = (id: string) => {
    const total = trips.filter((t) => t.driverId === id && (t.status === "Completed" || t.status === "Dispatched")).length;
    const done = trips.filter((t) => t.driverId === id && t.status === "Completed").length;
    return total ? Math.round((done / total) * 100) : 0;
  };

  return (
    <div>
      <PageHeader
        title="Drivers & Safety Profiles"
        subtitle="Expired license or Suspended status blocks trip assignment."
        action={writable && <Button variant="primary" onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> Add Driver</Button>}
      />

      <Panel className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-to-muted" />
            <Input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Search name or license" className="pl-9" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Select value={cat} onChange={(e) => setCat(e.target.value)} className="w-auto">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
      </Panel>

      <Panel>
        {filtered.length === 0 ? (
          <EmptyState message="No drivers match your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-to-muted">
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">License</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Safety</th>
                  <th className="px-4 py-3">Completion</th>
                  <th className="px-4 py-3">Status</th>
                  {writable && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const expired = isExpired(d.licenseExpiryDate);
                  return (
                    <tr key={d.id} className="border-t border-to-border hover:bg-to-panel2/40">
                      <td className="px-4 py-3">
                        <div>{d.name}</div>
                        <div className="text-xs text-to-muted">{d.contactNumber}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-to-muted">{d.licenseNumber}</td>
                      <td className="px-4 py-3 text-to-muted">{d.licenseCategory}</td>
                      <td className="px-4 py-3">
                        <span className={expired ? "flex items-center gap-1 text-to-red" : "text-to-muted"}>
                          {expired && <AlertTriangle size={13} />}
                          {d.licenseExpiryDate}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-to-border">
                            <div
                              className={`h-full ${d.safetyScore >= 80 ? "bg-to-green" : d.safetyScore >= 60 ? "bg-to-amber" : "bg-to-red"}`}
                              style={{ width: `${d.safetyScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-to-muted">{d.safetyScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-to-muted">{completionPct(d.id)}%</td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                      {writable && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Select
                              value={d.status}
                              onChange={(e) => setDriverStatus(d.id, e.target.value as DriverStatus)}
                              className="w-auto py-1 text-xs"
                              disabled={d.status === "On Trip"}
                            >
                              {STATUSES.map((s) => <option key={s} value={s} disabled={s === "On Trip"}>{s}</option>)}
                            </Select>
                            <button onClick={() => { setEditing(d); setShowForm(true); }} className="rounded p-1.5 text-to-muted hover:bg-to-panel2 hover:text-to-blue">
                              <Pencil size={15} />
                            </button>
                          </div>
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
        <DriverForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSubmit={(data) => {
            if (editing) updateDriver(editing.id, data);
            else addDriver(data);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function DriverForm({
  initial,
  onClose,
  onSubmit,
}: {
  initial: Driver | null;
  onClose: () => void;
  onSubmit: (d: Omit<Driver, "id" | "status">) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [lic, setLic] = useState(initial?.licenseNumber ?? "");
  const [cat, setCat] = useState<LicenseCategory>(initial?.licenseCategory ?? "LMV");
  const [expiry, setExpiry] = useState(initial?.licenseExpiryDate ?? "");
  const [contact, setContact] = useState(initial?.contactNumber ?? "");
  const [score, setScore] = useState(String(initial?.safetyScore ?? 80));
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = Number(score);
    if (!name.trim() || !lic.trim() || !contact.trim() || !expiry) return setErr("All fields are required.");
    if (s < 0 || s > 100) return setErr("Safety score must be between 0 and 100.");
    onSubmit({ name, licenseNumber: lic, licenseCategory: cat, licenseExpiryDate: expiry, contactNumber: contact, safetyScore: s });
  };

  return (
    <Modal open onClose={onClose} title={initial ? "Edit Driver" : "Add Driver"} wide>
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="License Number"><Input value={lic} onChange={(e) => setLic(e.target.value.toUpperCase())} /></Field>
        <Field label="License Category">
          <Select value={cat} onChange={(e) => setCat(e.target.value as LicenseCategory)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="License Expiry"><Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} /></Field>
        <Field label="Contact Number"><Input value={contact} onChange={(e) => setContact(e.target.value)} /></Field>
        <Field label="Safety Score (0-100)"><Input type="number" value={score} onChange={(e) => setScore(e.target.value)} /></Field>
        {err && <div className="sm:col-span-2 rounded-lg border border-to-red/30 bg-to-red/10 px-3 py-2 text-xs text-to-red">{err}</div>}
        <div className="sm:col-span-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{initial ? "Save Changes" : "Add Driver"}</Button>
        </div>
      </form>
    </Modal>
  );
}
