import { useState } from "react";
import { Sparkles, Check, X } from "lucide-react";
import { setPremium } from "@/lib/trips";

export function PremiumModal({
  open,
  onClose,
  title = "Upgrade to Premium to Customize Your Trip",
  subtitle = "Unlock full itinerary control and luxury extras.",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}) {
  const [loading, setLoading] = useState(false);
  if (!open) return null;
  const upgrade = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setPremium(true);
    setLoading(false);
    onClose();
    alert("Welcome to VELORA Premium! ✨ You can now customize freely.");
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 animate-fade-up">
      <div className="relative w-full max-w-md rounded-3xl bg-card p-8 shadow-glow">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-sunset text-white mb-4">
          <Sparkles className="h-7 w-7" />
        </div>
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        <ul className="my-6 space-y-3 text-sm">
          {[
            "Unlimited itinerary editing",
            "Add custom activities",
            "Luxury transport options",
            "Download premium PDF",
            "Driver customization",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-secondary" /> {f}</li>
          ))}
        </ul>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-bold">₹3,000</span>
          <span className="text-muted-foreground text-sm">one-time</span>
        </div>
        <button onClick={upgrade} disabled={loading} className="w-full rounded-xl gradient-hero py-3 font-semibold text-white shadow-glow disabled:opacity-60">
          {loading ? "Processing…" : "Upgrade Now"}
        </button>
      </div>
    </div>
  );
}