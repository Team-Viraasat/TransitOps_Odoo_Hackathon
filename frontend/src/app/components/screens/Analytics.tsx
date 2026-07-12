import React, { useMemo, useId } from "react";
import { Download, Gauge, TrendingUp, Fuel, Coins } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { toast } from "sonner";
import { useStore } from "../../lib/store";
import { computeKpis, operationalCost, fuelEfficiency, vehicleRoi, fmtMoney } from "../../lib/metrics";
import { KpiCard, Panel, PageHeader, Button, EmptyState } from "../ui/primitives";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";

const axisStyle = { fontSize: 11, fill: "#98a2b3" };
const tooltipStyle = { background: "#1b222b", border: "1px solid #2a313a", borderRadius: 8, color: "#f5f7fa", fontSize: 12 };

export function Analytics() {
  const id = useId();
  const { vehicles, drivers, trips, fuelLogs, maintenance, expenses } = useStore();

  const kpis = useMemo(() => computeKpis(vehicles, drivers, trips), [vehicles, drivers, trips]);
  const cost = useMemo(() => operationalCost(fuelLogs, maintenance, expenses), [fuelLogs, maintenance, expenses]);
  const effic = useMemo(() => fuelEfficiency(trips), [trips]);
  const roiRows = useMemo(() => vehicleRoi(vehicles, trips, fuelLogs, maintenance), [vehicles, trips, fuelLogs, maintenance]);

  const monthlyRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    trips.filter((t) => t.status === "Completed").forEach((t) => {
      const m = t.createdAt.slice(0, 7);
      map[m] = (map[m] ?? 0) + t.revenue;
    });
    const entries = Object.entries(map).sort();
    return entries.length ? entries.map(([month, revenue]) => ({ month, revenue })) : [{ month: new Date().toISOString().slice(0, 7), revenue: 0 }];
  }, [trips]);

  const costliest = useMemo(
    () => [...roiRows].sort((a, b) => b.cost - a.cost).slice(0, 5).map((r) => ({ name: r.vehicle.registrationNumber, cost: r.cost })),
    [roiRows]
  );

  const exportCsv = () => {
    const rows = [
      ["Vehicle", "Model", "Status", "Revenue", "Operational Cost", "ROI %"],
      ...roiRows.map((r) => [
        r.vehicle.registrationNumber,
        r.vehicle.nameModel,
        r.vehicle.status,
        String(r.revenue),
        String(r.cost),
        r.roi.toFixed(1),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transitops-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported from live records.");
  };

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Computed live from current fleet, trip, fuel and maintenance records."
        action={<Button variant="primary" onClick={exportCsv}><Download size={16} /> Export CSV</Button>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Fuel Efficiency" value={`${effic.toFixed(1)} km/L`} accent="text-to-orange" sub="Distance ÷ Fuel" icon={<Fuel size={16} />} />
        <KpiCard label="Fleet Utilization" value={`${kpis.utilization}%`} accent="text-to-blue" sub="On Trip ÷ Active vehicles" icon={<Gauge size={16} />} />
        <KpiCard label="Operational Cost" value={fmtMoney(cost.requiredTotal)} accent="text-to-amber" sub="Fuel + Maintenance" icon={<Coins size={16} />} />
        <KpiCard label="Avg Vehicle ROI" value={`${(roiRows.reduce((s, r) => s + r.roi, 0) / Math.max(roiRows.length, 1)).toFixed(1)}%`} accent="text-to-green" sub="(Rev − Cost) ÷ Acq." icon={<TrendingUp size={16} />} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel className="p-4">
          <h3 className="mb-3">Monthly Revenue</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a313a" />
                <XAxis dataKey="month" tick={axisStyle} stroke="#2a313a" />
                <YAxis tick={axisStyle} stroke="#2a313a" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtMoney(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#36b26a" strokeWidth={2} dot={{ fill: "#36b26a" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-4">
          <h3 className="mb-3">Top Costliest Vehicles</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costliest} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a313a" />
                <XAxis type="number" tick={axisStyle} stroke="#2a313a" tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis type="category" dataKey="name" tick={axisStyle} stroke="#2a313a" width={90} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtMoney(v)} />
                <Bar dataKey="cost" fill="#d98a00" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel className="mt-4">
        <div className="border-b border-to-border px-4 py-3"><h3>Vehicle ROI Breakdown</h3></div>
        {roiRows.length === 0 ? (
          <EmptyState message="No active vehicles." />
        ) : (
          <div className="w-full">
            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,1),inset_0px_-1px_4px_0px_rgba(0,0,0,0.05)] dark:shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,0.1),inset_0px_-1px_2px_0px_rgba(0,0,0,0.02)]">
                    <TableHead className="pl-4">Vehicle</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Operational Cost</TableHead>
                    <TableHead>Acquisition</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {roiRows.map((r) => (
                    <TableRow
                      key={r.vehicle.id}
                    >
                      <TableCell className="pl-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{r.vehicle.registrationNumber}</span>
                          <span className="text-muted-foreground text-xs">
                            {r.vehicle.nameModel}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>{fmtMoney(r.revenue)}</TableCell>

                      <TableCell>{fmtMoney(r.cost)}</TableCell>

                      <TableCell>{fmtMoney(r.vehicle.acquisitionCost)}</TableCell>

                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            r.roi >= 0
                              ? "bg-green-600/10 text-green-600 border-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:border-green-400/20"
                              : "bg-red-600/10 text-red-600 border-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:border-red-400/20",
                            'rounded-sm shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,1),inset_0px_-1px_2px_0px_rgba(0,0,0,0.05)] dark:shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,0.25),inset_0px_-1px_2px_0px_rgba(0,0,0,0.7)]',
                          )}
                        >
                          {r.roi.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
