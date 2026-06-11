import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Lock, LogOut, PlayCircle, Clock, Filter, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { SITE, whatsappUrl } from "@/lib/site";

export const Route = createFileRoute("/espace-formation")({
  head: () => ({
    meta: [
      { title: "Espace Formation Sécurisé — CFP Lumière" },
      { name: "description", content: "Espace de formation vidéo réservé aux apprenants validés par l'administrateur." },
    ],
  }),
  component: EspacePage,
});

type Profile = { id: string; full_name: string | null; access_granted: boolean };
type Training = { id: string; title: string; description: string | null; category: string; video_url: string; thumbnail_url: string | null; duration_minutes: number | null; published: boolean; created_at: string };

function EspacePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    (async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;
      setUser(u);
      if (!u) { setLoading(false); return; }
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, access_granted").eq("id", u.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", u.id).eq("role", "admin").maybeSingle(),
      ]);
      setProfile(p as Profile | null);
      setIsAdmin(!!r);
      setLoading(false);
    })();
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Déconnecté");
    navigate({ to: "/" });
  }

  if (loading) return <SiteLayout><LoadingState /></SiteLayout>;
  if (!user) return <SiteLayout><NotLoggedIn /></SiteLayout>;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-hero text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10 md:px-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Espace privé</div>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Bienvenue {profile?.full_name ?? user.email}</h1>
            <p className="mt-1 text-sm text-white/80">
              {isAdmin ? "Vous êtes administrateur." : profile?.access_granted ? "Votre accès aux vidéos est actif." : "Votre compte est en attente de validation."}
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-white">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </span>
            )}
            <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-brand-blue-deep" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Déconnexion
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        {isAdmin ? (
          <Tabs defaultValue="videos">
            <TabsList>
              <TabsTrigger value="videos">Vidéos</TabsTrigger>
              <TabsTrigger value="users">Membres & accès</TabsTrigger>
            </TabsList>
            <TabsContent value="videos" className="mt-6">
              <VideoLibrary isAdmin />
            </TabsContent>
            <TabsContent value="users" className="mt-6">
              <UsersAdmin />
            </TabsContent>
          </Tabs>
        ) : profile?.access_granted ? (
          <VideoLibrary />
        ) : (
          <AccessPending />
        )}
      </section>
    </SiteLayout>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 text-center">
      <div className="text-muted-foreground">Chargement de votre espace...</div>
    </div>
  );
}

function NotLoggedIn() {
  return (
    <section className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 text-center">
      <Card className="w-full border-border/60 shadow-elegant">
        <CardContent className="p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-white">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-brand-blue-deep">Accès sécurisé</h2>
          <p className="mt-2 text-muted-foreground">
            Cet espace est réservé aux apprenants validés. Connectez-vous ou créez un compte gratuitement.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-gradient-brand text-white"><Link to="/auth">Se connecter / S'inscrire</Link></Button>
            <Button asChild size="lg" variant="outline"><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">Contacter l'admin</a></Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function AccessPending() {
  return (
    <Card className="border-border/60 shadow-elegant">
      <CardContent className="p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent/15 text-accent">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-brand-blue-deep">Compte en attente de validation</h2>
        <p className="mt-2 max-w-xl text-muted-foreground mx-auto">
          Merci pour votre inscription. Un administrateur va valider votre accès à l'espace vidéo. Vous pouvez nous contacter directement via WhatsApp pour accélérer la procédure.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild className="bg-[var(--whatsapp)] text-white hover:opacity-90">
            <a href={whatsappUrl(`Bonjour, je viens de créer un compte sur la plateforme CFP Lumière. Pouvez-vous valider mon accès ? (${SITE.name})`)} target="_blank" rel="noopener noreferrer">Activer mon accès via WhatsApp</a>
          </Button>
          <Button asChild variant="outline"><Link to="/formations">Explorer les formations</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VideoLibrary({ isAdmin = false }: { isAdmin?: boolean }) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [active, setActive] = useState<Training | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("trainings").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setTrainings((data as Training[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const categories = Array.from(new Set(trainings.map((t) => t.category)));
  const filtered = category === "all" ? trainings : trainings.filter((t) => t.category === category);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-blue-deep">Bibliothèque vidéo</h2>
          <p className="text-sm text-muted-foreground">{trainings.length} vidéo(s) disponible(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="all">Toutes catégories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {isAdmin && <AdminAddVideo onCreated={load} />}
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-muted-foreground">Chargement des vidéos...</p>
      ) : filtered.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="p-10 text-center">
            <PlayCircle className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <p className="mt-3 text-muted-foreground">Aucune vidéo pour le moment.</p>
            {isAdmin && <p className="mt-1 text-sm text-muted-foreground">Cliquez sur « Ajouter une vidéo » pour publier votre premier contenu.</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Card key={t.id} className="group overflow-hidden border-border/60 shadow-card transition-all hover:shadow-elegant">
              <button onClick={() => setActive(t)} className="block w-full text-left">
                <div className="relative aspect-video bg-brand-blue-deep">
                  {t.thumbnail_url ? (
                    <img src={t.thumbnail_url} alt={t.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-brand" />
                  )}
                  <div className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <PlayCircle className="h-14 w-14 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent">{t.category}</div>
                  <h3 className="mt-1 font-bold text-brand-blue-deep">{t.title}</h3>
                  {t.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>}
                  {t.duration_minutes && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {t.duration_minutes} min</div>
                  )}
                </div>
              </button>
              {isAdmin && (
                <div className="border-t p-3">
                  <Button variant="outline" size="sm" className="w-full" onClick={async () => {
                    if (!confirm("Supprimer cette vidéo ?")) return;
                    const { error } = await supabase.from("trainings").delete().eq("id", t.id);
                    if (error) return toast.error(error.message);
                    toast.success("Vidéo supprimée"); load();
                  }}>Supprimer</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="text-brand-blue-deep">{active.title}</DialogTitle>
              </DialogHeader>
              <VideoPlayer url={active.video_url} />
              {active.description && <p className="mt-2 text-sm text-muted-foreground">{active.description}</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VideoPlayer({ url }: { url: string }) {
  const embed = toEmbedUrl(url);
  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe src={embed} title="Vidéo" className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
    );
  }
  return (
    <video controls className="aspect-video w-full rounded-lg bg-black">
      <source src={url} />
    </video>
  );
}

function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch { /* not a URL */ }
  return null;
}

function AdminAddVideo({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.from("trainings").insert({
      title: String(f.get("title") ?? "").trim(),
      description: String(f.get("description") ?? "").trim() || null,
      category: String(f.get("category") ?? "Général").trim(),
      video_url: String(f.get("video_url") ?? "").trim(),
      thumbnail_url: String(f.get("thumbnail_url") ?? "").trim() || null,
      duration_minutes: f.get("duration") ? Number(f.get("duration")) : null,
      published: true,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Vidéo ajoutée");
    setOpen(false);
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-brand text-white">+ Ajouter une vidéo</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nouvelle vidéo</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div><Label>Titre *</Label><Input name="title" required maxLength={200} /></div>
          <div><Label>Catégorie *</Label><Input name="category" required defaultValue="Général" maxLength={80} /></div>
          <div><Label>URL vidéo (YouTube, Vimeo ou mp4) *</Label><Input name="video_url" required type="url" /></div>
          <div><Label>URL miniature (optionnel)</Label><Input name="thumbnail_url" type="url" /></div>
          <div><Label>Durée (minutes)</Label><Input name="duration" type="number" min={1} /></div>
          <div><Label>Description</Label><Textarea name="description" rows={3} maxLength={1000} /></div>
          <Button type="submit" disabled={loading} className="bg-gradient-brand text-white">{loading ? "Création..." : "Publier"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UsersAdmin() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("id, full_name, access_granted").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setUsers((data as Profile[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggle(p: Profile) {
    const { error } = await supabase.from("profiles").update({ access_granted: !p.access_granted }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(p.access_granted ? "Accès retiré" : "Accès accordé");
    load();
  }

  return (
    <Card className="border-border/60 shadow-card">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-brand-blue-deep">Gestion des accès apprenants</h2>
        <p className="mt-1 text-sm text-muted-foreground">Activez ou désactivez l'accès aux vidéos pour chaque inscrit.</p>
        {loading ? <p className="mt-6 text-muted-foreground">Chargement...</p> : users.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Aucun inscrit pour le moment.</p>
        ) : (
          <div className="mt-6 divide-y divide-border">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-foreground">{u.full_name ?? "(sans nom)"}</div>
                  <div className="text-xs text-muted-foreground">{u.id.slice(0, 8)}…</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.access_granted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {u.access_granted ? "Actif" : "En attente"}
                  </span>
                  <Button size="sm" variant={u.access_granted ? "outline" : "default"} onClick={() => toggle(u)} className={u.access_granted ? "" : "bg-gradient-brand text-white"}>
                    {u.access_granted ? "Retirer" : "Accorder"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
