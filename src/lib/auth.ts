export type User = { name: string; email: string; phone: string };

const USERS = "velora.users.v1";
const SESSION = "velora.session.v1";

type StoredUser = User & { password: string };

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(USERS) || "[]"); } catch { return []; }
}
function writeUsers(u: StoredUser[]) {
  localStorage.setItem(USERS, JSON.stringify(u));
}

// trivial obfuscation only — this is a demo, NOT real password hashing.
function hash(p: string) {
  let h = 0;
  for (let i = 0; i < p.length; i++) h = (h << 5) - h + p.charCodeAt(i);
  return `v1:${h}`;
}

export function register(input: { name: string; email: string; phone: string; password: string }) {
  const users = readUsers();
  if (users.find((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("An account already exists with that email.");
  }
  users.push({ name: input.name, email: input.email, phone: input.phone, password: hash(input.password) });
  writeUsers(users);
  setSession({ name: input.name, email: input.email, phone: input.phone });
}

export function login(email: string, password: string, remember = true) {
  const u = readUsers().find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!u || u.password !== hash(password)) throw new Error("Invalid email or password.");
  setSession({ name: u.name, email: u.email, phone: u.phone }, remember);
}

export function setSession(user: User, remember = true) {
  const store = remember ? localStorage : sessionStorage;
  store.setItem(SESSION, JSON.stringify(user));
}

export function currentUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION) ?? sessionStorage.getItem(SESSION);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function logout() {
  localStorage.removeItem(SESSION);
  sessionStorage.removeItem(SESSION);
}

export function requestPasswordReset(_email: string) {
  // demo only — pretend an email was sent
  return new Promise<void>((r) => setTimeout(r, 800));
}