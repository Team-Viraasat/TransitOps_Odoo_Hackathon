import React, { useState } from "react";
import { Truck, Sun, Moon } from "lucide-react";
import { useStore } from "../../lib/store";
import { Button, Field, Input } from "../ui/primitives";
import { seedUsers } from "../../lib/seed";

export function Auth() {
  const { login, theme, toggleTheme } = useStore();
  const [email, setEmail] = useState("dispatch@transitops.local");
  const [password, setPassword] = useState("password123");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

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
    const ok = login(email, password);
    if (!ok) setError("Invalid credentials. Please check the demo accounts.");
    else setError("");
  };

  return (
    <div className="relative flex min-h-screen w-full bg-to-bg text-to-text">
      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-50 flex size-10 items-center justify-center rounded-lg border border-to-border bg-to-panel text-to-text hover:bg-to-panel2 transition-colors cursor-pointer"
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Left brand panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-to-border bg-to-panel p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-to-orange text-black">
            <Truck size={22} />
          </div>
          <div>
            <div className="text-lg font-bold">TransitOps</div>
            <div className="text-xs text-to-muted">Smart Transport Operations Platform</div>
          </div>
        </div>
        <div />
        <div className="text-xs text-to-muted">Lightweight ERP module · Operational · Data-driven</div>
      </div>

      {/* Right form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-to-orange text-black">
                <Truck size={18} />
              </div>
              <span className="text-lg font-bold">TransitOps</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-to-muted">Access your transport operations workspace.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@transitops.local" />
            </Field>
            <Field label="Password">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </Field>

            {error && <div className="rounded-lg border border-to-red/30 bg-to-red/10 px-3 py-2 text-xs text-to-red">{error}</div>}

            <div className="flex items-center justify-between text-xs text-to-muted">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-to-orange" />
                Remember me
              </label>
              <a className="text-to-blue hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" className="w-full font-semibold">
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-to-border bg-to-panel p-3">
            <div className="mb-2 text-xs text-to-muted">Demo accounts · password: <span className="font-mono text-to-text">password123</span></div>
            <div className="space-y-1">
              {seedUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setEmail(u.email);
                    setPassword("password123");
                  }}
                  className="flex w-full items-center justify-between rounded px-2 py-1 text-xs hover:bg-to-panel2 cursor-pointer text-left"
                >
                  <span className="text-to-orange font-medium">{u.role}</span>
                  <span className="font-mono text-to-muted">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

