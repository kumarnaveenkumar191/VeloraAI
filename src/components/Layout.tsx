import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { SplashScreen } from "./SplashScreen";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SplashScreen />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}