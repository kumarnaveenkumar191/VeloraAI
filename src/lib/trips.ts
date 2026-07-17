import type { Flight, Hotel } from "@/data/mock";

export type ItineraryDay = {
  day: number;
  title: string;
  narrative: string;
  places: string[];
  pickupTime?: string;
  dropTime?: string;
  dropLocation?: string;
  breakfast?: boolean;
  dinner?: boolean;
  overnight?: string;
  activities?: string[]; // legacy free-form
};

export type Passengers = {
  adults: number;
  children: number;
  infants: number;
  cabin: string;
};
export type HotelGuests = {
  adults: number;
  children: number;
  rooms: number;
  bedPreference: string;
};
export type CostBreakdown = {
  flight: number;
  hotel: number;
  cab: number;
  activities: number;
  total: number;
};
export type Trip = {
  id: string;
  destination: string;
  createdAt: number;
  flight?: Flight;
  returnFlight?: Flight;
  tripType?: "oneway" | "round";
  passengers?: Passengers;
  hotel?: Hotel;
  hotelGuests?: HotelGuests;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  itinerary?: ItineraryDay[];
  customerName?: string;
  bookingId?: string;
  paymentStatus?: "pending" | "paid";
  paymentMethod?: string;
  cost?: CostBreakdown;
};

const KEY = "velora.trips.v1";
const PREM = "velora.premium.v1";

export function listTrips(): Trip[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function saveTrip(t: Trip) {
  if (typeof window === "undefined") return;
  const all = listTrips();
  const idx = all.findIndex((x) => x.id === t.id);
  if (idx >= 0) all[idx] = t; else all.unshift(t);
  localStorage.setItem(KEY, JSON.stringify(all));
}
export function deleteTrip(id: string) {
  localStorage.setItem(KEY, JSON.stringify(listTrips().filter((t) => t.id !== id)));
}
export function getTrip(id: string) {
  return listTrips().find((t) => t.id === id);
}
export function isPremium() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PREM) === "1";
}
export function setPremium(v: boolean) {
  localStorage.setItem(PREM, v ? "1" : "0");
}
export function tripQuotaReached() {
  return !isPremium() && listTrips().length >= 3;
}

export function computeCost(t: Trip): CostBreakdown {
  const pax = (t.passengers?.adults ?? 1) + (t.passengers?.children ?? 0) * 0.5;
  const flight = Math.round(((t.flight?.price ?? 0) + (t.returnFlight?.price ?? 0)) * Math.max(1, pax));
  const nights = t.nights ?? 3;
  const rooms = t.hotelGuests?.rooms ?? 1;
  const hotel = (t.hotel?.pricePerNight ?? 0) * nights * rooms;
  const cab = 5000;
  const activities = 8000;
  return { flight, hotel, cab, activities, total: flight + hotel + cab + activities };
}