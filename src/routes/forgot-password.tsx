import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { requestPasswordReset } from "@/lib/auth";
import { Mail, Check } from "lucide-react";
import heroImg from "@/assets/hero-travel.jpg";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — VELORA" }, { name: "description", content: "Reset your VELORA password." }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setSent(true);
  };

  return (
    <Layout>
      <section className="relative min-h-[80vh] grid place-items-center px-4 py-12">
        <img src={heroImg} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/70 via-secondary/50 to-primary/70" />
        <div className="w-full max-w-md glass rounded-3xl p-8 shadow-glow animate-fade-up">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-secondary text-white mb-4"><Check className="h-7 w-7" /></div>
              <h1 className="text-2xl font-bold">Check your inbox</h1>
              <p className="text-sm text-muted-foreground mt-2">If an account exists for <b>{email}</b>, you'll receive a reset link shortly.</p>
              <Link to="/login" className="mt-6 inline-flex rounded-full gradient-hero px-5 py-2.5 text-sm font-semibold text-white">Back to login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center">Forgot your password?</h1>
              <p className="text-sm text-muted-foreground mt-1 text-center">Enter your email and we'll send a reset link.</p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Email</div>
                  <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent outline-none" placeholder="you@example.com" />
                  </div>
                </label>
                <button disabled={loading} className="w-full rounded-xl gradient-hero py-3 font-semibold text-white shadow-glow disabled:opacity-60">
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remembered it? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}