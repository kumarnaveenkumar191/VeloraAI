import { DESTINATIONS, type Destination } from "./destinations";

const AIRLINES = [
  { name: "IndiGo", code: "6E" },
  { name: "Air India", code: "AI" },
  { name: "Emirates", code: "EK" },
  { name: "Singapore Airlines", code: "SQ" },
  { name: "Lufthansa", code: "LH" },
  { name: "Qatar Airways", code: "QR" },
  { name: "Vistara", code: "UK" },
  { name: "Thai Airways", code: "TG" },
];

export type Flight = {
  id: string;
  airline: string;
  code: string;
  flightNo: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  durationMin: number;
  stops: number;
  cabin: string;
  price: number;
  baggage: string;
  meal: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");
const fmtTime = (h: number, m: number) => `${pad(h)}:${pad(m)}`;

function seedRand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateFlights(from: string, to: string, date: string, cabin = "Economy"): Flight[] {
  const r = seedRand(`${from}-${to}-${date}-${cabin}`);
  return Array.from({ length: 8 }).map((_, i) => {
    const a = AIRLINES[Math.floor(r() * AIRLINES.length)];
    const dh = Math.floor(r() * 22);
    const dm = Math.floor(r() * 60);
    const dur = 90 + Math.floor(r() * 700);
    const arriveTotal = dh * 60 + dm + dur;
    const ah = Math.floor(arriveTotal / 60) % 24;
    const am = arriveTotal % 60;
    const stops = r() > 0.55 ? 0 : r() > 0.4 ? 1 : 2;
    const base = 3500 + Math.floor(r() * 35000);
    const cabinMult = cabin === "Business" ? 3.4 : cabin === "Premium Economy" ? 1.7 : cabin === "First" ? 5.2 : 1;
    return {
      id: `${a.code}-${i}-${date}`,
      airline: a.name,
      code: a.code,
      flightNo: `${a.code} ${100 + Math.floor(r() * 8900)}`,
      from, to, depart: fmtTime(dh, dm), arrive: fmtTime(ah, am),
      durationMin: dur, stops, cabin,
      price: Math.round(base * cabinMult),
      baggage: cabin === "Economy" ? "15kg check-in + 7kg cabin" : "30kg check-in + 10kg cabin",
      meal: r() > 0.3,
    };
  });
}

export type Hotel = {
  id: string;
  name: string;
  image: string;
  city: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  amenities: string[];
  distance: string;
};

const HOTEL_PREFIXES = ["The Grand", "Aurora", "Velora", "Royal", "Skyline", "Marina", "Heritage", "Serenity", "Lotus", "Crown"];
const HOTEL_SUFFIXES = ["Resort & Spa", "Boutique Hotel", "Bay Suites", "Palace", "Residency", "Retreat", "Garden Hotel", "Plaza", "Inn", "Towers"];
const AMENITIES = ["Free Wi-Fi", "Pool", "Spa", "Gym", "Breakfast", "Airport Shuttle", "Beach Access", "Restaurant", "Bar", "Parking", "Pet Friendly", "Concierge"];
const HOTEL_IMAGES = [
  "photo-1566073771259-6a8506099945",
  "photo-1542314831-068cd1dbfeeb",
  "photo-1551882547-ff40c63fe5fa",
  "photo-1520250497591-112f2f40a3f4",
  "photo-1564501049412-61c2a3083791",
  "photo-1571003123894-1f0594d2b5d9",
];

export function generateHotels(city: string): Hotel[] {
  const r = seedRand(`hotel-${city}`);
  return Array.from({ length: 9 }).map((_, i) => {
    const name = `${HOTEL_PREFIXES[i % HOTEL_PREFIXES.length]} ${city} ${HOTEL_SUFFIXES[Math.floor(r() * HOTEL_SUFFIXES.length)]}`;
    const rating = +(3.5 + r() * 1.5).toFixed(1);
    const amen: string[] = [];
    const pool = [...AMENITIES];
    const count = 4 + Math.floor(r() * 5);
    for (let k = 0; k < count; k++) amen.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    return {
      id: `h-${city}-${i}`,
      name,
      image: `https://images.unsplash.com/${HOTEL_IMAGES[i % HOTEL_IMAGES.length]}?auto=format&fit=crop&w=900&q=70`,
      city,
      rating,
      reviews: 120 + Math.floor(r() * 4200),
      pricePerNight: 2200 + Math.floor(r() * 18000),
      amenities: amen,
      distance: `${(0.4 + r() * 6).toFixed(1)} km from city center`,
    };
  });
}

export function getDriverForCity(city: string): Destination["driver"] | null {
  return DESTINATIONS.find((d) => d.city.toLowerCase() === city.toLowerCase())?.driver ?? null;
}