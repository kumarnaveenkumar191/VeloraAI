import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { register } from "@/lib/auth";
import { UserPlus, Mail, Lock, User as UserIcon, Phone, Eye, EyeOff } from "lucide-react";
import heroImg from "@/assets/hero-travel.jpg";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — VELORA" }, { name: "description", content: "Join VELORA to plan, book and manage your trips." }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      register({ name, email, phone, password });
      nav({ to: "/" });
    } catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <section className="relative min-h-[80vh] grid place-items-center px-4 py-12">
        <img src={heroImg} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-secondary/70 via-primary/50 to-primary/70" />

        <div className="w-full max-w-md glass rounded-3xl p-8 shadow-glow animate-fade-up">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Start planning premium trips in seconds.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-3">
            <F icon={<UserIcon className="h-4 w-4" />} label="Full name"><input required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent outline-none" placeholder="Jane Traveller" /></F>
            <F icon={<Mail className="h-4 w-4" />} label="Email"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent outline-none" placeholder="you@example.com" /></F>
            <F icon={<Phone className="h-4 w-4" />} label="Phone"><input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-transparent outline-none" placeholder="+91 98765 43210" /></F>
            <F icon={<Lock className="h-4 w-4" />} label="Password">
              <input type={showPw ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent outline-none" placeholder="At least 6 characters" />
              <button type="button" onClick={() => setShowPw(s => !s)} className="text-muted-foreground hover:text-foreground">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </F>
            <F icon={<Lock className="h-4 w-4" />} label="Confirm password">
              <input type={showCp ? "text" : "password"} required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full bg-transparent outline-none" placeholder="Re-enter password" />
              <button type="button" onClick={() => setShowCp(s => !s)} className="text-muted-foreground hover:text-foreground">{showCp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </F>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button disabled={loading} className="w-full rounded-xl gradient-hero py-3 font-semibold text-white shadow-glow flex items-center justify-center gap-2 disabled:opacity-60">
              <UserPlus className="h-4 w-4" /> {loading ? "Creating…" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}

function F({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
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