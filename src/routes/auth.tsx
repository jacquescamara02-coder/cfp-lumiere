import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Lock, Mail, User as UserIcon, Phone } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/cfp-logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion / Inscription — CFP Lumière" },
      { name: "description", content: "Accédez à votre espace de formation sécurisé CFP Lumière." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  password: z.string().min(8, "Minimum 8 caractères").max(72),
});
const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/espace-formation" });
    });
  }, [navigate]);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Connexion réussie");
    navigate({ to: "/espace-formation" });
  }

  async function onSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = signupSchema.safeParse(data);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
    setLoading(true);
    const redirectTo = `${window.location.origin}/espace-formation`;
    const { data: signupData, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: redirectTo,
        data: { full_name: parsed.data.full_name, phone: parsed.data.phone ?? "" },
      },
    });
    if (!error && signupData.user) {
      await supabase.from("profiles").upsert({
        id: signupData.user.id,
        full_name: parsed.data.full_name,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email,
      }, { onConflict: "id" });
    }
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Compte créé ! Votre accès aux vidéos sera activé par l'administrateur.");
    setTab("login");
  }


  return (
    <SiteLayout>
      <section className="relative min-h-[80vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8">
          <div className="hidden text-white md:block">
            <img src={logo} alt="" className="h-20 w-20 rounded-2xl bg-white p-2" />
            <h1 className="mt-6 text-4xl font-extrabold leading-tight">Espace sécurisé CFP Lumière</h1>
            <p className="mt-4 max-w-md text-white/85">
              Accédez à nos vidéos de formation. L'accès est validé par l'administrateur après votre inscription pour garantir un contenu réservé aux apprenants.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/85">
              <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-accent" /> Accès privé et chiffré</li>
              <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-accent" /> Validation administrateur</li>
              <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-accent" /> Contenu pédagogique exclusif</li>
            </ul>
          </div>

          <Card className="border-white/15 bg-white/95 shadow-elegant backdrop-blur">
            <CardContent className="p-7">
              <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="signup">Inscription</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={onLogin} className="mt-6 grid gap-4">
                    <Field id="email" name="email" type="email" label="Email" icon={Mail} required />
                    <Field id="password" name="password" type="password" label="Mot de passe" icon={Lock} required />
                    <Button type="submit" disabled={loading} size="lg" className="bg-gradient-brand text-white">
                      {loading ? "Connexion..." : "Se connecter"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={onSignup} className="mt-6 grid gap-4">
                    <Field id="full_name" name="full_name" label="Nom complet" icon={UserIcon} required />
                    <Field id="email" name="email" type="email" label="Email" icon={Mail} required />
                    <Field id="phone" name="phone" label="Téléphone (optionnel)" icon={Phone} />
                    <Field id="password" name="password" type="password" label="Mot de passe (8+ caractères)" icon={Lock} required />
                    <Button type="submit" disabled={loading} size="lg" className="bg-gradient-brand text-white">
                      {loading ? "Création..." : "Créer mon compte"}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      L'accès aux vidéos est activé par l'administrateur après vérification.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-4 text-center text-xs text-muted-foreground">
                <Link to="/" className="hover:text-accent">← Retour à l'accueil</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ id, name, label, type = "text", icon: Icon, required }: {
  id: string; name: string; label: string; type?: string; icon: typeof Lock; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={id} name={name} type={type} required={required} className="pl-9" />
      </div>
    </div>
  );
}
