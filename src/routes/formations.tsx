import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FORMATIONS } from "@/lib/formations";
import { FORMATION_IMAGES } from "@/lib/formation-images";
import { whatsappUrl } from "@/lib/site";
import business from "@/assets/training-business.jpg";
import tech from "@/assets/training-tech.jpg";
import journalism from "@/assets/training-journalism.jpg";

export const Route = createFileRoute("/formations")({
  head: () => ({
    meta: [
      { title: "Formations — CFP Lumière" },
      { name: "description", content: "Catalogue complet des formations CFP Lumière : gestion, informatique, journalisme, statistique, leadership, agriculture et plus." },
      { property: "og:title", content: "Formations professionnelles — CFP Lumière" },
      { property: "og:description", content: "Découvrez tous nos domaines de formation certifiés à Lubumbashi." },
    ],
  }),
  component: FormationsPage,
});

const FEATURED = [
  { img: business, title: "Gestion & Entreprise", desc: "Gestion commerciale, gestion d'entreprise, comptabilité et finance." },
  { img: tech, title: "Informatique & Web", desc: "Bureautique, création de sites web, développement logiciel." },
  { img: journalism, title: "Journalisme & Médias", desc: "Reportage, rédaction, éthique du journalisme moderne." },
];

function FormationsPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Notre catalogue</div>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            12 domaines pour bâtir des <span className="text-accent">carrières solides</span>
          </h1>
          <p className="mt-5 max-w-2xl text-white/85">
            Nos formations couvrent les domaines managériaux et techniques essentiels au marché du travail congolais
            et international. Données en entreprise ou dans nos locaux.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="text-2xl font-bold text-brand-blue-deep">À la une</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {FEATURED.map((f) => (
            <Card key={f.title} className="group overflow-hidden border-border/60 shadow-card">
              <div className="relative h-56 overflow-hidden">
                <img src={f.img} alt={f.title} loading="lazy" width={1200} height={800} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-deep/80 to-transparent" />
                <h3 className="absolute bottom-4 left-5 text-xl font-bold text-white">{f.title}</h3>
              </div>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="text-2xl font-bold text-brand-blue-deep">Tous nos domaines</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FORMATIONS.map((f) => (
              <Card key={f.key} className="border-border/60 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant">
                <CardContent className="p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-brand-blue-deep">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                  <ul className="mt-4 space-y-1.5">
                    {f.topics.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="rounded-3xl bg-gradient-brand p-10 text-white shadow-elegant md:p-14">
          <div className="grid items-center gap-6 md:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Vous ne trouvez pas votre domaine ?</h2>
              <p className="mt-2 text-white/90">Nos cycles sont non-exhaustifs. Parlons de votre besoin pour bâtir une formation sur mesure.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Button asChild size="lg" className="bg-white text-brand-blue-deep hover:bg-white/90">
                <Link to="/contact">Demander un devis <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-brand-blue-deep">
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
