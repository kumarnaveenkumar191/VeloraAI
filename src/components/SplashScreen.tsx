import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { currentUser } from "@/lib/auth";

const KEY = "velora.splash.shown";

export function SplashScreen() {
  const [show, setShow] = useState(false);
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) return;
    setShow(true);
    sessionStorage.setItem(KEY, "1");

    const onlyOnEntry = pathname === "/";
    const t = setTimeout(() => {
      setShow(false);
      if (onlyOnEntry && !currentUser()) {
        nav({ to: "/login" });
      }
    }, 5000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[oklch(0.12_0.04_252)] text-white animate-fade-up">
      <div className="text-center animate-splash-pop">
        <div className="mx-auto animate-splash-glow rounded-3xl">
          <Logo size={120} />
        </div>
        <h1 className="mt-8 text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-amber-200 to-cyan-200 bg-clip-text text-transparent">
          VELORA
        </h1>
        <p className="mt-3 text-sm uppercase tracking-[0.4em] text-white/70">
          Travel Smarter, Wander Further
        </p>
        <div className="mt-10 mx-auto h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 bg-gradient-to-r from-amber-300 to-cyan-300 animate-[float_1.6s_ease-in-out_infinite]" />
        </div>
        <p className="mt-6 text-xs text-white/40">Loading your premium experience…</p>
      </div>
    </div>
  );
}