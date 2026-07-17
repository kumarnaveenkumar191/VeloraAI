import { findDestination } from "@/data/destinations";
import type { ItineraryDay, Trip } from "./trips";

export function generateProItinerary(city: string, days = 5): ItineraryDay[] {
  const d = findDestination(city);
  const places = d?.attractions ?? ["City Tour", "Heritage Walk", "Local Market"];
  const food = d?.food ?? ["Local cuisine"];
  const driverName = d?.driver.name ?? "Our local driver";
  const region = d?.region ?? "the region";

  const out: ItineraryDay[] = [
    {
      day: 1,
      title: `ARRIVAL IN ${city.toUpperCase()}`,
      narrative: `Today after arriving at ${city} Airport, our driver ${driverName} will receive you from the airport and assist you with local sightseeing before transferring you to your hotel for check-in.`,
      places: places.slice(0, 4),
      pickupTime: "09:00 AM",
      dropTime: "07:00 PM",
      dropLocation: `${city} City Hotel`,
      overnight: `OVERNIGHT STAY IN ${city.toUpperCase()} HOTEL`,
    },
    {
      day: 2,
      title: `${city.toUpperCase()} — ICONIC SIGHTSEEING`,
      narrative: `After breakfast at the hotel, proceed for a full-day guided tour covering the most iconic landmarks of ${city}. Enjoy a relaxed afternoon and a curated dinner featuring ${food[0]}.`,
      places: places.slice(0, 4),
      pickupTime: "08:30 AM",
      dropTime: "08:00 PM",
      dropLocation: `${city} City Hotel`,
      breakfast: true,
      dinner: true,
      overnight: `OVERNIGHT STAY IN ${city.toUpperCase()} HOTEL`,
    },
    {
      day: 3,
      title: `CULTURE & LOCAL LIFE`,
      narrative: `Today explore the cultural soul of ${region}. Visit traditional markets, heritage neighbourhoods, and savour authentic ${food[1] ?? food[0]} at a local favourite recommended by our team.`,
      places: (places[3] ? places.slice(2, 6) : places).slice(0, 4),
      pickupTime: "09:00 AM",
      dropTime: "06:30 PM",
      dropLocation: `${city} City Hotel`,
      breakfast: true,
      overnight: `OVERNIGHT STAY IN ${city.toUpperCase()} HOTEL`,
    },
    {
      day: 4,
      title: `HIDDEN GEMS & LEISURE`,
      narrative: `Discover hidden gems known only to locals. Spend the afternoon at leisure — ideal for the spa, shopping, or a quiet beachside walk. Farewell dinner featuring ${food[2] ?? food[0]}.`,
      places: places.slice(2, 6).length ? places.slice(2, 6) : places,
      pickupTime: "10:00 AM",
      dropTime: "09:00 PM",
      dropLocation: `${city} City Hotel`,
      breakfast: true,
      dinner: true,
      overnight: `OVERNIGHT STAY IN ${city.toUpperCase()} HOTEL`,
    },
    {
      day: 5,
      title: `DEPARTURE`,
      narrative: `After breakfast, our driver will transfer you to ${city} Airport for your onward journey. End of services with sweet memories of your trip.`,
      places: ["Souvenir shopping", "Hotel check-out", "Airport transfer"],
      pickupTime: "08:00 AM",
      dropTime: "11:30 AM",
      dropLocation: `${city} Airport`,
      breakfast: true,
      overnight: "BON VOYAGE ✈️",
    },
  ];

  return out.slice(0, days);
}

export const INCLUSIONS = [
  "Round-trip airport transfers in a private vehicle",
  "Daily breakfast at hotel (where indicated)",
  "All sightseeing as per itinerary with English-speaking driver",
  "Hotel accommodation on selected room category",
  "All applicable tolls, parking and driver allowance",
  "24x7 on-trip VELORA support",
];
export const EXCLUSIONS = [
  "International / domestic airfare unless purchased via VELORA",
  "Lunch and dinner not specifically mentioned in itinerary",
  "Personal expenses, tips, laundry and phone calls",
  "Travel insurance and visa fees",
  "Any monument entry fees, camera fees, joy rides",
  "Anything not mentioned under Inclusions",
];

export function ensureItinerary(t: Trip): Trip {
  if (t.itinerary && t.itinerary.length) return t;
  return { ...t, itinerary: generateProItinerary(t.destination, 5) };
}