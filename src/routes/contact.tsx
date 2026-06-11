import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, MapPin, Phone, Send, MessageCircle, Clock, ExternalLink } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { BackHomeButton } from "@/components/BackHomeButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SITE, whatsappUrl } from "@/lib/site";
import { FAQ } from "@/lib/formations";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CFP Lumière à Lubumbashi" },
      { name: "description", content: "Contactez le Centre de Formation Professionnelle Lumière à Lubumbashi. Avenue Lomami, +243 852 382 925." },
      { property: "og:title", content: "Contact — CFP Lumière" },
      { property: "og:description", content: "Avenue Lomami, Lubumbashi. Téléphone et WhatsApp +243 852 382 925." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Nom trop court").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message trop court (min 10 caractères)").max(2000),
});

function ContactPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <BackHomeButton />
          <div className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Contact</div>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Parlons de votre projet de formation</h1>
          <p className="mt-4 max-w-2xl text-white/85">
            Notre équipe vous répond rapidement. Choisissez le canal qui vous convient.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="border-border/60 shadow-card">
            <CardContent className="p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white"><MapPin className="h-6 w-6" /></div>
              <div className="mt-4 font-bold text-brand-blue-deep">Adresse</div>
              <p className="mt-1 text-sm text-muted-foreground">{SITE.address}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-card">
            <CardContent className="p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white"><Phone className="h-6 w-6" /></div>
              <div className="mt-4 font-bold text-brand-blue-deep">Téléphone & WhatsApp</div>
              <a href={`tel:${SITE.phone}`} className="mt-1 block text-sm text-muted-foreground hover:text-accent">{SITE.phoneDisplay}</a>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--whatsapp)] hover:underline">
                <MessageCircle className="h-4 w-4" /> Discuter sur WhatsApp
              </a>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-card">
            <CardContent className="p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white"><Clock className="h-6 w-6" /></div>
              <div className="mt-4 font-bold text-brand-blue-deep">Horaires</div>
              <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                <li>Lun – Ven : 08h00 – 17h00</li>
                <li>Samedi : 09h00 – 13h00</li>
                <li>Dimanche : Fermé</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <ContactForm />
          <MapCard />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20 md:px-8">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">FAQ</div>
          <h2 className="mt-3 text-3xl font-bold text-brand-blue-deep md:text-4xl">On répond à vos questions</h2>
        </div>
        <Accordion type="single" collapsible className="mt-8 space-y-3">
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`q-${i}`} className="overflow-hidden rounded-xl border border-border/60 bg-card px-5 shadow-card">
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-brand-blue-deep hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="pb-5 text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  );
}

function ContactForm() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    setLoading(false);
    if (error) {
      toast.error("Erreur d'envoi : " + error.message);
      return;
    }
    toast.success("Message envoyé ! Nous vous répondrons rapidement.");
    e.currentTarget.reset();
  }

  return (
    <Card className="border-border/60 shadow-elegant">
      <CardContent className="p-7">
        <h2 className="text-2xl font-bold text-brand-blue-deep">Écrivez-nous</h2>
        <p className="mt-1 text-sm text-muted-foreground">Réponse sous 24h en jours ouvrables.</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Nom complet *</Label>
              <Input id="full_name" name="full_name" required maxLength={100} placeholder="Votre nom" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required maxLength={255} placeholder="vous@exemple.com" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" maxLength={30} placeholder="+243 ..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject">Sujet</Label>
              <Input id="subject" name="subject" maxLength={150} placeholder="Demande d'information" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message *</Label>
            <Textarea id="message" name="message" required minLength={10} maxLength={2000} rows={6} placeholder="Parlez-nous de votre besoin de formation..." />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={loading} size="lg" className="bg-gradient-brand text-white shadow-card hover:opacity-95">
              <Send className="mr-2 h-4 w-4" /> {loading ? "Envoi..." : "Envoyer le message"}
            </Button>
            <Button asChild type="button" size="lg" variant="outline">
              <a href={`mailto:${SITE.email}`}><Mail className="mr-2 h-4 w-4" /> Email direct</a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function MapCard() {
  return (
    <Card className="overflow-hidden border-border/60 shadow-elegant">
      <div className="relative h-72 w-full bg-secondary md:h-full md:min-h-[420px]">
        <iframe
          title="Localisation CFP Lumière"
          src={SITE.mapEmbed}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <CardContent className="border-t border-border/60 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-bold text-brand-blue-deep">Centre-ville de Lubumbashi</div>
            <div className="text-xs text-muted-foreground">À 5 minutes de la Poste</div>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={SITE.mapLink} target="_blank" rel="noopener noreferrer">
              Ouvrir <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
