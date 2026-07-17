import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { useRequireAuth } from "@/lib/route-guard";
import { PremiumModal } from "@/components/PremiumModal";
import { generateFlights, type Flight } from "@/data/mock";
import { DESTINATIONS } from "@/data/destinations";
import { saveTrip, tripQuotaReached } from "@/lib/trips";
import { Plane, Clock, ArrowRight, Filter, Users, ArrowLeftRight } from "lucide-react";

const search = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  date: z.string().optional(),
  returnDate: z.string().optional(),
  cabin: z.string().optional(),
  adults: z.number().optional(),
  children: z.number().optional(),
  infants: z.number().optional(),
  tripType: z.enum(["oneway", "round"]).optional(),
});

export const Route = createFileRoute("/flights")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Search Flights — VELORA" }, { name: "description", content: "Find and book one-way or round-trip flights worldwide." }] }),
  component: FlightsPage,
});

const CABINS = ["Economy", "Premium Economy", "Business", "First"];
const CITY_OPTIONS = DESTINATIONS.map((d) => d.city);

function FlightsPage() {
  useRequireAuth();
  const p = Route.useSearch();
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<"oneway" | "round">(p.tripType ?? "round");
  const [from, setFrom] = useState(p.from ?? "Bangalore");
  const [to, setTo] = useState(p.to ?? "Delhi");
  const [date, setDate] = useState(p.date ?? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [returnDate, setReturnDate] = useState(p.returnDate ?? new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10));
  const [cabin, setCabin] = useState(p.cabin ?? "Economy");
  const [adults, setAdults] = useState(p.adults ?? 1);
  const [children, setChildren] = useState(p.children ?? 0);
  const [infants, setInfants] = useState(p.infants ?? 0);
  const [sort, setSort] = useState<"cheap" | "fast" | "early">("cheap");
  const [maxStops, setMaxStops] = useState(2);
  const [showPremium, setShowPremium] = useState(false);
  const [outboundPick, setOutboundPick] = useState<Flight | null>(null);

  const totalPax = adults + children + infants;

  const outbound = useMemo(() => generateFlights(from, to, date, cabin), [from, to, date, cabin]);
  const returning = useMemo(() => generateFlights(to, from, returnDate, cabin), [from, to, returnDate, cabin]);

  const sortFn = (list: Flight[]) => {
    let f = list.filter((x) => x.stops <= maxStops);
    if (sort === "cheap") f = [...f].sort((a, b) => a.price - b.price);
    if (sort === "fast") f = [...f].sort((a, b) => a.durationMin - b.durationMin);
    if (sort === "early") f = [...f].sort((a, b) => a.depart.localeCompare(b.depart));
    return f;
  };

  const outFiltered = useMemo(() => sortFn(outbound), [outbound, sort, maxStops]);
  const retFiltered = useMemo(() => sortFn(returning), [returning, sort, maxStops]);

  const finalizeTrip = (flight: Flight, returnFlight?: Flight) => {
    if (tripQuotaReached()) { setShowPremium(true); return; }
    const id = `trip-${Date.now()}`;
    saveTrip({
      id, destination: to, createdAt: Date.now(),
      flight, returnFlight, tripType,
      passengers: { adults, children, infants, cabin },
    });
    navigate({ to: "/hotels", search: { city: to } });
  };

  const onSelect = (flight: Flight) => {
    if (tripType === "oneway") return finalizeTrip(flight);
    if (!outboundPick) { setOutboundPick(flight); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    finalizeTrip(outboundPick, flight);
  };

  const currentList = tripType === "oneway" || !outboundPick ? outFiltered : retFiltered;
  const currentLabel = tripType === "oneway"
    ? "ONGOING FLIGHT"
    : outboundPick ? "RETURN FLIGHT" : "ONGOING FLIGHT";
  const currentRoute = !outboundPick ? `${from} → ${to}` : `${to} → ${from}`;
  const currentDate = !outboundPick ? date : returnDate;

  return (
    <Layout>
      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      <section className="gradient-ocean text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold">Find your flight</h1>
          <p className="mt-2 text-white/80">One-way or round-trip — search smarter, fly happier.</p>

          <div className="mt-6 inline-flex rounded-full bg-white/10 p-1">
            {(["round", "oneway"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTripType(t); setOutboundPick(null); }}
                className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${tripType === t ? "bg-white text-primary" : "text-white"}`}
              >
                {t === "round" ? "Round Trip" : "One-way"}
              </button>
            ))}
          </div>

          <div className={`mt-4 glass rounded-2xl p-4 grid gap-3 sm:grid-cols-2 ${tripType === "round" ? "lg:grid-cols-7" : "lg:grid-cols-6"}`}>
            <CityInput label="From" value={from} onChange={setFrom} />
            <CityInput label="To" value={to} onChange={setTo} />
            <Field label="Departure"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent w-full outline-none text-sm" /></Field>
            {tripType === "round" && (
              <Field label="Return"><input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="bg-transparent w-full outline-none text-sm" /></Field>
            )}
            <Field label="Cabin">
              <select value={cabin} onChange={(e) => setCabin(e.target.value)} className="bg-transparent w-full outline-none text-sm">
                {CABINS.map((c) => <option key={c} className="text-foreground">{c}</option>)}
              </select>
            </Field>
            <PaxField adults={adults} children={children} infants={infants} setAdults={setAdults} setChildren={setChildren} setInfants={setInfants} />
            <button className="rounded-xl bg-white text-primary font-semibold py-3 hover:scale-[1.02] transition-transform">Search</button>
          </div>
          <p className="mt-3 text-xs text-white/80 flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Total passengers: <b>{totalPax}</b> · {adults} adult{adults !== 1 ? "s" : ""} · {children} child · {infants} infant</p>
        </div>
      </section>

      {/* Selection summary banner */}
      {tripType === "round" && (
        <div className="mx-auto max-w-7xl px-6 mt-6">
          <div className="rounded-2xl border bg-card p-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-2 font-semibold text-primary"><ArrowLeftRight className="h-4 w-4" /> Round Trip</span>
            <Leg label="ONGOING" route={`${from} → ${to}`} date={fmtDate(date)} flight={outboundPick} />
            <span className="text-muted-foreground">|</span>
            <Leg label="RETURN" route={`${to} → ${from}`} date={fmtDate(returnDate)} flight={null} pending={!outboundPick ? false : true} />
            {outboundPick && (
              <button onClick={() => setOutboundPick(null)} className="ml-auto text-xs text-muted-foreground underline">Change outbound</button>
            )}
          </div>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-6 py-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="space-y-6">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><Filter className="h-4 w-4" /> Sort</h3>
            {([["cheap", "Cheapest"], ["fast", "Fastest"], ["early", "Earliest"]] as const).map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer">
                <input type="radio" checked={sort === k} onChange={() => setSort(k)} /> {l}
              </label>
            ))}
            <h3 className="font-semibold mt-6 mb-2 text-sm">Max stops</h3>
            <input type="range" min={0} max={2} value={maxStops} onChange={(e) => setMaxStops(+e.target.value)} className="w-full" />
            <p className="text-xs text-muted-foreground">{maxStops === 0 ? "Non-stop only" : `Up to ${maxStops} stop${maxStops > 1 ? "s" : ""}`}</p>
          </div>
        </aside>
        <div className="space-y-4">
          <div>
            <h2 className="text-xs font-bold tracking-[0.2em] text-primary">{currentLabel}</h2>
            <p className="text-sm text-muted-foreground"><b className="text-foreground">{currentRoute}</b> · {fmtDate(currentDate)} · {currentList.length} flights</p>
          </div>
          {currentList.map((f, i) => (
            <div key={f.id} className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-glow transition-shadow animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Plane className="h-5 w-5" /></div>
                    <div>
                      <div className="font-semibold text-sm">{f.airline}</div>
                      <div className="text-xs text-muted-foreground">{f.flightNo} · {f.cabin}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center"><div className="text-2xl font-bold">{f.depart}</div><div className="text-xs text-muted-foreground">{f.from}</div></div>
                    <div className="flex-1 text-center">
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Clock className="h-3 w-3" />{Math.floor(f.durationMin/60)}h {f.durationMin%60}m</div>
                      <div className="relative my-1 h-px bg-border"><span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-primary" /></div>
                      <div className="text-xs text-muted-foreground">{f.stops === 0 ? "Non-stop" : `${f.stops} stop${f.stops>1?"s":""}`}</div>
                    </div>
                    <div className="text-center"><div className="text-2xl font-bold">{f.arrive}</div><div className="text-xs text-muted-foreground">{f.to}</div></div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5">🧳 {f.baggage}</span>
                    {f.meal && <span className="rounded-full bg-muted px-2 py-0.5">🍱 Meal included</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">₹{f.price.toLocaleString("en-IN")}</div>
                  <div className="text-xs text-muted-foreground mb-3">per traveller</div>
                  <button onClick={() => onSelect(f)} className="inline-flex items-center gap-1 rounded-full gradient-hero px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow">
                    {tripType === "round" && !outboundPick ? "Select outbound" : tripType === "round" ? "Select return" : "Select"} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

function fmtDate(d: string) {
  const x = new Date(d);
  return `${String(x.getDate()).padStart(2, "0")}/${String(x.getMonth() + 1).padStart(2, "0")}/${x.getFullYear()}`;
}

function Leg({ label, route, date, flight, pending }: { label: string; route: string; date: string; flight: Flight | null; pending?: boolean }) {
  return (
    <div className="text-xs">
      <div className="font-bold tracking-widest text-primary">{label}</div>
      <div className="font-semibold">{route}</div>
      <div className="text-muted-foreground">{date}</div>
      {flight ? (
        <div className="text-foreground">{flight.depart} → {flight.arrive} · {flight.airline}</div>
      ) : (
        <div className="text-muted-foreground italic">{pending ? "select below" : "—"}</div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="rounded-xl bg-white/15 border border-white/20 px-3 py-2 block">
      <div className="text-[10px] uppercase tracking-wider text-white/70">{label}</div>
      {children}
    </label>
  );
}
function CityInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <input list="cities" value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent w-full outline-none text-sm font-semibold placeholder:text-white/60" />
      <datalist id="cities">{CITY_OPTIONS.map((c) => <option key={c} value={c} />)}</datalist>
    </Field>
  );
}
function PaxField({ adults, children, infants, setAdults, setChildren, setInfants }: {
  adults: number; children: number; infants: number;
  setAdults: (n: number) => void; setChildren: (n: number) => void; setInfants: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-left">
        <div className="text-[10px] uppercase tracking-wider text-white/70">Passengers</div>
        <div className="text-sm font-semibold">{adults + children + infants} traveller{adults + children + infants !== 1 ? "s" : ""}</div>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-64 rounded-xl bg-card text-foreground shadow-glow p-4 space-y-3">
          <Counter label="Adults" hint="12+" value={adults} setValue={(v) => setAdults(Math.max(1, v))} />
          <Counter label="Children" hint="2-11" value={children} setValue={(v) => setChildren(Math.max(0, v))} />
          <Counter label="Infants" hint="<2" value={infants} setValue={(v) => setInfants(Math.max(0, v))} />
          <button type="button" onClick={() => setOpen(false)} className="w-full rounded-lg gradient-hero py-2 text-sm font-semibold text-white">Done</button>
        </div>
      )}
    </div>
  );
}
function Counter({ label, hint, value, setValue }: { label: string; hint: string; value: number; setValue: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div><div className="text-sm font-medium">{label}</div><div className="text-xs text-muted-foreground">{hint}</div></div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setValue(value - 1)} className="h-7 w-7 rounded-full border">-</button>
        <span className="w-6 text-center font-semibold">{value}</span>
        <button type="button" onClick={() => setValue(value + 1)} className="h-7 w-7 rounded-full border">+</button>
      </div>
    </div>
  );
}