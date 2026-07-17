export type Destination = {
  city: string;
  country: string;
  code: string;
  region: "India" | "Asia" | "Europe" | "Middle East";
  image: string;
  blurb: string;
  fromPrice: number;
  attractions: string[];
  driver: { name: string; phone: string; vehicle: string; language: string };
  food: string[];
};

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=1200&q=70`;

export const DESTINATIONS: Destination[] = [
  {
    city: "Goa", country: "India", code: "GOI", region: "India",
    image: img("photo-1512343879784-a960bf40e7f2"),
    blurb: "Sun-soaked beaches, Portuguese charm, sunset shacks.",
    fromPrice: 8499,
    attractions: ["Baga Beach", "Fort Aguada", "Dudhsagar Falls", "Anjuna Flea Market", "Basilica of Bom Jesus", "Chapora Fort"],
    driver: { name: "Rohan Naik", phone: "+91 98221 45032", vehicle: "Toyota Innova Crysta", language: "Hindi, Konkani, English" },
    food: ["Goan Fish Curry", "Pork Vindaloo", "Bebinca", "Prawn Balchão"],
  },
  {
    city: "Tokyo", country: "Japan", code: "HND", region: "Asia",
    image: img("photo-1540959733332-eab4deabeeaf"),
    blurb: "Neon nights, ancient shrines, world-class ramen.",
    fromPrice: 42500,
    attractions: ["Shibuya Crossing", "Senso-ji Temple", "Meiji Shrine", "teamLab Planets", "Tokyo Skytree", "Tsukiji Outer Market"],
    driver: { name: "Haruto Tanaka", phone: "+81 90-1234-5678", vehicle: "Toyota Alphard", language: "Japanese, English" },
    food: ["Tonkotsu Ramen", "Sushi Omakase", "Okonomiyaki", "Matcha Wagashi"],
  },
  {
    city: "Bangkok", country: "Thailand", code: "BKK", region: "Asia",
    image: img("photo-1508009603885-50cf7c579365"),
    blurb: "Street food, golden temples, rooftop skylines.",
    fromPrice: 18900,
    attractions: ["Grand Palace", "Wat Arun", "Chatuchak Market", "Khao San Road", "Chao Phraya River Cruise", "Wat Pho"],
    driver: { name: "Somchai Pranee", phone: "+66 81-234-5678", vehicle: "Toyota Commuter Van", language: "Thai, English" },
    food: ["Pad Thai", "Tom Yum Goong", "Mango Sticky Rice", "Som Tam"],
  },
  {
    city: "Dubai", country: "UAE", code: "DXB", region: "Middle East",
    image: img("photo-1512453979798-5ea266f8880c"),
    blurb: "Skyscrapers, desert dunes, gold-souk glamour.",
    fromPrice: 22500,
    attractions: ["Burj Khalifa", "Desert Safari", "Dubai Mall Fountain", "Palm Jumeirah", "Old Dubai Souks", "Museum of the Future"],
    driver: { name: "Khalid Al-Mansoori", phone: "+971 50 123 4567", vehicle: "Lexus LX 600", language: "Arabic, English, Hindi" },
    food: ["Shawarma", "Machboos", "Luqaimat", "Karak Chai"],
  },
  {
    city: "Paris", country: "France", code: "CDG", region: "Europe",
    image: img("photo-1502602898657-3e91760cbb34"),
    blurb: "Boulevards, boulangeries, and the Eiffel Tower.",
    fromPrice: 58900,
    attractions: ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Montmartre", "Seine River Cruise", "Palace of Versailles"],
    driver: { name: "Julien Moreau", phone: "+33 6 12 34 56 78", vehicle: "Mercedes V-Class", language: "French, English" },
    food: ["Croissant", "Steak Frites", "Macarons", "Coq au Vin"],
  },
  {
    city: "London", country: "United Kingdom", code: "LHR", region: "Europe",
    image: img("photo-1513635269975-59663e0ac1ad"),
    blurb: "Royal heritage, double-deckers, world-class theatre.",
    fromPrice: 56200,
    attractions: ["Tower of London", "British Museum", "London Eye", "Westminster Abbey", "Camden Market", "Borough Market"],
    driver: { name: "Oliver Bennett", phone: "+44 7700 900123", vehicle: "Range Rover Vogue", language: "English" },
    food: ["Fish & Chips", "Sunday Roast", "Afternoon Tea", "Sticky Toffee Pudding"],
  },
  {
    city: "Singapore", country: "Singapore", code: "SIN", region: "Asia",
    image: img("photo-1525625293386-3f8f99389edd"),
    blurb: "Garden city, hawker heaven, futuristic skyline.",
    fromPrice: 28500,
    attractions: ["Marina Bay Sands", "Gardens by the Bay", "Sentosa Island", "Universal Studios", "Chinatown", "Singapore Zoo"],
    driver: { name: "Wei Ming Tan", phone: "+65 9123 4567", vehicle: "Toyota Vellfire", language: "English, Mandarin, Malay" },
    food: ["Hainanese Chicken Rice", "Chili Crab", "Laksa", "Kaya Toast"],
  },
  {
    city: "Delhi", country: "India", code: "DEL", region: "India",
    image: img("photo-1587474260584-136574528ed5"),
    blurb: "Mughal monuments, chaotic charm, legendary chaat.",
    fromPrice: 5400,
    attractions: ["Red Fort", "India Gate", "Qutub Minar", "Humayun's Tomb", "Chandni Chowk", "Lotus Temple"],
    driver: { name: "Vikram Singh", phone: "+91 98109 87654", vehicle: "Maruti Ertiga", language: "Hindi, English, Punjabi" },
    food: ["Chole Bhature", "Butter Chicken", "Paranthas", "Daulat ki Chaat"],
  },
  {
    city: "Mumbai", country: "India", code: "BOM", region: "India",
    image: img("photo-1570168007204-dfb528c6958f"),
    blurb: "Bollywood, vada pav, and the spirit of dreams.",
    fromPrice: 6200,
    attractions: ["Gateway of India", "Marine Drive", "Elephanta Caves", "Colaba Causeway", "Bandra-Worli Sea Link", "Siddhivinayak Temple"],
    driver: { name: "Sanjay Patil", phone: "+91 98201 23456", vehicle: "Hyundai Aura", language: "Hindi, Marathi, English" },
    food: ["Vada Pav", "Pav Bhaji", "Bombay Sandwich", "Bhel Puri"],
  },
  {
    city: "Bangalore", country: "India", code: "BLR", region: "India",
    image: img("photo-1596176530529-78163a4f7af2"),
    blurb: "Garden city, tech hub, craft-beer capital of India.",
    fromPrice: 5800,
    attractions: ["Lalbagh Botanical Garden", "Cubbon Park", "Bangalore Palace", "Vidhana Soudha", "Nandi Hills", "UB City"],
    driver: { name: "Karthik Reddy", phone: "+91 98450 12345", vehicle: "Honda Amaze", language: "Kannada, English, Hindi" },
    food: ["Masala Dosa", "Bisi Bele Bath", "Mysore Pak", "Filter Coffee"],
  },
];

export const findDestination = (q: string) =>
  DESTINATIONS.find((d) => d.city.toLowerCase().includes(q.toLowerCase()));