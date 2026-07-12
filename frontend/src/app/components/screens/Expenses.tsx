import React, { useState } from "react";
import { Plus, Fuel, Receipt } from "lucide-react";
import { useStore } from "../../lib/store";
import { canWrite } from "../../lib/rbac";
import { fmtMoney, operationalCost } from "../../lib/metrics";
import type { ExpenseType } from "../../lib/types";
import { Button, Field, Input, Select, Panel, PageHeader, KpiCard, Modal, EmptyState } from "../ui/primitives";

const today = () => new Date().toISOString().slice(0, 10);

export function Expenses() {
  const { fuelLogs, expenses, maintenance, vehicles, trips, addFuelLog, addExpense, currentUser } = useStore();
  const writable = canWrite(currentUser!.role, "Fuel Logs");
  const [fuelOpen, setFuelOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const cost = operationalCost(fuelLogs, maintenance, expenses);
  const reg = (id: string | null) => vehicles.find((v) => v.id === id)?.registrationNumber ?? "—";

  return (
    <div>
      <PageHeader title="Fuel & Expense Management" subtitle="Operational Cost = Fuel + Maintenance (other expenses tracked separately)." />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Fuel Cost" value={fmtMoney(cost.fuel)} accent="text-to-orange" icon={<Fuel size={16} />} />
        <KpiCard label="Maintenance Cost" value={fmtMoney(cost.maint)} accent="text-to-amber" icon={<Receipt size={16} />} />
        <KpiCard label="Operational Cost (Fuel + Maint.)" value={fmtMoney(cost.requiredTotal)} accent="text-to-blue" />
        <KpiCard label="Other Expenses" value={fmtMoney(cost.other)} accent="text-to-muted" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Fuel logs */}
        <Panel>
          <div className="flex items-center justify-between border-b border-to-border px-4 py-3">
            <h3>Fuel Logs</h3>
            {writable && <Button variant="secondary" className="px-2.5 py-1.5 text-xs" onClick={() => setFuelOpen(true)}><Plus size={14} /> Add</Button>}
          </div>
          {fuelLogs.length === 0 ? (
            <EmptyState message="No fuel logs." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-to-muted">
                    <th className="px-4 py-2.5">Vehicle</th>
                    <th className="px-4 py-2.5">Liters</th>
                    <th className="px-4 py-2.5">Cost</th>
                    <th className="px-4 py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map((f) => (
                    <tr key={f.id} className="border-t border-to-border">
                      <td className="px-4 py-2.5 font-mono">{reg(f.vehicleId)}</td>
                      <td className="px-4 py-2.5 text-to-muted">{f.liters} L</td>
                      <td className="px-4 py-2.5 text-to-muted">{fmtMoney(f.cost)}</td>
                      <td className="px-4 py-2.5 text-to-muted">{f.logDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Expenses */}
        <Panel>
          <div className="flex items-center justify-between border-b border-to-border px-4 py-3">
            <h3>Other Expenses</h3>
            {writable && <Button variant="secondary" className="px-2.5 py-1.5 text-xs" onClick={() => setExpOpen(true)}><Plus size={14} /> Add</Button>}
          </div>
          {expenses.length === 0 ? (
            <EmptyState message="No expenses." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-to-muted">
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-4 py-2.5">Amount</th>
                    <th className="px-4 py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-t border-to-border">
                      <td className="px-4 py-2.5">{e.type}</td>
                      <td className="px-4 py-2.5 text-to-muted">{e.description}</td>
                      <td className="px-4 py-2.5 text-to-muted">{fmtMoney(e.amount)}</td>
                      <td className="px-4 py-2.5 text-to-muted">{e.expenseDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {fuelOpen && (
        <Modal open onClose={() => setFuelOpen(false)} title="Add Fuel Log">
          <FuelForm
            vehicles={vehicles.filter((v) => v.status !== "Retired")}
            onClose={() => setFuelOpen(false)}
            onSubmit={(d) => { addFuelLog(d); setFuelOpen(false); }}
          />
        </Modal>
      )}
      {expOpen && (
        <Modal open onClose={() => setExpOpen(false)} title="Add Expense">
          <ExpenseForm
            vehicles={vehicles}
            trips={trips}
            onClose={() => setExpOpen(false)}
            onSubmit={(d) => { addExpense(d); setExpOpen(false); }}
          />
        </Modal>
      )}
    </div>
  );
}

function FuelForm({ vehicles, onClose, onSubmit }: { vehicles: { id: string; registrationNumber: string }[]; onClose: () => void; onSubmit: (d: any) => void }) {
  const [vehicleId, setVehicleId] = useState("");
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState(today());
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return setErr("Select a vehicle.");
    if (!(Number(liters) > 0)) return setErr("Liters must be positive.");
    if (Number(cost) < 0) return setErr("Cost must be non-negative.");
    onSubmit({ vehicleId, tripId: null, liters: Number(liters), cost: Number(cost), logDate: date, odometerKm: null });
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Vehicle">
        <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          <option value="">Select vehicle</option>
          {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Liters"><Input type="number" value={liters} onChange={(e) => setLiters(e.target.value)} /></Field>
        <Field label="Cost (₹)"><Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} /></Field>
      </div>
      <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      {err && <div className="rounded-lg border border-to-red/30 bg-to-red/10 px-3 py-2 text-xs text-to-red">{err}</div>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">Add Fuel Log</Button>
      </div>
    </form>
  );
}

function ExpenseForm({ vehicles, trips, onClose, onSubmit }: { vehicles: { id: string; registrationNumber: string }[]; trips: { id: string; tripCode: string }[]; onClose: () => void; onSubmit: (d: any) => void }) {
  const [type, setType] = useState<ExpenseType>("Toll");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [tripId, setTripId] = useState("");
  const [date, setDate] = useState(today());
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) < 0) return setErr("Amount must be non-negative.");
    if (!vehicleId && !tripId) return setErr("Link to a vehicle or trip.");
    onSubmit({ type, description, amount: Number(amount) || 0, vehicleId: vehicleId || null, tripId: tripId || null, expenseDate: date });
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <Select value={type} onChange={(e) => setType(e.target.value as ExpenseType)}>
            {(["Toll", "Maintenance", "Misc"] as ExpenseType[]).map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Amount (₹)"><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
      </div>
      <Field label="Description"><Input value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vehicle (optional)">
          <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">None</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
          </Select>
        </Field>
        <Field label="Trip (optional)">
          <Select value={tripId} onChange={(e) => setTripId(e.target.value)}>
            <option value="">None</option>
            {trips.map((t) => <option key={t.id} value={t.id}>{t.tripCode}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      {err && <div className="rounded-lg border border-to-red/30 bg-to-red/10 px-3 py-2 text-xs text-to-red">{err}</div>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">Add Expense</Button>
      </div>
    </form>
  );
}
