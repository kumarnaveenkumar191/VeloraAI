import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { currentUser, type User } from "@/lib/auth";

/**
 * Client-side auth guard. Returns the current user once resolved, otherwise
 * redirects to /login (preserving the current path as ?redirect=...).
 */
export function useRequireAuth(): { user: User | null; ready: boolean } {
  const nav = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = currentUser();
    if (!u) {
      nav({ to: "/login", search: { redirect: location.pathname } as never });
      return;
    }
    setUser(u);
    setReady(true);
  }, [nav, location.pathname]);

  return { user, ready };
}