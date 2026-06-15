import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/cfp-logo.png";
import { SITE } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/formations", label: "Formations" },
  { to: "/espace-formation", label: "Espace Formation" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="CFP Lumière" className="h-16 w-16 object-contain md:h-20 md:w-20" />
          <div className="leading-tight">
            <div className="text-2xl font-black tracking-tight text-brand-blue-deep md:text-3xl lg:text-4xl">{SITE.name}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground md:text-xs">
              Lubumbashi
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-blue-deep text-white"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {authed ? (
            <Button asChild size="sm" variant="outline">
              <Link to="/espace-formation">Mon espace</Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="bg-gradient-brand text-white shadow-card hover:opacity-95">
              <Link to="/auth">Se connecter</Link>
            </Button>
          )}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg p-2 text-foreground md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <Link to="/auth" className="rounded-lg bg-gradient-brand px-3 py-2 text-center text-sm font-semibold text-white">
              {authed ? "Mon espace" : "Se connecter"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
