import React, { useState } from "react";
import { Toaster } from "sonner";
import { Lock } from "lucide-react";
import { StoreProvider, useStore } from "./lib/store";
import { canView, type ModuleKey } from "./lib/rbac";
import { Shell, type ScreenKey } from "./components/layout/Shell";
import { Auth } from "./components/screens/Auth";
import { Dashboard } from "./components/screens/Dashboard";
import { Vehicles } from "./components/screens/Vehicles";
import { Drivers } from "./components/screens/Drivers";
import { Trips } from "./components/screens/Trips";
import { Maintenance } from "./components/screens/Maintenance";
import { Expenses } from "./components/screens/Expenses";
import { Analytics } from "./components/screens/Analytics";
import { Settings } from "./components/screens/Settings";
import { EmptyState, Panel } from "./components/ui/primitives";

const SCREEN_MODULE: Record<ScreenKey, ModuleKey> = {
  dashboard: "Dashboard",
  vehicles: "Vehicles",
  drivers: "Drivers",
  trips: "Trips",
  maintenance: "Maintenance",
  expenses: "Fuel Logs",
  analytics: "Analytics",
  settings: "Settings/RBAC",
};

function Workspace() {
  const { currentUser } = useStore();
  const [screen, setScreen] = useState<ScreenKey>("dashboard");
  const [search, setSearch] = useState("");

  if (!currentUser) return <Auth />;

  const allowed = canView(currentUser.role, SCREEN_MODULE[screen]);

  const render = () => {
    if (!allowed)
      return (
        <Panel className="p-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <Lock className="text-to-muted" />
            <EmptyState message={`Your role (${currentUser.role}) does not have access to this module.`} />
          </div>
        </Panel>
      );
    switch (screen) {
      case "dashboard": return <Dashboard />;
      case "vehicles": return <Vehicles globalSearch={search} />;
      case "drivers": return <Drivers globalSearch={search} />;
      case "trips": return <Trips />;
      case "maintenance": return <Maintenance />;
      case "expenses": return <Expenses />;
      case "analytics": return <Analytics />;
      case "settings": return <Settings />;
    }
  };

  return (
    <Shell active={screen} onNavigate={setScreen} search={search} onSearch={setSearch}>
      {render()}
    </Shell>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Workspace />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{ style: { background: "#1b222b", border: "1px solid #2a313a", color: "#f5f7fa" } }}
      />
    </StoreProvider>
  );
}
