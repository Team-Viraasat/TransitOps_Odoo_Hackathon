import React, { useState } from "react";
import { Truck, ShieldCheck } from "lucide-react";
import { useStore } from "../../lib/store";
import { Button, Field, Input } from "../ui/primitives";
import { seedUsers } from "../../lib/seed";

export function Auth() {
  const { login } = useStore();
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
    <div className="flex min-h-screen w-full bg-to-bg text-to-text">
      {/* Left brand panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-to-border bg-to-panel p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-to-orange text-black">
            <Truck size={22} />
          </div>
          <div>
            <div className="text-lg">TransitOps</div>
            <div className="text-xs text-to-muted">Smart Transport Operations Platform</div>
          </div>
        </div>
        <div>
          <h2 className="max-w-md leading-snug">
            A live operations control room for your fleet — vehicles, drivers, dispatch, maintenance and analytics in one place.
          </h2>
          <div className="mt-6 grid max-w-md grid-cols-2 gap-3 text-sm text-to-muted">
            {["Role-based access control", "Automatic status transitions", "Capacity & license validation", "Live KPIs and CSV reports"].map((f) => (
              <div key={f} className="flex items-center gap-2 rounded-lg border border-to-border bg-to-bg px-3 py-2">
                <ShieldCheck size={15} className="text-to-green shrink-0" /> {f}
              </div>
            ))}
          </div>
        </div>
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
              <span className="text-lg">TransitOps</span>
            </div>
          </div>
          <h1>Sign in</h1>
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
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-to-orange" />
                Remember me
              </label>
              <a className="text-to-blue hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" className="w-full">
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
                  className="flex w-full items-center justify-between rounded px-2 py-1 text-xs hover:bg-to-panel2"
                >
                  <span className="text-to-orange">{u.role}</span>
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
