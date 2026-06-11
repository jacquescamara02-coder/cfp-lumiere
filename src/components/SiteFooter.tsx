import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/cfp-logo.png";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-brand-blue-deep text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-20 w-20 rounded-lg bg-white p-1.5" />
            <div>
              <div className="text-lg font-bold">{SITE.name}</div>
              <div className="text-xs uppercase tracking-wider text-white/70">Lubumbashi</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-white/75">
            {SITE.tagline}. Formations certifiées par le Ministère de la Formation et des Métiers.
          </p>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/60">Navigation</div>
          <ul className="space-y-2 text-sm text-white/85">
            <li><Link to="/" className="hover:text-accent">Accueil</Link></li>
            <li><Link to="/formations" className="hover:text-accent">Formations</Link></li>
            <li><Link to="/espace-formation" className="hover:text-accent">Espace Formation</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/60">Contact</div>
          <ul className="space-y-3 text-sm text-white/85">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{SITE.address}</span></li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /><a href={`tel:${SITE.phone}`} className="hover:text-accent">{SITE.phoneDisplay}</a></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /><a href={`mailto:${SITE.email}`} className="hover:text-accent">{SITE.email}</a></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/60">Horaires</div>
          <ul className="space-y-1 text-sm text-white/85">
            <li>Lun – Ven : 08h00 – 17h00</li>
            <li>Samedi : 09h00 – 13h00</li>
            <li>Dimanche : Fermé</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {SITE.longName}. Tous droits réservés.
      </div>
    </footer>
  );
}
