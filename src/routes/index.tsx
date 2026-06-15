import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Award, CheckCircle2, GraduationCap, MapPin, Phone, ShieldCheck, Star, Users2, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FORMATIONS, TESTIMONIALS, FAQ } from "@/lib/formations";
import { SITE, whatsappUrl } from "@/lib/site";
import heroAsset from "@/assets/hero-classroom-real.jpg.asset.json";
import logo from "@/assets/cfp-logo.png";
const hero = heroAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CFP Lumière — Formations professionnelles certifiées à Lubumbashi" },
      { name: "description", content: "Centre de Formation Professionnelle Lumière (EDCP) : gestion, informatique, journalisme, leadership et plus. Certifié Ministère de la Formation et des Métiers." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <Stats />
      <About />
      <FormationsPreview />
      <WhyUs />
      <Testimonials />
      <FaqSection />
      <CallToAction />
    </SiteLayout>
  );
}

function CountUp({ end, suffix = "", duration = 1600, delay = 0 }: { end: number; suffix?: string; duration?: number; delay?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now() + delay;
      let raf = 0;
      const tick = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        const eased = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(end * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && run());
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [end, duration, delay]);
  return <span ref={ref}>{val}{suffix}</span>;
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: `url(${hero})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-gradient-hero opacity-85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.12),_transparent_60%)]" />
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-accent/40 blur-3xl animate-hero-glow" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-brand-blue/40 blur-3xl animate-hero-glow" style={{ animationDelay: "1.5s" }} />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-6 pb-20 md:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.85fr)] md:px-8 md:pt-10 md:pb-28">
        <div className="min-w-0 text-white">
          <div className="mb-4 -mt-2 max-w-[min(100%,30rem)] overflow-hidden rounded-full border border-white/25 bg-white/10 backdrop-blur animate-hero-rise [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" style={{ animationDelay: "0ms" }}>
            <div className="flex w-max gap-8 whitespace-nowrap py-2 animate-marquee">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="flex items-center gap-2 px-4 text-sm font-semibold tracking-wide text-white">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="uppercase text-accent">Juin 2026</span>
                  <span className="text-white/90">Excel appliqué à l'agronomie</span>
                </span>
              ))}
            </div>
          </div>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-[2.85rem] lg:text-6xl xl:text-7xl animate-hero-rise" style={{ animationDelay: "120ms" }}>
            Venez développer vos <span className="text-accent">compétences,</span>
            <br />
            et forger votre <span className="underline decoration-accent decoration-4 underline-offset-[6px]">avenir</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/85 animate-hero-rise" style={{ animationDelay: "260ms" }}>
            {"\n"}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-hero-rise" style={{ animationDelay: "400ms" }}>
            <Button asChild size="lg" className="bg-accent text-white shadow-elegant transition-transform hover:-translate-y-0.5 hover:bg-[var(--brand-red-deep)]">
              <Link to="/formations">Voir nos formations <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur transition-transform hover:-translate-y-0.5 hover:bg-white hover:text-brand-blue-deep">
              <Link to="/contact">Nous contacter</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80 animate-hero-rise" style={{ animationDelay: "540ms" }}>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" />Av. Lomami, impasse derrière la cour d'Appel de Lubumbashi</span>
            <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" />{SITE.phoneDisplay}</span>
          </div>
        </div>

        <div className="relative hidden md:block animate-hero-rise" style={{ animationDelay: "300ms" }}>
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-accent/30 blur-3xl animate-hero-glow" />
          <div className="relative rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-elegant animate-hero-float">
            <img src={logo} alt="Logo CFP Lumière" className="mx-auto h-32 w-32 rounded-2xl bg-white p-3" />
            <div className="mt-5 text-center text-white">
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">Espace de Développement</div>
              <div className="mt-1 text-2xl font-bold">des Compétences Professionnelles</div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-white">
              {[
                { v: 12, suffix: "+", l: "Domaines" },
                { v: 500, suffix: "+", l: "Apprenants" },
                { v: 10, suffix: "+", l: "Ans d'expertise" },
              ].map((s, i) => (
                <div key={s.l} className="rounded-xl bg-white/10 p-3 transition-transform hover:-translate-y-0.5">
                  <div className="text-xl font-extrabold text-accent">
                    <CountUp end={s.v} suffix={s.suffix} delay={i * 200} />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-white/70">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { icon: GraduationCap, v: 12, suffix: "", l: "Domaines de formation" },
    { icon: Users2, v: 500, suffix: "+", l: "Apprenants formés" },
    { icon: Award, v: 100, suffix: "%", l: "Certifiées Ministère" },
    { icon: ShieldCheck, v: 10, suffix: "+", l: "Années d'expertise" },
  ];
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 md:px-8">
        {items.map((s, i) => (
          <div
            key={s.l}
            className="flex items-center gap-3 animate-hero-rise"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white shadow-elegant transition-transform duration-300 hover:scale-110 hover:rotate-3">
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-brand-blue-deep">
                <CountUp end={s.v} suffix={s.suffix} delay={i * 150} />
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8" id="apropos">
      <div className="grid items-start gap-12 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">À propos</div>
          <h2 className="mt-3 text-4xl font-bold text-brand-blue-deep md:text-5xl">Préambule</h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Dans un monde où les techniques de production, d'apprentissage et les méthodes de gestion varient à la
            vitesse lumière, <strong>CFP Lumière</strong> s'interpose entre les demandeurs d'emploi et les entreprises
            pour proposer des solutions en matière d'employabilité qualifiée locale.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Considérant que l'ignorance de formations adéquates est la cause principale de l'incompétence locale,
            nous avons placé le Centre de Formation Professionnelle « LUMIÈRE » comme solution <em>managériale</em> et
            <em> technique</em> au titre d'employés compétents.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Un consortium de formateurs experts assure une formation sur mesure aux jeunes filles, jeunes garçons et
            travailleurs d'entreprises pour les remettre à niveau et les préparer à affronter les défis de leur domaine.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { t: "Sur mesure", d: "Formations adaptées au besoin de l'apprenant, elle peut se dérouler en entreprise ou dans nos locaux." },
            { t: "Pédagogie\u00a0", d: "Approches par compétence et par objectif." },
            { t: "Encadrement expert", d: "Consortium de formateurs qualifiés." },
            { t: "Certification reconnue", d: "Validée par le Ministère de la Formation et des Métiers de la RDC." },
          ].map((c) => (
            <Card key={c.t} className="border-border/60 shadow-card">
              <CardContent className="p-5">
                <CheckCircle2 className="h-6 w-6 text-accent" />
                <div className="mt-3 font-bold text-brand-blue-deep">{c.t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FormationsPreview() {
  const top = FORMATIONS.slice(0, 6);
  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Nos domaines</div>
            <h2 className="mt-3 text-4xl font-bold text-brand-blue-deep md:text-5xl">Formations phares</h2>
          </div>
          <Button asChild className="shrink-0 bg-red-600 text-white shadow-elegant hover:bg-red-700 focus-visible:ring-red-600">
            <Link to="/formations">Toutes les formations <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((f) => (
            <Card key={f.key} className="group border-border/60 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant">
              <CardContent className="p-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-brand-blue-deep">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {f.topics.slice(0, 4).map((t) => (
                    <li key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">{t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const reasons = [
    { t: "Certification Ministérielle", d: "Vos diplômes sont reconnus par l'État congolais — un vrai gage de crédibilité auprès des employeurs." },
    { t: "Approche par compétence", d: "Méthodologie moderne centrée sur l'apprenant, ses besoins et son projet professionnel." },
    { t: "Formateurs experts", d: "Un consortium de professionnels expérimentés dans leur domaine respectif." },
    { t: "Plateforme vidéo sécurisée", d: "Accès privé à nos vidéos de formation, validé par l'administrateur." },
    { t: "Sur le terrain", d: "Formations en entreprise possibles — directement sur votre lieu de travail." },
    { t: "Suivi post-formation", d: "Accompagnement personnalisé après la formation pour maximiser votre insertion." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Pourquoi nous choisir</div>
        <h2 className="mt-3 text-4xl font-bold text-brand-blue-deep md:text-5xl">L'excellence au service de votre carrière</h2>
        <p className="mt-4 text-muted-foreground">Six raisons qui font de CFP Lumière le partenaire de référence à Lubumbashi.</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {reasons.map((r, i) => (
          <Card key={r.t} className="relative overflow-hidden border-border/60 shadow-card">
            <div className="absolute -right-6 -top-6 grid h-20 w-20 place-items-center rounded-full bg-gradient-brand text-2xl font-extrabold text-white/30">
              0{i + 1}
            </div>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-brand-blue-deep">{r.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.d}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <section className="overflow-hidden bg-brand-blue-deep py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Témoignages</div>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl">Ce que disent nos apprenants</h2>
        </div>
      </div>
      <div className="relative mt-12 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max gap-5 animate-marquee">
          {loop.map((t, i) => (
            <Card key={i} className="w-[340px] shrink-0 border-white/15 bg-white/5 text-white backdrop-blur">
              <CardContent className="p-6">
                <div className="flex gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/85">« {t.text} »</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand font-bold">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-white/60">{t.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 md:px-8">
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">FAQ</div>
        <h2 className="mt-3 text-4xl font-bold text-brand-blue-deep md:text-5xl">Questions fréquentes</h2>
      </div>
      <Accordion type="single" collapsible className="mt-10 space-y-3">
        {FAQ.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="overflow-hidden rounded-xl border border-border/60 bg-card px-5 shadow-card">
            <AccordionTrigger className="py-5 text-left text-base font-semibold text-brand-blue-deep hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 md:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 text-white shadow-elegant md:p-16">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: `url(${hero})`, backgroundSize: "cover" }} />
        <div className="relative grid items-center gap-8 md:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold md:text-5xl">Prêt à booster votre carrière ?</h2>
            <p className="mt-3 max-w-2xl text-white/85">
              Inscrivez-vous dès maintenant ou contactez-nous via WhatsApp pour un échange personnalisé.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <Button asChild size="lg" className="bg-accent text-white shadow-elegant hover:bg-[var(--brand-red-deep)]">
              <Link to="/contact">S'inscrire</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-brand-blue-deep">
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">Discuter sur WhatsApp</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
