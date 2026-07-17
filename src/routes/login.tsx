import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { login } from "@/lib/auth";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import heroImg from "@/assets/hero-travel.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — VELORA" }, { name: "description", content: "Sign in to your VELORA travel account." }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      login(email, password, remember);
      nav({ to: "/" });
    } catch (err) {
      setError((err as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <section className="relative min-h-[80vh] grid place-items-center px-4 py-12">
        <img src={heroImg} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/70 via-primary/40 to-secondary/60" />

        <div className="w-full max-w-md glass rounded-3xl p-8 shadow-glow animate-fade-up">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to plan your next adventure.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field icon={<Mail className="h-4 w-4" />} label="Email">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent outline-none" placeholder="you@example.com" />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label="Password">
              <input type={showPw ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent outline-none" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(s => !s)} className="text-muted-foreground hover:text-foreground" aria-label="Toggle password visibility">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button disabled={loading} className="w-full rounded-xl gradient-hero py-3 font-semibold text-white shadow-glow flex items-center justify-center gap-2 disabled:opacity-60">
              <LogIn className="h-4 w-4" /> {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to VELORA? <Link to="/register" className="text-primary font-semibold hover:underline">Create an account</Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </div>
    </label>
  );
}