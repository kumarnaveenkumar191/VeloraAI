import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { useRequireAuth } from "@/lib/route-guard";
import { PremiumModal } from "@/components/PremiumModal";
import { generateHotels, getDriverForCity, type Hotel } from "@/data/mock";
import { DESTINATIONS } from "@/data/destinations";
import { listTrips, saveTrip, tripQuotaReached } from "@/lib/trips";
import { Star, MapPin, Wifi, Car, ArrowRight, Filter, BedDouble } from "lucide-react";

const search = z.object({ city: z.string().optional() });

export const Route = createFileRoute("/hotels")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Search Hotels — VELORA" }, { name: "description", content: "Discover boutique stays and luxury resorts worldwide." }] }),
  component: HotelsPage,
});

const BED_PREFS = ["King Bed", "Queen Bed", "Twin Beds", "Deluxe Suite"];

function HotelsPage() {
  useRequireAuth();
  const { city: initCity } = Route.useSearch();
  const navigate = useNavigate();
  const [city, setCity] = useState(initCity || "Goa");
  const [checkIn, setCheckIn] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [bedPref, setBedPref] = useState("King Bed");
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [showPremium, setShowPremium] = useState(false);

  const hotels = useMemo(() => generateHotels(city), [city]);
  const filtered = useMemo(() => hotels.filter((h) => h.rating >= minRating && h.pricePerNight <= maxPrice), [hotels, minRating, maxPrice]);
  const driver = getDriverForCity(city);
  const totalGuests = adults + children;
  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));

  const onBook = (hotel: Hotel) => {
    if (tripQuotaReached()) { setShowPremium(true); return; }
    const existing = listTrips().find((t) => t.destination === city && !t.hotel);
    const id = existing?.id ?? `trip-${Date.now()}`;
    saveTrip({
      id,
      destination: city,
      createdAt: existing?.createdAt ?? Date.now(),
      flight: existing?.flight,
      returnFlight: existing?.returnFlight,
      tripType: existing?.tripType,
      passengers: existing?.passengers,
      hotel,
      hotelGuests: { adults, children, rooms, bedPreference: bedPref },
      checkIn, checkOut, nights,
    });
    navigate({ to: "/itinerary", search: { tripId: id } });
  };

  return (
    <Layout>
      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      <section className="gradient-hero text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold">Stay where stories begin</h1>
          <p className="mt-2 text-white/80">Curated hotels with custom rooms and bed preferences.</p>
          <div className="mt-6 glass rounded-2xl p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            <SField label="City">
              <input list="cities2" value={city} onChange={(e) => setCity(e.target.value)} className="bg-transparent w-full outline-none text-sm font-semibold" />
              <datalist id="cities2">{DESTINATIONS.map((d) => <option key={d.code} value={d.city} />)}</datalist>
            </SField>
            <SField label="Check-in"><input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="bg-transparent w-full outline-none text-sm" /></SField>
            <SField label="Check-out"><input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="bg-transparent w-full outline-none text-sm" /></SField>
            <SField label="Adults"><input type="number" min={1} max={10} value={adults} onChange={(e) => setAdults(+e.target.value)} className="bg-transparent w-full outline-none text-sm" /></SField>
            <SField label="Children"><input type="number" min={0} max={10} value={children} onChange={(e) => setChildren(+e.target.value)} className="bg-transparent w-full outline-none text-sm" /></SField>
            <SField label="Rooms"><input type="number" min={1} max={6} value={rooms} onChange={(e) => setRooms(+e.target.value)} className="bg-transparent w-full outline-none text-sm" /></SField>
            <SField label="Bed preference">
              <select value={bedPref} onChange={(e) => setBedPref(e.target.value)} className="bg-transparent w-full outline-none text-sm">
                {BED_PREFS.map((b) => <option key={b} className="text-foreground">{b}</option>)}
              </select>
            </SField>
          </div>
          <p className="mt-3 text-xs text-white/80 flex flex-wrap items-center gap-3">
            <span>Guests: <b>{totalGuests}</b> ({adults} adults, {children} children)</span>
            <span>·</span>
            <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {rooms} {bedPref} room{rooms > 1 ? "s" : ""}</span>
            <span>·</span>
            <span>{nights} night{nights > 1 ? "s" : ""}</span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><Filter className="h-4 w-4" /> Filters</h3>
            <div className="text-sm font-medium mt-2">Min rating: {minRating.toFixed(1)}★</div>
            <input type="range" min={0} max={5} step={0.5} value={minRating} onChange={(e) => setMinRating(+e.target.value)} className="w-full" />
            <div className="text-sm font-medium mt-3">Max price: ₹{maxPrice.toLocaleString("en-IN")}</div>
            <input type="range" min={2000} max={25000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full" />
          </div>
          {driver && (
            <div className="rounded-2xl gradient-sunset text-white p-5 shadow-soft">
              <div className="text-xs uppercase tracking-widest opacity-80">Local driver included</div>
              <h4 className="mt-1 font-bold text-lg">{driver.name}</h4>
              <p className="text-sm opacity-90 mt-1 flex items-center gap-2"><Car className="h-4 w-4" />{driver.vehicle}</p>
              <p className="text-sm opacity-90">{driver.language}</p>
              <p className="text-sm font-mono mt-2">{driver.phone}</p>
            </div>
          )}
        </aside>
        <div className="grid gap-5 sm:grid-cols-2">
          {filtered.map((h, i) => (
            <div key={h.id} className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-all hover:-translate-y-0.5 animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
              <img src={h.image} alt={h.name} loading="lazy" className="h-48 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold leading-tight">{h.name}</h3>
                  <span className="flex items-center gap-1 text-sm bg-secondary/15 text-secondary-foreground px-2 py-0.5 rounded-full font-semibold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{h.rating}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{h.distance}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {h.amenities.slice(0, 4).map((a) => (
                    <span key={a} className="text-[11px] bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                      {a === "Free Wi-Fi" && <Wifi className="h-3 w-3" />}{a}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold">₹{(h.pricePerNight * nights * rooms).toLocaleString("en-IN")}</div>
                    <div className="text-xs text-muted-foreground">total · ₹{h.pricePerNight.toLocaleString("en-IN")}/night × {nights} × {rooms}</div>
                  </div>
                  <button onClick={() => onBook(h)} className="inline-flex items-center gap-1 rounded-full gradient-hero px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-glow">
                    Book <ArrowRight className="h-4 w-4" />
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

function SField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="rounded-xl bg-white/15 border border-white/20 px-3 py-2 block">
      <div className="text-[10px] uppercase tracking-wider text-white/70">{label}</div>
      {children}
    </label>
  );
}