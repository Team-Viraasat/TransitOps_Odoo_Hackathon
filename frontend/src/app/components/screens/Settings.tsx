import React, { useState } from "react";
import { useStore } from "../../lib/store";
import { PERMISSION_MATRIX, type ModuleKey, type Access } from "../../lib/rbac";
import type { RoleName } from "../../lib/types";
import { Button, Field, Input, Select, Panel, PageHeader } from "../ui/primitives";

const ROLES: RoleName[] = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst", "Admin"];

const ACCESS_STYLE: Record<Access, string> = {
  Full: "bg-to-green/15 text-to-green",
  "Create/View": "bg-to-blue/15 text-to-blue",
  View: "bg-to-panel2 text-to-muted",
  Limited: "bg-to-amber/15 text-to-amber",
  None: "bg-to-red/10 text-to-red/70",
};

export function Settings() {
  const { settings, updateSettings } = useStore();
  const [depotName, setDepotName] = useState(settings.depotName);
  const [currency, setCurrency] = useState(settings.currency);
  const [distanceUnit, setDistanceUnit] = useState(settings.distanceUnit);

  const modules = Object.keys(PERMISSION_MATRIX) as ModuleKey[];

  return (
    <div>
      <PageHeader title="Settings & RBAC" subtitle="Depot configuration and the role-based access matrix (Admin only)." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="p-4 lg:col-span-1">
          <h3 className="mb-4">Depot Configuration</h3>
          <div className="space-y-3">
            <Field label="Depot Name"><Input value={depotName} onChange={(e) => setDepotName(e.target.value)} /></Field>
            <Field label="Currency">
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {["INR", "USD", "EUR", "GBP", "AED"].map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Distance Unit">
              <Select value={distanceUnit} onChange={(e) => setDistanceUnit(e.target.value)}>
                {["km", "mi"].map((u) => <option key={u}>{u}</option>)}
              </Select>
            </Field>
            <Button variant="primary" className="w-full" onClick={() => updateSettings({ depotName, currency, distanceUnit })}>
              Save Settings
            </Button>
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <div className="border-b border-to-border px-4 py-3"><h3>Role-Based Access Matrix</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-to-muted">
                  <th className="px-4 py-2.5">Module</th>
                  {ROLES.map((r) => <th key={r} className="px-3 py-2.5 text-center whitespace-nowrap">{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => (
                  <tr key={mod} className="border-t border-to-border">
                    <td className="px-4 py-2.5">{mod}</td>
                    {ROLES.map((r) => {
                      const a = PERMISSION_MATRIX[mod][r];
                      return (
                        <td key={r} className="px-3 py-2.5 text-center">
                          <span className={`inline-block rounded px-2 py-0.5 text-[11px] ${ACCESS_STYLE[a]}`}>{a}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-to-border px-4 py-3 text-xs text-to-muted">
            Permissions are seeded and enforced across the app. Editable RBAC is a planned enhancement.
          </div>
        </Panel>
      </div>
    </div>
  );
}
