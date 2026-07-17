import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { useRequireAuth } from "@/lib/route-guard";
import { PremiumModal } from "@/components/PremiumModal";
import { findDestination } from "@/data/destinations";
import { getDriverForCity } from "@/data/mock";
import { computeCost, getTrip, isPremium, saveTrip, type ItineraryDay, type Trip } from "@/lib/trips";
import { ensureItinerary, EXCLUSIONS, INCLUSIONS, generateProItinerary } from "@/lib/itinerary-generator";
import { Plus, Trash2, Printer, Save, Sparkles, MapPin, Lock, CreditCard, Plane, Hotel as HotelIcon, Car } from "lucide-react";

const search = z.object({ tripId: z.string().optional() });

export const Route = createFileRoute("/itinerary")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Itinerary Planner — VELORA" }, { name: "description", content: "Professional day-by-day travel itineraries." }] }),
  component: ItineraryPage,
});

function ItineraryPage() {
  useRequireAuth();
  const { tripId } = Route.useSearch();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [city, setCity] = useState("Goa");
  const [premium, setPrem] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    setPrem(isPremium());
    if (tripId) {
      const raw = getTrip(tripId);
      if (raw) {
        const ensured = ensureItinerary(raw);
        setTrip(ensured);
        setCity(ensured.destination);
        setDays(ensured.itinerary ?? []);
      }
    }
  }, [tripId]);

  const dest = useMemo(() => findDestination(city), [city]);
  const driver = useMemo(() => getDriverForCity(city), [city]);
  const cost = useMemo(() => computeCost({ ...(trip ?? { id: "x", destination: city, createdAt: 0 }), itinerary: days }), [trip, days, city]);

  const generate = () => {
    setDays(generateProItinerary(city, 5));
  };

  const requirePremium = () => {
    if (premium) return false;
    setShowPremium(true);
    return true;
  };

  const save = () => {
    const id = trip?.id ?? `trip-${Date.now()}`;
    const updated: Trip = {
      ...(trip ?? { createdAt: Date.now() } as Trip),
      id,
      destination: city,
      itinerary: days,
      cost,
    } as Trip;
    saveTrip(updated);
    setTrip(updated);
    alert("Trip saved! Find it under My Trips.");
  };

  const goToPayment = () => {
    const id = trip?.id ?? `trip-${Date.now()}`;
    const updated: Trip = {
      ...(trip ?? { createdAt: Date.now() } as Trip),
      id, destination: city, itinerary: days, cost,
    } as Trip;
    saveTrip(updated);
    navigate({ to: "/payment", search: { tripId: id } });
  };

  const addActivity = (d: number) => {
    if (requirePremium()) return;
    const text = prompt("New activity / place:");
    if (!text) return;
    setDays((D) => D.map((x) => x.day === d ? { ...x, places: [...x.places, text] } : x));
  };
  const removeActivity = (d: number, i: number) => {
    if (requirePremium()) return;
    setDays((D) => D.map((x) => x.day === d ? { ...x, places: x.places.filter((_, k) => k !== i) } : x));
  };
  const editActivity = (d: number, i: number, v: string) => {
    if (!premium) return;
    setDays((D) => D.map((x) => x.day === d ? { ...x, places: x.places.map((a, k) => k === i ? v : a) } : x));
  };
  const editTime = (d: number, field: "pickupTime" | "dropTime", v: string) => {
    if (!premium) return;
    setDays((D) => D.map((x) => x.day === d ? { ...x, [field]: v } : x));
  };

  return (
    <Layout>
      <PremiumModal
        open={showPremium}
        onClose={() => { setShowPremium(false); setPrem(isPremium()); }}
      />
      <section className="gradient-ocean text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3"><MapPin className="h-7 w-7" /> Itinerary Planner</h1>
          <p className="mt-2 text-white/80">Professional day-by-day plans, just like real travel agencies.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="glass rounded-2xl p-5 flex flex-wrap items-end gap-3">
          <label className="flex-1 min-w-[200px]">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Destination</div>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2" />
          </label>
          <button onClick={generate} className="inline-flex items-center gap-2 rounded-full gradient-hero px-5 py-2.5 text-sm font-semibold text-white shadow-soft">
            <Sparkles className="h-4 w-4" /> Generate itinerary
          </button>
          {days.length > 0 && (
            <>
              <button onClick={save} className="inline-flex items-center gap-2 rounded-full bg-secondary text-secondary-foreground px-5 py-2.5 text-sm font-semibold">
                <Save className="h-4 w-4" /> Save trip
              </button>
              <Link
                to="/print/$tripId"
                params={{ tripId: trip?.id ?? "preview" }}
                onClick={(e) => { if (!trip) { e.preventDefault(); save(); } }}
                className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold"
              >
                <Printer className="h-4 w-4" /> Print / PDF
              </Link>
              <button onClick={goToPayment} className="inline-flex items-center gap-2 rounded-full gradient-sunset px-5 py-2.5 text-sm font-semibold text-white">
                <CreditCard className="h-4 w-4" /> Book & Pay
              </button>
            </>
          )}
        </div>

        {!premium && days.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-300/40 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-700" />
            <span><b>Viewing in free mode.</b> Editing, adding, or removing items is a Premium feature (₹3,000).</span>
            <button onClick={() => setShowPremium(true)} className="ml-auto rounded-full bg-amber-500 text-white px-3 py-1 font-semibold">Upgrade</button>
          </div>
        )}

        {trip && (trip.flight || trip.hotel) && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {trip.flight && (
              <Card icon={<Plane className="h-4 w-4" />} label="Flight">
                <b>{trip.flight.airline}</b> · {trip.flight.flightNo}
                <div className="text-xs text-muted-foreground">{trip.flight.from} {trip.flight.depart} → {trip.flight.to} {trip.flight.arrive}</div>
                {trip.returnFlight && (
                  <div className="mt-2 text-xs">
                    <b>Return:</b> {trip.returnFlight.from} {trip.returnFlight.depart} → {trip.returnFlight.to} {trip.returnFlight.arrive}
                  </div>
                )}
              </Card>
            )}
            {trip.hotel && (
              <Card icon={<HotelIcon className="h-4 w-4" />} label="Hotel">
                <b>{trip.hotel.name}</b>
                <div className="text-xs text-muted-foreground">★ {trip.hotel.rating} · ₹{trip.hotel.pricePerNight.toLocaleString("en-IN")}/night × {trip.nights ?? 3}</div>
                {trip.hotelGuests && <div className="text-xs">{trip.hotelGuests.rooms} {trip.hotelGuests.bedPreference} · {trip.hotelGuests.adults + trip.hotelGuests.children} guests</div>}
              </Card>
            )}
            {driver && (
              <Card icon={<Car className="h-4 w-4" />} label="Driver">
                <b>{driver.name}</b>
                <div className="text-xs text-muted-foreground">{driver.vehicle} · {driver.language}</div>
                <div className="text-xs font-mono">{driver.phone}</div>
              </Card>
            )}
          </div>
        )}

        {days.length === 0 ? (
          <div className="mt-10 text-center text-muted-foreground">
            <p>Pick a destination and tap <b>Generate itinerary</b> to start planning.</p>
            <p className="mt-2 text-sm">Or <Link to="/chat" className="text-primary underline">ask the AI assistant</Link> for personalized suggestions.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {days.map((d) => (
              <article key={d.day} className="bg-card rounded-2xl p-6 shadow-soft animate-fade-up border-l-4 border-primary">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold tracking-[0.2em] text-primary">DAY {d.day}</div>
                  <button
                    onClick={() => addActivity(d.day)}
                    className="text-xs inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 hover:bg-primary/10"
                  >
                    {premium ? <Plus className="h-3 w-3" /> : <Lock className="h-3 w-3" />} Add place
                  </button>
                </div>
                <h3 className="text-xl font-bold uppercase">{d.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{d.narrative}</p>

                <div className="mt-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">Places Covered</div>
                  <ul className="grid sm:grid-cols-2 gap-y-1.5">
                    {d.places.map((p, i) => (
                      <li key={i} className="flex items-center gap-2 group text-sm">
                        <span className="text-primary">•</span>
                        <input
                          value={p}
                          readOnly={!premium}
                          onChange={(e) => editActivity(d.day, i, e.target.value)}
                          className={`flex-1 bg-transparent outline-none border-b border-transparent ${premium ? "focus:border-primary" : "cursor-default"} py-0.5`}
                        />
                        <button
                          onClick={() => removeActivity(d.day, i)}
                          className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                          title={premium ? "Remove" : "Premium required"}
                        >
                          {premium ? <Trash2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                  <Meta label="Pickup Timing">
                    <input
                      value={d.pickupTime ?? ""}
                      readOnly={!premium}
                      onChange={(e) => editTime(d.day, "pickupTime", e.target.value)}
                      className="bg-transparent w-full font-semibold outline-none"
                    />
                  </Meta>
                  <Meta label="Drop Timing">
                    <input
                      value={d.dropTime ?? ""}
                      readOnly={!premium}
                      onChange={(e) => editTime(d.day, "dropTime", e.target.value)}
                      className="bg-transparent w-full font-semibold outline-none"
                    />
                  </Meta>
                  {d.dropLocation && <Meta label="Drop Location"><span className="font-semibold">{d.dropLocation}</span></Meta>}
                  <Meta label="Meals">
                    <span className="font-semibold">
                      {d.breakfast && "Breakfast: Included"}
                      {d.breakfast && d.dinner && " · "}
                      {d.dinner && "Dinner: Included"}
                      {!d.breakfast && !d.dinner && "—"}
                    </span>
                  </Meta>
                </div>

                {d.overnight && (
                  <div className="mt-4 text-center text-xs font-bold tracking-[0.2em] text-primary border-t pt-3">
                    {d.overnight}
                  </div>
                )}
              </article>
            ))}

            {/* Cost summary */}
            <article className="bg-card rounded-2xl p-6 shadow-glow border-t-4 border-accent">
              <h3 className="text-xl font-bold tracking-tight">FINAL COST SUMMARY</h3>
              <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
                <Row label="Flight Cost" value={cost.flight} />
                <Row label="Hotel Cost" value={cost.hotel} />
                <Row label="Cab Cost" value={cost.cab} />
                <Row label="Activities Cost" value={cost.activities} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-sm font-bold uppercase tracking-widest">Total Estimate</span>
                <span className="text-3xl font-bold text-primary">₹{cost.total.toLocaleString("en-IN")}</span>
              </div>
            </article>

            <div className="grid sm:grid-cols-2 gap-4">
              <List title="Inclusions" items={INCLUSIONS} />
              <List title="Exclusions" items={EXCLUSIONS} />
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}

function Card({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft">
      <div className="text-xs uppercase text-muted-foreground flex items-center gap-2">{icon}{label}</div>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}
function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2">
      <span>{label}</span>
      <span className="font-semibold">₹{value.toLocaleString("en-IN")}</span>
    </div>
  );
}
function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft">
      <h4 className="font-bold mb-2">{title}</h4>
      <ul className="space-y-1.5 text-sm">
        {items.map((i) => <li key={i} className="flex gap-2"><span className="text-primary">✓</span>{i}</li>)}
      </ul>
    </div>
  );
}