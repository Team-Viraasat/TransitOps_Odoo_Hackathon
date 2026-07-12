import React, { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useStore } from "../../lib/store";
import { Button, Field, Input } from "../ui/primitives";

const DEMO_PROFILES = [
  { role: "Fleet Manager", name: "Priya Nair", email: "fleet@transitops.local" },
  { role: "Dispatcher", name: "Arjun Mehta", email: "dispatch@transitops.local" },
  { role: "Safety Officer", name: "Sana Kapoor", email: "safety@transitops.local" },
  { role: "Financial Analyst", name: "Rahul Desai", email: "finance@transitops.local" },
  { role: "Admin", name: "Admin", email: "admin@transitops.local" },
];

export function Auth() {
  const { login, theme, toggleTheme } = useStore();
  const [email, setEmail] = useState("dispatch@transitops.local");
  const [password, setPassword] = useState("password123");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setError("");
    setIsTransitioning(true);

    // Defer actual login to let the transition animate
    setTimeout(() => {
      login(email, password);
    }, 2000);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-to-bg p-4 text-to-text overflow-hidden">
      {/* Dynamic Keyframe Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes truckDrive {
          0% { left: -120px; opacity: 0; transform: scale(0.9); }
          15% { opacity: 1; transform: scale(1); }
          85% { opacity: 1; transform: scale(1); }
          100% { left: 100%; opacity: 0; transform: scale(0.9); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-truck-drive {
          animation: truckDrive 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />

      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-50 flex size-10 items-center justify-center rounded-lg border border-to-border bg-to-panel text-to-text hover:bg-to-panel2 transition-colors cursor-pointer"
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Centered Sign In Card */}
      <div className={`w-full max-w-md rounded-2xl border border-to-border bg-to-panel p-8 shadow-xl space-y-6 transition-all duration-500 ${isTransitioning ? "blur-md scale-95 opacity-50 pointer-events-none" : ""}`}>

        {/* Brand Identity */}
        <div className="flex flex-col items-center text-center space-y-2">
          <img src="/logo.png" alt="TransitOps Logo" className="h-16 w-auto object-contain" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-to-text">TransitOps</h1>
            <p className="text-xs text-to-muted">Smart Transport Operations Platform</p>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold">Welcome back</h2>
          <p className="text-xs text-to-muted">Sign in to coordinate fleets, dispatch cargo, and track metrics.</p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email Address">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@transitops.local" />
          </Field>
          <Field label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>

          {error && <div className="rounded-lg border border-to-red/30 bg-to-red/10 px-3 py-2 text-xs text-to-red">{error}</div>}

          <div className="flex items-center justify-between text-xs text-to-muted">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-to-orange rounded" />
              Remember this device
            </label>
            <a className="text-to-blue hover:underline" href="#" onClick={(e) => e.preventDefault()}>
              Reset password
            </a>
          </div>

          <Button type="submit" variant="primary" className="w-full py-2.5 font-semibold mt-2">
            Sign In
          </Button>
        </form>

        {/* Sandbox Profiles Grid */}
        <div className="border-t border-to-border pt-5 space-y-3">
          <div className="text-center">
            <span className="text-[11px] font-semibold text-to-muted uppercase tracking-wider">Demo Access Profiles</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_PROFILES.map((u) => (
              <button
                key={u.email}
                onClick={() => {
                  setEmail(u.email);
                  setPassword("password123");
                }}
                className="flex flex-col items-start rounded-lg border border-to-border bg-to-panel2/40 px-3 py-2 text-left hover:bg-to-panel2 hover:border-to-orange/40 transition-all cursor-pointer text-xs"
              >
                <span className="font-semibold text-to-text text-xs">{u.role}</span>
                <span className="text-[10px] text-to-muted mt-0.5 font-mono truncate w-full">{u.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Transit Transition Blur Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-to-bg/40 backdrop-blur-md animate-fade-in">

          {/* Track segment */}
          <div className="relative w-full max-w-lg h-24 overflow-hidden flex items-end pb-3">
            {/* The Road track */}
            <div className="absolute bottom-4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-to-muted/30 to-transparent" />
            <div className="absolute bottom-4 left-0 right-0 h-[3px] border-b border-dashed border-to-orange/30 w-full" />

            {/* Moving Truck Icon */}
            <div className="absolute bottom-1 left-[-120px] animate-truck-drive text-to-orange">
              <img src="/logo.png" alt="TransitOps" className="h-11 w-auto object-contain" />
            </div>
          </div>

          {/* Dispatch Loading indicator */}
          <div className="mt-6 text-center space-y-1.5">
            <p className="text-sm font-semibold tracking-widest uppercase text-to-orange animate-pulse">Initializing Hub Dispatch Link</p>
            <p className="text-xs text-to-muted">Loading secure console operations telemetry...</p>
          </div>
        </div>
      )}
    </div>
  );
}
