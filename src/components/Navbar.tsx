import { Link, useNavigate } from "@tanstack/react-router";
import { Plane, Hotel, Map, MessageCircle, Briefcase, LogIn, LogOut, UserCircle2, Crown, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { currentUser, logout, type User } from "@/lib/auth";
import { isPremium } from "@/lib/trips";
import { Logo } from "./Logo";

const links = [
  { to: "/flights", label: "Flights", icon: Plane },
  { to: "/hotels", label: "Hotels", icon: Hotel },
  { to: "/itinerary", label: "Itinerary", icon: Map },
  { to: "/chat", label: "AI Assistant", icon: MessageCircle },
  { to: "/trips", label: "My Trips", icon: Briefcase },
] as const;

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [premium, setPremium] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  useEffect(() => {
    setUser(currentUser());
    setPremium(isPremium());
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const onLogout = () => { logout(); setUser(null); setOpen(false); nav({ to: "/login" }); };

  return (
    <header className="sticky top-0 z-50 glass border-b no-print">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Logo size={36} />
          <span className="tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">VELORA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              activeProps={{ className: "px-3 py-2 rounded-lg text-sm font-semibold text-primary bg-primary/10" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${premium ? "bg-gradient-to-r from-amber-300 to-amber-500 text-amber-950" : "bg-muted text-muted-foreground"}`}>
                <Crown className="h-3.5 w-3.5" /> {premium ? "Premium" : "Free"}
              </span>
              <div className="relative" ref={menuRef}>
                <button onClick={() => setOpen(o => !o)} className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-1.5 text-xs font-semibold hover:bg-muted transition">
                  <span className="grid h-6 w-6 place-items-center rounded-full gradient-hero text-white">
                    <UserCircle2 className="h-4 w-4" />
                  </span>
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-background shadow-glow overflow-hidden animate-fade-up">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link to="/trips" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted">
                      <Briefcase className="h-4 w-4 text-primary" /> My Trips
                    </Link>
                    <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted text-destructive">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="inline-flex items-center gap-1 rounded-full gradient-hero px-4 py-2 text-sm font-semibold text-white shadow-soft">
              <LogIn className="h-4 w-4" /> Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}