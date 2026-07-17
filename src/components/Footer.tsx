import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg gradient-hero text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            VELORA
          </div>
          <p className="mt-3 text-sm text-muted-foreground">AI-powered travel planning for the modern explorer.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Flights</li><li>Hotels</li><li>Itineraries</li><li>AI Assistant</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>About</li><li>Careers</li><li>Press</li><li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Privacy</li><li>Terms</li><li>Cookies</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} VELORA Travel. Crafted with wanderlust.
      </div>
    </footer>
  );
}