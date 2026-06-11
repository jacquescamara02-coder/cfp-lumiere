import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function BackHomeButton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const cls =
    variant === "light"
      ? "border-white/30 bg-white/10 text-white hover:bg-white hover:text-brand-blue-deep"
      : "border-border bg-card text-brand-blue-deep hover:bg-secondary";
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur transition-all hover:-translate-x-0.5 ${cls}`}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Retour à l'accueil
    </Link>
  );
}
