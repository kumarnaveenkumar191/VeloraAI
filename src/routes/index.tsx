import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { DESTINATIONS } from "@/data/destinations";
import { Plane, Hotel, Map, MessageCircle, Search, Sparkles, ArrowRight, Star } from "lucide-react";
import heroImg from "@/assets/hero-travel.jpg";
import { currentUser, type User } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VELORA — AI Travel Planner | Flights, Hotels, Itineraries" },
      { name: "description", content: "Plan your perfect trip with AI. Search flights, book hotels, and generate smart itineraries — all in one beautiful workspace." },
      { property: "og:title", content: "VELORA — AI Travel Planner" },
      { property: "og:description", content: "AI-powered flights, hotels, and itineraries." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Layout>
      <Hero />
      <Features />
      <PopularDestinations />
      <CTA />
    </Layout>
  );
}

function Hero() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { setUser(currentUser()); }, []);
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="Tropical paradise" width={1920} height={1280} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background" />
      </div>
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="max-w-3xl animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5" /> {user ? `Welcome back, ${user.name.split(" ")[0]}!` : "AI-Powered Travel Planning"}
          </span>
          <h1 className="mt-6 text-5xl sm:text-7xl font-bold tracking-tight text-white">
            Travel <span className="bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent">smarter</span>,<br />wander further.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl">
            {user
              ? "Pick up where you left off — your next adventure is one click away."
              : "Search flights, book hotels, and craft AI-generated itineraries for any destination — all in one stunning workspace."}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to={user ? "/flights" : "/login"} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-foreground shadow-glow hover:scale-[1.02] transition-transform">
              <Search className="h-4 w-4" /> {user ? "Search Flights" : "Get Started"}
            </Link>
            <Link to="/chat" className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 font-semibold text-white hover:bg-white/20 transition-colors">
              Ask AI Assistant <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { icon: Plane, title: "Smart Flight Search", desc: "Compare airlines, cabins, and stops in seconds." },
    { icon: Hotel, title: "Curated Hotels", desc: "Boutique stays and luxury resorts worldwide." },
    { icon: Map, title: "AI Itineraries", desc: "Day-by-day plans tailored to your taste." },
    { icon: MessageCircle, title: "Travel Concierge", desc: "Ask anything — visas, weather, hidden gems." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 -mt-20 relative z-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {feats.map((f, i) => (
          <div key={f.title} className="glass rounded-2xl p-6 shadow-soft animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-white shadow-glow">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PopularDestinations() {
  return (
    <section className="mx-auto max-w-7xl px-6 mt-24">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold">Trending destinations</h2>
          <p className="mt-2 text-muted-foreground">Handpicked escapes loved by VELORA travellers.</p>
        </div>
        <Link to="/hotels" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Explore all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DESTINATIONS.slice(0, 6).map((d) => (
          <Link
            key={d.code}
            to="/hotels"
            search={{ city: d.city }}
            className="group relative overflow-hidden rounded-2xl shadow-soft hover:shadow-glow transition-all hover:-translate-y-1"
          >
            <img src={d.image} alt={d.city} loading="lazy" className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{d.city}</h3>
                <span className="flex items-center gap-1 text-xs glass px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> 4.8
                </span>
              </div>
              <p className="text-sm text-white/80">{d.country}</p>
              <p className="mt-2 text-xs text-white/70">from ₹{d.fromPrice.toLocaleString("en-IN")}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 mt-24">
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 sm:p-16 text-white shadow-glow">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl animate-float" />
        <div className="relative max-w-2xl">
          <h2 className="text-3xl sm:text-5xl font-bold">Your next adventure is one prompt away.</h2>
          <p className="mt-4 text-white/85 text-lg">Tell our AI where you dream of going — get flights, hotels, and a full itinerary in seconds.</p>
          <Link to="/chat" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary hover:scale-[1.02] transition-transform">
            <Sparkles className="h-4 w-4" /> Start planning with AI
          </Link>
        </div>
      </div>
    </section>
  );
}
