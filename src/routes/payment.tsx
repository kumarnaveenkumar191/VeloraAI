import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { useRequireAuth } from "@/lib/route-guard";
import { computeCost, getTrip, saveTrip, type Trip } from "@/lib/trips";
import { currentUser } from "@/lib/auth";
import { CreditCard, Smartphone, Building2, Wallet, Lock, ShieldCheck } from "lucide-react";

const search = z.object({ tripId: z.string() });

export const Route = createFileRoute("/payment")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Checkout — VELORA" }, { name: "description", content: "Secure checkout for your VELORA booking." }] }),
  component: PaymentPage,
});

type Method = "card" | "upi" | "netbanking" | "wallet";

function PaymentPage() {
  useRequireAuth();
  const { tripId } = Route.useSearch();
  const nav = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [method, setMethod] = useState<Method>("card");
  const [processing, setProcessing] = useState(false);

  // card
  const [name, setName] = useState("");
  const [num, setNum] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [billing, setBilling] = useState("");
  // upi
  const [upi, setUpi] = useState("");
  // netbanking
  const [bank, setBank] = useState("HDFC Bank");
  // wallet
  const [wallet, setWallet] = useState("Paytm");

  useEffect(() => {
    const t = getTrip(tripId);
    if (t) {
      const c = computeCost(t);
      setTrip({ ...t, cost: c });
    }
  }, [tripId]);

  const cost = useMemo(() => trip ? computeCost(trip) : null, [trip]);
  const user = typeof window !== "undefined" ? currentUser() : null;

  if (!trip || !cost) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-muted-foreground">Trip not found.</p>
          <Link to="/trips" className="mt-4 inline-flex rounded-full gradient-hero px-5 py-2 text-sm font-semibold text-white">Go to my trips</Link>
        </div>
      </Layout>
    );
  }

  const pay = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1400));
    const bookingId = `VEL-${Date.now().toString(36).toUpperCase()}`;
    const updated: Trip = {
      ...trip,
      bookingId,
      paymentStatus: "paid",
      paymentMethod: method,
      customerName: user?.name ?? name,
      cost,
    };
    saveTrip(updated);
    nav({ to: "/payment-success", search: { tripId: updated.id } });
  };

  return (
    <Layout>
      <section className="gradient-hero text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-3xl font-bold flex items-center gap-3"><Lock className="h-6 w-6" /> Secure Checkout</h1>
          <p className="text-white/80 mt-1 text-sm">Complete your booking · Trip to <b>{trip.destination}</b></p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Methods */}
        <div>
          <div className="flex flex-wrap gap-2">
            {([
              ["card", "Credit/Debit Card", CreditCard],
              ["upi", "UPI", Smartphone],
              ["netbanking", "Net Banking", Building2],
              ["wallet", "Wallet", Wallet],
            ] as const).map(([k, l, Icon]) => (
              <button
                key={k}
                onClick={() => setMethod(k)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border ${method === k ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}
              >
                <Icon className="h-4 w-4" /> {l}
              </button>
            ))}
          </div>

          <div className="mt-6 bg-card rounded-2xl p-6 shadow-soft">
            {method === "card" && (
              <div className="space-y-4">
                <h2 className="font-bold">Card Details</h2>
                <Inp label="Card Holder Name" value={name} onChange={setName} placeholder="As on card" />
                <Inp label="Card Number" value={num} onChange={setNum} placeholder="1234 5678 9012 3456" maxLength={19} />
                <div className="grid grid-cols-2 gap-3">
                  <Inp label="Expiry Date" value={exp} onChange={setExp} placeholder="MM/YY" maxLength={5} />
                  <Inp label="CVV" value={cvv} onChange={setCvv} placeholder="•••" maxLength={4} />
                </div>
                <Inp label="Billing Address" value={billing} onChange={setBilling} placeholder="Street, City, ZIP" />
              </div>
            )}
            {method === "upi" && (
              <div className="space-y-4">
                <h2 className="font-bold">UPI ID</h2>
                <Inp label="Enter UPI ID" value={upi} onChange={setUpi} placeholder="yourname@bank" />
                <p className="text-xs text-muted-foreground">Supported: GPay, PhonePe, Paytm, BHIM, Amazon Pay.</p>
              </div>
            )}
            {method === "netbanking" && (
              <div className="space-y-4">
                <h2 className="font-bold">Select your bank</h2>
                <select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2.5">
                  {["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra", "Yes Bank"].map((b) => <option key={b}>{b}</option>)}
                </select>
                <p className="text-xs text-muted-foreground">You'll be redirected to your bank to authorize the payment.</p>
              </div>
            )}
            {method === "wallet" && (
              <div className="space-y-4">
                <h2 className="font-bold">Choose wallet</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Paytm", "Mobikwik", "Amazon Pay", "Freecharge"].map((w) => (
                    <button key={w} onClick={() => setWallet(w)} className={`rounded-xl border py-3 text-sm font-semibold ${wallet === w ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}>{w}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-secondary" /> 256-bit encrypted · This is a demo checkout. No real charge will occur.
            </div>

            <button onClick={pay} disabled={processing} className="mt-4 w-full rounded-xl gradient-hero py-3.5 font-semibold text-white shadow-glow disabled:opacity-60">
              {processing ? "Processing payment…" : `Pay ₹${cost.total.toLocaleString("en-IN")}`}
            </button>
          </div>
        </div>

        {/* Summary */}
        <aside className="bg-card rounded-2xl p-6 shadow-soft h-fit sticky top-24">
          <h3 className="font-bold">Booking Summary</h3>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Trip to {trip.destination}</div>
          <dl className="mt-4 space-y-2 text-sm">
            {trip.flight && <SumLine k="Flight" v={`${trip.flight.airline} ${trip.flight.flightNo}`} />}
            {trip.returnFlight && <SumLine k="Return" v={`${trip.returnFlight.airline} ${trip.returnFlight.flightNo}`} />}
            {trip.hotel && <SumLine k="Hotel" v={`${trip.hotel.name} · ${trip.nights ?? 3} nights`} />}
            {trip.hotelGuests && <SumLine k="Rooms" v={`${trip.hotelGuests.rooms} ${trip.hotelGuests.bedPreference}`} />}
            {trip.passengers && <SumLine k="Passengers" v={`${trip.passengers.adults} adults · ${trip.passengers.children} children`} />}
            {trip.itinerary && <SumLine k="Itinerary" v={`${trip.itinerary.length}-day plan`} />}
          </dl>
          <div className="mt-4 border-t pt-4 space-y-1 text-sm">
            <SumLine k="Flight" v={`₹${cost.flight.toLocaleString("en-IN")}`} />
            <SumLine k="Hotel" v={`₹${cost.hotel.toLocaleString("en-IN")}`} />
            <SumLine k="Cab" v={`₹${cost.cab.toLocaleString("en-IN")}`} />
            <SumLine k="Activities" v={`₹${cost.activities.toLocaleString("en-IN")}`} />
          </div>
          <div className="mt-4 border-t pt-4 flex items-center justify-between">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">₹{cost.total.toLocaleString("en-IN")}</span>
          </div>
        </aside>
      </section>
    </Layout>
  );
}

function Inp({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-muted-foreground mb-1">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} {...rest} className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary" />
    </label>
  );
}
function SumLine({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium text-right">{v}</dd></div>;
}