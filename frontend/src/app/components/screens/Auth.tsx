import React, { useState } from "react";
import { Truck, Sun, Moon } from "lucide-react";
import { useStore } from "../../lib/store";
import { Button, Field, Input } from "../ui/primitives";
import { seedUsers } from "../../lib/seed";
import { Typewriter } from "../ui/typewriter-text";

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
    
    // Check credentials locally first before showing the animation
    const u = seedUsers.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || u.password !== password) {
      setError("Invalid credentials. Please check the demo accounts.");
      return;
    }
    
    setError("");
    setIsTransitioning(true);
    
    // Defer actual login state update for 2 seconds to let the transition animate
    setTimeout(() => {
      login(email, password);
    }, 2000);
  };

  const imageSrc = "https://res.cloudinary.com/dvasr5a1s/image/upload/v1783850738/8c64974c1e58d27458d88a535d586404_onxroq.jpg";
  const quoteText = "Welcome Back! The journey continues.";
  const quoteAuthor = "TransitOps";

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2 bg-to-bg text-to-text overflow-hidden relative">
      {/* Dynamic Keyframe Injection for the truck transition */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes truckDrive {
          0% {
            left: -120px;
            opacity: 0;
            transform: scale(0.9);
          }
          15% {
            opacity: 1;
            transform: scale(1);
          }
          85% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            left: 100%;
            opacity: 0;
            transform: scale(0.9);
          }
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
        className="absolute top-4 right-4 z-50 flex size-10 items-center justify-center rounded-lg border border-to-border bg-to-panel text-to-text hover:bg-to-panel2 transition-colors cursor-pointer shadow-lg"
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Left Column: Form */}
      <div className={`flex h-screen flex-col items-center justify-center p-6 md:h-auto md:p-0 md:py-12 transition-all duration-500 ${isTransitioning ? "blur-md scale-95 opacity-50 pointer-events-none" : ""}`}>
        <div className="mx-auto grid w-[350px] gap-6">
          
          <div className="flex flex-col items-center text-center space-y-2">
            <img src="/logo.png" alt="TransitOps Logo" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-to-text">Welcome back</h1>
              <p className="text-balance text-sm text-to-muted mt-1">Sign in to coordinate fleets, dispatch cargo, and track metrics</p>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            <Field label="Email Address">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@transitops.local" required />
            </Field>
            <Field label="Password">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
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

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-to-border mt-2">
            <span className="relative z-10 bg-to-bg px-2 text-to-muted">Demo Access Profiles</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {seedUsers.map((u) => (
              <button
                key={u.id}
                type="button"
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

      {/* Right Column: Image and Quote */}
      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${imageSrc})` }}
      >
        <div className="absolute inset-x-0 bottom-0 h-[150px] bg-gradient-to-t from-black/80 to-transparent" />
        
        <div className="relative z-10 flex h-full flex-col items-center justify-end p-6 pb-12">
          <blockquote className="space-y-3 text-center text-white max-w-md">
            <p className="text-xl font-medium leading-relaxed drop-shadow-md">
              “<Typewriter
                  key={quoteText}
                  text={quoteText}
                  speed={60}
                />”
            </p>
            <cite className="block text-sm font-light text-white/80 not-italic drop-shadow-sm">
                — {quoteAuthor}
            </cite>
          </blockquote>
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
              <Truck size={44} className="stroke-[1.5]" />
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
