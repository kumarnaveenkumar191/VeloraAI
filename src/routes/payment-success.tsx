import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { useRequireAuth } from "@/lib/route-guard";
import { getTrip, type Trip } from "@/lib/trips";
import { CheckCircle2, Download, Briefcase, Sparkles } from "lucide-react";

const search = z.object({ tripId: z.string() });

export const Route = createFileRoute("/payment-success")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "Payment successful — VELORA" }, { name: "description", content: "Your booking is confirmed." }] }),
  component: SuccessPage,
});

function SuccessPage() {
  useRequireAuth();
  const { tripId } = Route.useSearch();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [autoOpened, setAutoOpened] = useState(false);

  useEffect(() => { setTrip(getTrip(tripId) ?? null); }, [tripId]);

  useEffect(() => {
    if (trip && !autoOpened) {
      setAutoOpened(true);
      const t = setTimeout(() => {
        window.open(`/print/${trip.id}`, "_blank");
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [trip, autoOpened]);

  if (!trip) return (
    <Layout><div className="px-6 py-20 text-center text-muted-foreground">Loading receipt…</div></Layout>
  );

  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <div className="relative inline-grid h-24 w-24 place-items-center rounded-full bg-secondary text-white shadow-glow animate-splash-pop">
          <CheckCircle2 className="h-12 w-12" />
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-float" />
        </div>
        <h1 className="mt-6 text-4xl font-bold">Booking confirmed!</h1>
        <p className="mt-2 text-muted-foreground">Your trip to <b className="text-foreground">{trip.destination}</b> is all set. A copy of your receipt has been opened in a new tab.</p>

        <div className="mt-8 bg-card rounded-2xl p-6 shadow-soft text-left animate-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Booking ID</div>
              <div className="text-2xl font-mono font-bold">{trip.bookingId}</div>
            </div>
            <span className="rounded-full bg-secondary/20 text-secondary px-3 py-1 text-xs font-bold uppercase">{trip.paymentStatus}</span>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
            {trip.flight && <Line k="Outbound" v={`${trip.flight.airline} ${trip.flight.flightNo} · ${trip.flight.depart}`} />}
            {trip.returnFlight && <Line k="Return" v={`${trip.returnFlight.airline} ${trip.returnFlight.flightNo} · ${trip.returnFlight.depart}`} />}
            {trip.hotel && <Line k="Hotel" v={trip.hotel.name} />}
            {trip.passengers && <Line k="Passengers" v={`${trip.passengers.adults + trip.passengers.children + trip.passengers.infants} travellers`} />}
            {trip.cost && <Line k="Total Paid" v={`₹${trip.cost.total.toLocaleString("en-IN")}`} />}
            <Line k="Method" v={(trip.paymentMethod ?? "card").toUpperCase()} />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/print/$tripId" params={{ tripId: trip.id }} className="inline-flex items-center gap-2 rounded-full gradient-hero px-6 py-3 font-semibold text-white shadow-glow">
            <Download className="h-4 w-4" /> Download receipt (PDF)
          </Link>
          <Link to="/trips" className="inline-flex items-center gap-2 rounded-full border px-6 py-3 font-semibold">
            <Briefcase className="h-4 w-4" /> My trips
          </Link>
        </div>
      </section>
    </Layout>
  );
}
function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="font-semibold">{v}</div>
    </div>
  );
}