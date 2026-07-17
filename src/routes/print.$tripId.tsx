import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { computeCost, getTrip, type Trip } from "@/lib/trips";
import { ensureItinerary, EXCLUSIONS, INCLUSIONS } from "@/lib/itinerary-generator";
import { getDriverForCity } from "@/data/mock";
import { currentUser, type User } from "@/lib/auth";
import { Printer, Sparkles } from "lucide-react";

export const Route = createFileRoute("/print/$tripId")({
  head: () => ({ meta: [{ title: "Travel Document — VELORA" }, { name: "robots", content: "noindex" }] }),
  component: PrintPage,
});

function PrintPage() {
  const { tripId } = Route.useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const t = getTrip(tripId);
    if (t) setTrip(ensureItinerary(t));
    setUser(currentUser());
  }, [tripId]);

  if (!trip) return <div className="p-10 text-center">Trip not found.</div>;

  const cost = trip.cost ?? computeCost(trip);
  const driver = getDriverForCity(trip.destination);
  const pax = trip.passengers;
  const totalPax = pax ? pax.adults + pax.children + pax.infants : 1;

  return (
    <div className="min-h-screen bg-muted/30 py-8 print:bg-white print:py-0">
      <div className="no-print sticky top-0 z-50 bg-card border-b shadow-soft mb-6">
        <div className="mx-auto max-w-4xl px-6 py-3 flex items-center justify-between">
          <div className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> VELORA Travel Document</div>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full gradient-hero px-4 py-2 text-sm font-semibold text-white">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-4xl bg-white text-slate-900 shadow-soft print-page print:shadow-none p-10 sm:p-14 rounded-2xl print:rounded-none">
        {/* Header */}
        <header className="flex items-start justify-between border-b-4 border-slate-900 pb-6">
          <div>
            <div className="text-3xl font-extrabold tracking-tight">VELORA</div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Premium Travel Planner</div>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold uppercase tracking-widest text-slate-500">Booking Document</div>
            <div className="mt-1 font-mono text-base font-bold">{trip.bookingId ?? "DRAFT"}</div>
            <div className="text-slate-500">Issued: {new Date(trip.createdAt).toLocaleDateString()}</div>
            {trip.paymentStatus === "paid" && <div className="mt-1 inline-block rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold text-[10px]">PAID</div>}
          </div>
        </header>

        {/* Customer */}
        <section className="mt-6 grid sm:grid-cols-2 gap-6 text-sm">
          <Block title="Customer">
            <div className="font-semibold">{trip.customerName ?? user?.name ?? "Guest Traveller"}</div>
            {user?.email && <div>{user.email}</div>}
            {user?.phone && <div>{user.phone}</div>}
          </Block>
          <Block title="Trip">
            <div className="font-semibold">Destination: {trip.destination}</div>
            <div>Passengers: {totalPax} ({pax?.adults ?? 1} adults · {pax?.children ?? 0} child · {pax?.infants ?? 0} infants)</div>
            <div>Cabin: {pax?.cabin ?? "Economy"}</div>
          </Block>
        </section>

        {/* Flight */}
        {trip.flight && (
          <Section title="Flight Details">
            <FlightRow tag="ONGOING FLIGHT" f={trip.flight} />
            {trip.returnFlight && <FlightRow tag="RETURN FLIGHT" f={trip.returnFlight} />}
          </Section>
        )}

        {/* Hotel */}
        {trip.hotel && (
          <Section title="Hotel Details">
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <Field k="Name" v={trip.hotel.name} />
              <Field k="Rating" v={`${trip.hotel.rating} ★`} />
              <Field k="Check-in" v={trip.checkIn ?? "—"} />
              <Field k="Check-out" v={trip.checkOut ?? "—"} />
              <Field k="Rooms" v={`${trip.hotelGuests?.rooms ?? 1} × ${trip.hotelGuests?.bedPreference ?? "Standard"}`} />
              <Field k="Nights" v={`${trip.nights ?? 3}`} />
            </div>
          </Section>
        )}

        {/* Driver */}
        {driver && (
          <Section title="Driver / Local Transport">
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <Field k="Driver Name" v={driver.name} />
              <Field k="Vehicle" v={driver.vehicle} />
              <Field k="Languages" v={driver.language} />
              <Field k="Contact" v={driver.phone} />
            </div>
          </Section>
        )}

        {/* Itinerary */}
        {trip.itinerary && trip.itinerary.length > 0 && (
          <Section title="Day-wise Itinerary">
            <div className="space-y-5">
              {trip.itinerary.map((d) => (
                <div key={d.day} className="border-l-4 border-slate-900 pl-4">
                  <div className="text-xs font-bold tracking-[0.2em] text-slate-500">DAY {d.day}</div>
                  <h3 className="text-base font-bold uppercase">{d.title}</h3>
                  <p className="mt-1 text-[13px] text-slate-700 leading-relaxed">{d.narrative}</p>
                  <div className="mt-2 text-[13px]">
                    <div className="font-bold uppercase text-[10px] tracking-wider text-slate-500">Places Covered</div>
                    <ul className="grid sm:grid-cols-2">
                      {d.places.map((p, i) => <li key={i}>• {p}</li>)}
                    </ul>
                  </div>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                    {d.pickupTime && <Field k="Pickup" v={d.pickupTime} />}
                    {d.dropTime && <Field k="Drop" v={d.dropTime} />}
                    {d.dropLocation && <Field k="Drop Location" v={d.dropLocation} />}
                    <Field k="Meals" v={[d.breakfast && "Breakfast", d.dinner && "Dinner"].filter(Boolean).join(" · ") || "—"} />
                  </div>
                  {d.overnight && <div className="mt-2 text-center text-[11px] font-bold tracking-[0.2em] text-slate-700 border-t border-slate-300 pt-2">{d.overnight}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Inclusions / Exclusions */}
        <Section title="Inclusions & Exclusions">
          <div className="grid sm:grid-cols-2 gap-6 text-[13px]">
            <div>
              <div className="font-bold mb-1">Inclusions</div>
              <ul className="space-y-1">{INCLUSIONS.map((i) => <li key={i}>✓ {i}</li>)}</ul>
            </div>
            <div>
              <div className="font-bold mb-1">Exclusions</div>
              <ul className="space-y-1">{EXCLUSIONS.map((i) => <li key={i}>✗ {i}</li>)}</ul>
            </div>
          </div>
        </Section>

        {/* Cost */}
        <Section title="Final Cost Estimate">
          <table className="w-full text-sm">
            <tbody>
              <Tr k="Flight Cost" v={cost.flight} />
              <Tr k="Hotel Cost" v={cost.hotel} />
              <Tr k="Cab Cost" v={cost.cab} />
              <Tr k="Activities Cost" v={cost.activities} />
              <tr className="border-t-2 border-slate-900">
                <td className="py-3 font-bold uppercase tracking-widest">Total Estimate</td>
                <td className="py-3 text-right text-xl font-extrabold">₹{cost.total.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-3 text-xs text-slate-500">Payment status: <b className="uppercase">{trip.paymentStatus ?? "pending"}</b>{trip.paymentMethod ? ` · via ${trip.paymentMethod.toUpperCase()}` : ""}</div>
        </Section>

        <footer className="mt-10 text-center text-[11px] text-slate-500 border-t pt-4">
          Thank you for choosing VELORA. For 24×7 support contact help@velora.travel · This is a system-generated document.
        </footer>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500 border-b border-slate-300 pb-1 mb-3">{title}</h2>
      {children}
    </section>
  );
}
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{k}</div>
      <div className="font-semibold">{v}</div>
    </div>
  );
}
function FlightRow({ tag, f }: { tag: string; f: NonNullable<Trip["flight"]> }) {
  return (
    <div className="border border-slate-300 rounded-lg p-3 mb-2 text-sm">
      <div className="text-[10px] font-bold tracking-[0.2em] text-slate-500">{tag}</div>
      <div className="font-bold">{f.from} → {f.to}</div>
      <div className="text-slate-700">{f.depart} → {f.arrive} · {f.airline} {f.flightNo} · {f.cabin}</div>
    </div>
  );
}
function Tr({ k, v }: { k: string; v: number }) {
  return (
    <tr className="border-b border-slate-200">
      <td className="py-2">{k}</td>
      <td className="py-2 text-right font-semibold">₹{v.toLocaleString("en-IN")}</td>
    </tr>
  );
}