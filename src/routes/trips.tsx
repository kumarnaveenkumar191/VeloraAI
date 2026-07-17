import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useRequireAuth } from "@/lib/route-guard";
import { deleteTrip, isPremium, listTrips, type Trip } from "@/lib/trips";
import { Briefcase, Plane, Hotel as HotelIcon, Trash2, Crown, Plus, Download, Car, CreditCard } from "lucide-react";

export const Route = createFileRoute("/trips")({
  head: () => ({ meta: [{ title: "My Trips — VELORA" }, { name: "description", content: "Manage all your saved trips and itineraries." }] }),
  component: TripsPage,
});

function TripsPage() {
  useRequireAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [premium, setPrem] = useState(false);
  useEffect(() => { setTrips(listTrips()); setPrem(isPremium()); }, []);

  const remove = (id: string) => {
    if (!confirm("Delete this trip?")) return;
    deleteTrip(id);
    setTrips(listTrips());
  };

  return (
    <Layout>
      <section className="gradient-hero text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3"><Briefcase className="h-7 w-7" /> My Trips</h1>
            <p className="mt-2 text-white/80">{trips.length} saved · {premium ? "Premium ✨" : `${Math.max(0, 3 - trips.length)} free trips remaining`}</p>
          </div>
          {premium && <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 text-amber-950 px-3 py-1 text-xs font-bold"><Crown className="h-3 w-3" /> Premium</span>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {trips.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <p className="text-muted-foreground">No trips yet. Start planning your first adventure.</p>
            <Link to="/flights" className="mt-4 inline-flex items-center gap-2 rounded-full gradient-hero px-5 py-2.5 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> Plan a trip
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((t) => (
              <div key={t.id} className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-glow transition-shadow animate-fade-up">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase text-muted-foreground flex items-center gap-2">
                      Trip to
                      {t.paymentStatus === "paid"
                        ? <span className="rounded-full bg-secondary/20 text-secondary px-2 py-0.5 text-[10px] font-bold">CONFIRMED</span>
                        : <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">DRAFT</span>}
                    </div>
                    <h3 className="text-xl font-bold">{t.destination}</h3>
                    {t.bookingId && <div className="text-[11px] font-mono text-muted-foreground">{t.bookingId}</div>}
                  </div>
                  <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {t.flight && <p className="flex items-center gap-2"><Plane className="h-4 w-4 text-primary" />{t.flight.airline} {t.flight.flightNo}{t.returnFlight ? " · + return" : ""}</p>}
                  {t.hotel && <p className="flex items-center gap-2"><HotelIcon className="h-4 w-4 text-primary" />{t.hotel.name}</p>}
                  {t.hotelGuests && <p className="flex items-center gap-2 text-muted-foreground"><Car className="h-4 w-4" />{t.hotelGuests.rooms} {t.hotelGuests.bedPreference} · driver included</p>}
                  {t.itinerary && <p className="text-muted-foreground">{t.itinerary.length}-day itinerary</p>}
                  {t.cost && <p className="font-semibold">Total: ₹{t.cost.total.toLocaleString("en-IN")}</p>}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link to="/itinerary" search={{ tripId: t.id }} className="inline-flex justify-center items-center gap-1 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground py-2 text-xs font-semibold transition-colors">
                    Open
                  </Link>
                  {t.paymentStatus === "paid" ? (
                    <Link to="/print/$tripId" params={{ tripId: t.id }} className="inline-flex justify-center items-center gap-1 rounded-full gradient-hero text-white py-2 text-xs font-semibold">
                      <Download className="h-3 w-3" /> PDF
                    </Link>
                  ) : (
                    <Link to="/payment" search={{ tripId: t.id }} className="inline-flex justify-center items-center gap-1 rounded-full gradient-sunset text-white py-2 text-xs font-semibold">
                      <CreditCard className="h-3 w-3" /> Pay
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}