import React, { useMemo, useState } from "react";
import { Truck, CheckCircle2, Wrench, Route, Clock, Users, Gauge } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useStore } from "../../lib/store";
import { computeKpis, vehicleStatusBreakdown, STATUS_COLORS } from "../../lib/metrics";
import { KpiCard, Panel, PageHeader, StatusBadge, Select, EmptyState } from "../ui/primitives";
import { Combobox } from "../ui/combobox";

export function Dashboard() {
  const { vehicles, drivers, trips } = useStore();
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [region, setRegion] = useState("");

  const filteredVehicles = useMemo(
    () =>
      vehicles.filter(
        (v) => (!type || v.type === type) && (!status || v.status === status) && (!region || v.region === region)
      ),
    [vehicles, type, status, region]
  );

  const kpis = useMemo(() => computeKpis(filteredVehicles, drivers, trips), [filteredVehicles, drivers, trips]);
  const breakdown = useMemo(() => vehicleStatusBreakdown(filteredVehicles), [filteredVehicles]);
  const recentTrips = useMemo(
    () => [...trips].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    [trips]
  );
  const regions = Array.from(new Set(vehicles.map((v) => v.region)));

  return (
    <div>
      <PageHeader
        title="Operations Dashboard"
        subtitle="Live fleet status computed from current records."
        action={
          <div className="flex flex-wrap gap-2">
            <Combobox
              value={type}
              onChange={setType}
              options={[
                { label: "All Types", value: "" },
                ...["Van", "Truck", "Mini", "Container", "Other"].map(t => ({ label: t, value: t }))
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
            <Combobox
              value={region}
              onChange={setRegion}
              options={[
                { label: "All Regions", value: "" },
                ...regions.map(r => ({ label: r, value: r }))
              ]}
              className="w-auto"
            />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Available Vehicles" value={kpis.available} accent="text-to-green" icon={<CheckCircle2 size={16} />} />
        <KpiCard label="On Trip" value={kpis.onTrip} accent="text-to-blue" icon={<Truck size={16} />} />
        <KpiCard label="In Maintenance" value={kpis.inShop} accent="text-to-amber" icon={<Wrench size={16} />} />
        <KpiCard label="Active Trips" value={kpis.activeTrips} accent="text-to-blue" icon={<Route size={16} />} />
        <KpiCard label="Pending Trips" value={kpis.pendingTrips} accent="text-to-muted" icon={<Clock size={16} />} />
        <KpiCard label="Drivers On Duty" value={kpis.driversOnDuty} accent="text-to-green" icon={<Users size={16} />} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent trips */}
        <Panel className="lg:col-span-2">
          <div className="border-b border-to-border px-4 py-3">
            <h3>Recent Trips</h3>
          </div>
          {recentTrips.length === 0 ? (
            <EmptyState message="No trips yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-to-muted">
                    <th className="px-4 py-2.5">Trip</th>
                    <th className="px-4 py-2.5">Route</th>
                    <th className="px-4 py-2.5">Vehicle</th>
                    <th className="px-4 py-2.5">Distance</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map((t) => {
                    const v = vehicles.find((x) => x.id === t.vehicleId);
                    return (
                      <tr key={t.id} className="border-t border-to-border">
                        <td className="px-4 py-2.5 font-mono text-to-muted">{t.tripCode}</td>
                        <td className="px-4 py-2.5">{t.source} → {t.destination}</td>
                        <td className="px-4 py-2.5 text-to-muted">{v?.registrationNumber ?? "—"}</td>
                        <td className="px-4 py-2.5 text-to-muted">{(t.actualDistanceKm ?? t.plannedDistanceKm)} km</td>
                        <td className="px-4 py-2.5"><StatusBadge status={t.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Status breakdown */}
        <Panel className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3>Vehicle Status</h3>
            <div className="flex items-center gap-1.5 text-xs text-to-muted">
              <Gauge size={14} /> {kpis.utilization}% utilized
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {breakdown.map((e) => (
                    <Cell key={e.name} fill={STATUS_COLORS[e.name]} stroke="#151a20" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1b222b", border: "1px solid #2a313a", borderRadius: 8, color: "#f5f7fa" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#98a2b3" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
