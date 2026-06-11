import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Home, Phone } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FORMATIONS } from "@/lib/formations";
import { FORMATION_IMAGES } from "@/lib/formation-images";
import { whatsappUrl, SITE } from "@/lib/site";

export const Route = createFileRoute("/formations/$key")({
  loader: ({ params }) => {
    const formation = FORMATIONS.find((f) => f.key === params.key);
    if (!formation) throw notFound();
    return { formation };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.formation.title} — Formation CFP Lumière` },
          { name: "description", content: loaderData.formation.description },
          { property: "og:title", content: `${loaderData.formation.title} — CFP Lumière` },
          { property: "og:description", content: loaderData.formation.description },
          { property: "og:image", content: FORMATION_IMAGES[loaderData.formation.key] },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-24 text-center md:px-8">
        <h1 className="text-3xl font-bold text-brand-blue-deep">Domaine introuvable</h1>
        <p className="mt-3 text-muted-foreground">Ce domaine de formation n'existe pas ou a été déplacé.</p>
        <Button asChild className="mt-6 bg-gradient-brand text-white">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" /> Retour à l'accueil
          </Link>
        </Button>
      </section>
    </SiteLayout>
  ),
  errorComponent: ({ reset }) => (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-24 text-center md:px-8">
        <h1 className="text-3xl font-bold text-brand-blue-deep">Une erreur est survenue</h1>
        <Button onClick={reset} className="mt-6">Réessayer</Button>
      </section>
    </SiteLayout>
  ),
  component: FormationDetail,
});

function FormationDetail() {
  const { formation } = Route.useLoaderData();
  const img = FORMATION_IMAGES[formation.key];
  const Icon = formation.icon;

  return (
    <SiteLayout>
      {/* Hero with image */}
      <section className="relative overflow-hidden bg-brand-blue-deep text-white">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue-deep via-brand-blue-deep/85 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-white hover:bg-white/10">
            <Link to="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Retour à l'accueil
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-white shadow-elegant">
              <Icon className="h-7 w-7" />
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Domaine de formation</div>
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">{formation.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">{formation.description}</p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold text-brand-blue-deep">Au programme</h2>
            <p className="mt-3 text-muted-foreground">
              Modules pratiques et progressifs, animés par nos formateurs experts. Possibilité de suivre la
              formation dans nos locaux à Lubumbashi ou directement en entreprise.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {formation.topics.map((t) => (
                <li key={t} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-card">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span className="text-sm font-medium text-foreground/90">{t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-brand text-white shadow-elegant">
                <Link to="/contact">S'inscrire à cette formation</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={whatsappUrl(`Bonjour, je souhaite des informations sur la formation "${formation.title}".`)} target="_blank" rel="noopener noreferrer">
                  <Phone className="mr-1.5 h-4 w-4" /> WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/">
                  <Home className="mr-1.5 h-4 w-4" /> Retour à l'accueil
                </Link>
              </Button>
            </div>
          </div>

          <aside className="space-y-4">
            <Card className="overflow-hidden border-border/60 shadow-elegant">
              <img src={img} alt={formation.title} loading="lazy" width={1024} height={1024} className="h-56 w-full object-cover" />
              <CardContent className="p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Centre</div>
                <div className="mt-1 font-bold text-brand-blue-deep">CFP Lumière — Lubumbashi</div>
                <p className="mt-2 text-sm text-muted-foreground">{SITE.addressShort}</p>
                <p className="mt-1 text-sm text-muted-foreground">{SITE.phoneDisplay}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-card">
              <CardContent className="p-5">
                <div className="text-xs uppercase tracking-wider text-accent">Bon à savoir</div>
                <ul className="mt-3 space-y-2 text-sm text-foreground/85">
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />Certification reconnue par le Ministère</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />Formation en présentiel ou en entreprise</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />Accès à l'espace vidéo sécurisé</li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
