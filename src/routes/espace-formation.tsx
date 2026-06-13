import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  ShieldCheck, Lock, LogOut, PlayCircle, Clock, Filter, Sparkles, Video, Users2,
  Megaphone, BarChart3, Radio, Trash2, UserX, UserCheck, ExternalLink, Search,
  Calendar, Copy, BookOpen,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { BackHomeButton } from "@/components/BackHomeButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { SITE, whatsappUrl } from "@/lib/site";
import { deleteLearnerAccount } from "@/lib/admin.functions";

export const Route = createFileRoute("/espace-formation")({
  head: () => ({
    meta: [
      { title: "Espace Formation Sécurisé — CFP Lumière" },
      { name: "description", content: "Espace de formation vidéo & live réservé aux apprenants validés par l'administrateur." },
    ],
  }),
  component: EspacePage,
});

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  access_granted: boolean;
  status: string;
  created_at?: string;
};
type Training = {
  id: string; title: string; description: string | null; category: string;
  video_url: string; thumbnail_url: string | null; duration_minutes: number | null;
  published: boolean; created_at: string;
  level: string | null; format: string; instructor: string | null;
  prerequisites: string | null; system_requirements: string | null; resources_url: string | null;
};
type LiveSession = {
  id: string; title: string; description: string | null; category: string;
  platform: string; join_url: string; host_name: string | null;
  scheduled_at: string; duration_minutes: number | null; status: string; created_at: string;
};
type Announcement = { id: string; title: string; body: string; created_at: string };
type Enrollment = { id: string; user_id: string; training_id: string; status: string; enrolled_at: string };

function EspacePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function refresh(u: User | null) {
    if (!u) return;
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, phone, access_granted, status, created_at").eq("id", u.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", u.id).eq("role", "admin").maybeSingle(),
    ]);
    setProfile(p as Profile | null);
    setIsAdmin(!!r);
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    (async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;
      setUser(u);
      await refresh(u);
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

  const suspended = profile?.status === "suspended";

  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-hero text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10 md:px-8">
          <div>
            <BackHomeButton />
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {isAdmin ? "Tableau de bord administrateur" : "Espace apprenant"}
            </div>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Bienvenue {profile?.full_name ?? user.email}</h1>
            <p className="mt-1 text-sm text-white/80">
              {isAdmin
                ? "Pilotez les formations, sessions live, apprenants et annonces."
                : suspended
                  ? "Votre compte est actuellement suspendu. Contactez l'administration."
                  : profile?.access_granted
                    ? "Votre accès à l'espace de formation est actif."
                    : "Votre compte est en attente de validation."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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
          <AdminDashboard />
        ) : suspended ? (
          <SuspendedNotice />
        ) : profile?.access_granted ? (
          <LearnerDashboard userId={user.id} />
        ) : (
          <AccessPending />
        )}
      </section>
    </SiteLayout>
  );
}

/* ============================================================
   COMMON
============================================================ */
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
            Cet espace est réservé aux apprenants validés. Connectez-vous ou créez un compte.
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
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Merci pour votre inscription. Un administrateur va valider votre accès à l'espace formation. Vous pouvez nous contacter directement via WhatsApp pour accélérer la procédure.
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

function SuspendedNotice() {
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardContent className="p-10 text-center">
        <UserX className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-2xl font-bold text-brand-blue-deep">Compte suspendu</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Votre accès est temporairement suspendu. Merci de contacter l'administration pour plus d'informations.
        </p>
        <Button asChild className="mt-6 bg-[var(--whatsapp)] text-white hover:opacity-90">
          <a href={whatsappUrl("Bonjour, mon compte CFP Lumière est suspendu. Pouvez-vous m'aider ?")} target="_blank" rel="noopener noreferrer">Contacter via WhatsApp</a>
        </Button>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   ADMIN DASHBOARD
============================================================ */
function AdminDashboard() {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-secondary/60 p-1">
        <TabsTrigger value="overview"><BarChart3 className="mr-1.5 h-4 w-4" />Vue d'ensemble</TabsTrigger>
        <TabsTrigger value="trainings"><Video className="mr-1.5 h-4 w-4" />Formations</TabsTrigger>
        <TabsTrigger value="live"><Radio className="mr-1.5 h-4 w-4" />Sessions live</TabsTrigger>
        <TabsTrigger value="enrollments"><BookOpen className="mr-1.5 h-4 w-4" />Inscriptions</TabsTrigger>
        <TabsTrigger value="learners"><Users2 className="mr-1.5 h-4 w-4" />Apprenants</TabsTrigger>
        <TabsTrigger value="announcements"><Megaphone className="mr-1.5 h-4 w-4" />Annonces</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-6"><OverviewPanel /></TabsContent>
      <TabsContent value="trainings" className="mt-6"><VideoLibrary isAdmin /></TabsContent>
      <TabsContent value="live" className="mt-6"><LivePanel isAdmin /></TabsContent>
      <TabsContent value="enrollments" className="mt-6"><EnrollmentsAdmin /></TabsContent>
      <TabsContent value="learners" className="mt-6"><LearnersAdmin /></TabsContent>
      <TabsContent value="announcements" className="mt-6"><AnnouncementsPanel isAdmin /></TabsContent>
    </Tabs>
  );
}

function OverviewPanel() {
  const [stats, setStats] = useState({ trainings: 0, live: 0, learners: 0, pending: 0, enrollments: 0 });
  useEffect(() => {
    (async () => {
      const [t, l, learners, pending, enr] = await Promise.all([
        supabase.from("trainings").select("id", { count: "exact", head: true }),
        supabase.from("live_sessions").select("id", { count: "exact", head: true }).neq("status", "ended"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("access_granted", true),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("access_granted", false),
        supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);
      setStats({
        trainings: t.count ?? 0, live: l.count ?? 0,
        learners: learners.count ?? 0, pending: pending.count ?? 0,
        enrollments: enr.count ?? 0,
      });
    })();
  }, []);
  const cards = [
    { label: "Formations publiées", value: stats.trainings, icon: Video },
    { label: "Sessions live à venir", value: stats.live, icon: Radio },
    { label: "Apprenants actifs", value: stats.learners, icon: Users2 },
    { label: "En attente de validation", value: stats.pending, icon: Clock },
    { label: "Inscriptions actives", value: stats.enrollments, icon: BookOpen },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.label} className="border-border/60 shadow-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white">
              <c.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-brand-blue-deep">{c.value}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ============================================================
   TRAININGS (videos)
============================================================ */
function VideoLibrary({ isAdmin = false, userId }: { isAdmin?: boolean; userId?: string }) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Training | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("trainings").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setTrainings((data as Training[]) ?? []);
    if (userId) {
      const { data: e } = await supabase.from("enrollments").select("training_id").eq("user_id", userId).eq("status", "active");
      setEnrolledIds(new Set((e ?? []).map((x: { training_id: string }) => x.training_id)));
    }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const categories = Array.from(new Set(trainings.map((t) => t.category)));
  const filtered = trainings.filter((t) => (category === "all" || t.category === category) && (!query || t.title.toLowerCase().includes(query.toLowerCase())));

  async function toggleEnroll(t: Training) {
    if (!userId) return;
    if (enrolledIds.has(t.id)) {
      await supabase.from("enrollments").delete().eq("user_id", userId).eq("training_id", t.id);
      toast.success("Désinscrit");
    } else {
      const { error } = await supabase.from("enrollments").insert({ user_id: userId, training_id: t.id, status: "active" });
      if (error) return toast.error(error.message);
      toast.success("Inscription confirmée");
    }
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-blue-deep">Bibliothèque de formations</h2>
          <p className="text-sm text-muted-foreground">{trainings.length} formation(s) — {categories.length} catégorie(s)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher..." className="w-48 pl-9" />
          </div>
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="all">Toutes catégories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {isAdmin && <AdminAddVideo onCreated={load} />}
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-muted-foreground">Chargement...</p>
      ) : filtered.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="p-10 text-center">
            <PlayCircle className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <p className="mt-3 text-muted-foreground">Aucune formation pour le moment.</p>
            {isAdmin && <p className="mt-1 text-sm text-muted-foreground">Cliquez sur « + Ajouter une formation ».</p>}
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
                  {t.level && <Badge className="absolute left-2 top-2 bg-white/90 text-brand-blue-deep">{t.level}</Badge>}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-accent">{t.category}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{t.format}</span>
                  </div>
                  <h3 className="mt-1 font-bold text-brand-blue-deep">{t.title}</h3>
                  {t.instructor && <p className="mt-0.5 text-xs text-muted-foreground">par {t.instructor}</p>}
                  {t.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>}
                  {t.duration_minutes && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {t.duration_minutes} min</div>
                  )}
                </div>
              </button>
              <div className="flex gap-2 border-t p-3">
                {userId && (
                  <Button size="sm" variant={enrolledIds.has(t.id) ? "outline" : "default"}
                    className={enrolledIds.has(t.id) ? "flex-1" : "flex-1 bg-gradient-brand text-white"}
                    onClick={() => toggleEnroll(t)}>
                    {enrolledIds.has(t.id) ? "Désinscrire" : "M'inscrire"}
                  </Button>
                )}
                {isAdmin && (
                  <Button variant="outline" size="sm" className="flex-1" onClick={async () => {
                    if (!confirm("Supprimer cette formation ?")) return;
                    const { error } = await supabase.from("trainings").delete().eq("id", t.id);
                    if (error) return toast.error(error.message);
                    toast.success("Formation supprimée"); load();
                  }}><Trash2 className="mr-1 h-3.5 w-3.5" />Supprimer</Button>
                )}
              </div>
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
              <div className="grid gap-3 text-sm md:grid-cols-2">
                {active.instructor && <Info label="Intervenant" value={active.instructor} />}
                {active.level && <Info label="Niveau" value={active.level} />}
                {active.format && <Info label="Format" value={active.format} />}
                {active.duration_minutes && <Info label="Durée" value={`${active.duration_minutes} minutes`} />}
                {active.prerequisites && <Info label="Prérequis" value={active.prerequisites} full />}
                {active.system_requirements && <Info label="Configuration système" value={active.system_requirements} full />}
                {active.description && <Info label="Description" value={active.description} full />}
                {active.resources_url && (
                  <Info label="Ressources" full value={
                    <a href={active.resources_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                      Télécharger les ressources <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  } />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value, full = false }: { label: string; value: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-foreground">{value}</div>
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
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    if (u.hostname.includes("loom.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://www.loom.com/embed/${id}`;
    }
  } catch { /* not a URL */ }
  return null;
}

async function uploadToBucket(file: File, folder: string): Promise<string> {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("training-assets").upload(path, file, {
    cacheControl: "3600", upsert: false, contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data, error: sErr } = await supabase.storage.from("training-assets").createSignedUrl(path, 60 * 60 * 24 * 365);
  if (sErr || !data?.signedUrl) throw sErr ?? new Error("Impossible de générer l'URL");
  return data.signedUrl;
}

function AdminAddVideo({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<string>("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    try {
      let video_url = String(f.get("video_url") ?? "").trim();
      let thumbnail_url = String(f.get("thumbnail_url") ?? "").trim();
      let resources_url = String(f.get("resources_url") ?? "").trim();

      if (videoFile) { setProgress("Téléversement de la vidéo..."); video_url = await uploadToBucket(videoFile, "videos"); }
      if (thumbFile) { setProgress("Téléversement de la miniature..."); thumbnail_url = await uploadToBucket(thumbFile, "thumbnails"); }
      if (resourceFile) { setProgress("Téléversement des ressources..."); resources_url = await uploadToBucket(resourceFile, "resources"); }

      if (!video_url) { setLoading(false); setProgress(""); return toast.error("Ajoutez une URL ou téléversez un fichier vidéo/document."); }

      setProgress("Enregistrement...");
      const { error } = await supabase.from("trainings").insert({
        title: String(f.get("title") ?? "").trim(),
        description: String(f.get("description") ?? "").trim() || null,
        category: String(f.get("category") ?? "Général").trim(),
        video_url,
        thumbnail_url: thumbnail_url || null,
        duration_minutes: f.get("duration") ? Number(f.get("duration")) : null,
        level: String(f.get("level") ?? "").trim() || null,
        format: String(f.get("format") ?? "video").trim(),
        instructor: String(f.get("instructor") ?? "").trim() || null,
        prerequisites: String(f.get("prerequisites") ?? "").trim() || null,
        system_requirements: String(f.get("system_requirements") ?? "").trim() || null,
        resources_url: resources_url || null,
        published: true,
      });
      if (error) throw error;
      toast.success("Formation publiée");
      setOpen(false);
      setVideoFile(null); setThumbFile(null); setResourceFile(null);
      onCreated();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-brand text-white">+ Ajouter une formation</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>Nouvelle formation</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Titre *</Label><Input name="title" required maxLength={200} /></div>
          <div><Label>Catégorie *</Label><Input name="category" required defaultValue="Général" maxLength={80} /></div>
          <div>
            <Label>Niveau</Label>
            <select name="level" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">—</option>
              <option>Débutant</option><option>Intermédiaire</option><option>Avancé</option>
            </select>
          </div>
          <div>
            <Label>Format *</Label>
            <select name="format" defaultValue="video" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="video">Vidéo</option>
              <option value="webinar">Webinaire</option>
              <option value="document">Document</option>
              <option value="hybrid">Hybride</option>
            </select>
          </div>
          <div><Label>Intervenant</Label><Input name="instructor" maxLength={120} /></div>

          <div className="sm:col-span-2 rounded-lg border border-dashed border-border bg-secondary/30 p-3">
            <Label className="text-brand-blue-deep">Vidéo / Document principal *</Label>
            <p className="mb-2 text-xs text-muted-foreground">Téléversez depuis votre appareil OU collez une URL externe (YouTube, Vimeo, Loom, mp4...).</p>
            <Input type="file" accept="video/*,application/pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
            {videoFile && <p className="mt-1 text-xs text-muted-foreground">Fichier : {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} Mo)</p>}
            <Input name="video_url" type="url" placeholder="https://... (optionnel si fichier téléversé)" className="mt-2" />
          </div>

          <div className="sm:col-span-2 rounded-lg border border-dashed border-border bg-secondary/30 p-3">
            <Label className="text-brand-blue-deep">Miniature</Label>
            <p className="mb-2 text-xs text-muted-foreground">Image depuis votre appareil OU URL.</p>
            <Input type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)} />
            {thumbFile && <p className="mt-1 text-xs text-muted-foreground">Image : {thumbFile.name}</p>}
            <Input name="thumbnail_url" type="url" placeholder="https://... (optionnel)" className="mt-2" />
          </div>

          <div><Label>Durée (minutes)</Label><Input name="duration" type="number" min={1} /></div>
          <div className="sm:col-span-2"><Label>Description</Label><Textarea name="description" rows={2} maxLength={1000} /></div>
          <div className="sm:col-span-2"><Label>Prérequis</Label><Textarea name="prerequisites" rows={2} maxLength={500} placeholder="Connaissances nécessaires..." /></div>
          <div className="sm:col-span-2"><Label>Configuration système (I/O)</Label><Textarea name="system_requirements" rows={2} maxLength={500} placeholder="OS, RAM, logiciels..." /></div>

          <div className="sm:col-span-2 rounded-lg border border-dashed border-border bg-secondary/30 p-3">
            <Label className="text-brand-blue-deep">Ressources (PDF, support)</Label>
            <p className="mb-2 text-xs text-muted-foreground">Téléversez un fichier OU collez une URL.</p>
            <Input type="file" accept="application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip" onChange={(e) => setResourceFile(e.target.files?.[0] ?? null)} />
            {resourceFile && <p className="mt-1 text-xs text-muted-foreground">Fichier : {resourceFile.name}</p>}
            <Input name="resources_url" type="url" placeholder="https://... (optionnel)" className="mt-2" />
          </div>

          {progress && <p className="text-sm text-muted-foreground sm:col-span-2">{progress}</p>}
          <Button type="submit" disabled={loading} className="bg-gradient-brand text-white sm:col-span-2">{loading ? (progress || "Publication...") : "Publier la formation"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


/* ============================================================
   LIVE SESSIONS
============================================================ */
function LivePanel({ isAdmin = false }: { isAdmin?: boolean }) {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("live_sessions").select("*").order("scheduled_at", { ascending: true });
    if (error) toast.error(error.message);
    setSessions((data as LiveSession[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function copy(url: string) {
    navigator.clipboard.writeText(url);
    toast.success("Lien copié");
  }

  async function updateStatus(s: LiveSession, status: string) {
    const { error } = await supabase.from("live_sessions").update({ status }).eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Statut mis à jour"); load();
  }
  async function remove(id: string) {
    if (!confirm("Supprimer cette session ?")) return;
    const { error } = await supabase.from("live_sessions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Session supprimée"); load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-blue-deep">Sessions live</h2>
          <p className="text-sm text-muted-foreground">Zoom, Loom, Google Meet, Teams... — rejoignez le direct en un clic.</p>
        </div>
        {isAdmin && <AdminAddLive onCreated={load} />}
      </div>

      {loading ? <p className="mt-8 text-muted-foreground">Chargement...</p> : sessions.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="p-10 text-center">
            <Radio className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <p className="mt-3 text-muted-foreground">Aucune session planifiée.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sessions.map((s) => {
            const isLive = s.status === "live";
            const isEnded = s.status === "ended";
            return (
              <Card key={s.id} className={`border-border/60 shadow-card ${isLive ? "ring-2 ring-accent" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold uppercase tracking-wider text-accent">{s.category}</span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">{s.platform}</span>
                        {isLive && <Badge className="bg-red-600 text-white">● EN DIRECT</Badge>}
                        {isEnded && <Badge variant="outline">Terminée</Badge>}
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-brand-blue-deep">{s.title}</h3>
                      {s.host_name && <p className="text-xs text-muted-foreground">Animée par {s.host_name}</p>}
                      {s.description && <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(s.scheduled_at).toLocaleString("fr-FR")}</span>
                        {s.duration_minutes && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{s.duration_minutes} min</span>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild className="bg-gradient-brand text-white" disabled={isEnded}>
                      <a href={s.join_url} target="_blank" rel="noopener noreferrer">
                        <Radio className="mr-1.5 h-4 w-4" />Rejoindre le live
                      </a>
                    </Button>
                    {isAdmin && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => copy(s.join_url)}><Copy className="mr-1.5 h-3.5 w-3.5" />Copier</Button>
                        {!isLive && !isEnded && <Button size="sm" variant="outline" onClick={() => updateStatus(s, "live")}>Marquer en direct</Button>}
                        {!isEnded && <Button size="sm" variant="outline" onClick={() => updateStatus(s, "ended")}>Terminer</Button>}
                        <Button size="sm" variant="outline" onClick={() => remove(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminAddLive({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.from("live_sessions").insert({
      title: String(f.get("title") ?? "").trim(),
      description: String(f.get("description") ?? "").trim() || null,
      category: String(f.get("category") ?? "Général").trim(),
      platform: String(f.get("platform") ?? "zoom").trim(),
      join_url: String(f.get("join_url") ?? "").trim(),
      host_name: String(f.get("host_name") ?? "").trim() || null,
      scheduled_at: new Date(String(f.get("scheduled_at"))).toISOString(),
      duration_minutes: f.get("duration") ? Number(f.get("duration")) : null,
      status: "scheduled",
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Session planifiée");
    setOpen(false); onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="bg-gradient-brand text-white">+ Planifier une session live</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nouvelle session live</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div><Label>Titre *</Label><Input name="title" required maxLength={200} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Catégorie *</Label><Input name="category" defaultValue="Général" required maxLength={80} /></div>
            <div>
              <Label>Plateforme *</Label>
              <select name="platform" defaultValue="zoom" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="zoom">Zoom</option><option value="loom">Loom</option>
                <option value="meet">Google Meet</option><option value="teams">MS Teams</option>
                <option value="youtube">YouTube Live</option><option value="other">Autre</option>
              </select>
            </div>
          </div>
          <div><Label>Lien d'accès (URL) *</Label><Input name="join_url" required type="url" placeholder="https://zoom.us/j/..." /></div>
          <div><Label>Animateur</Label><Input name="host_name" maxLength={120} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date & heure *</Label><Input name="scheduled_at" required type="datetime-local" /></div>
            <div><Label>Durée (min)</Label><Input name="duration" type="number" min={5} defaultValue={60} /></div>
          </div>
          <div><Label>Description</Label><Textarea name="description" rows={3} maxLength={1000} /></div>
          <Button type="submit" disabled={loading} className="bg-gradient-brand text-white">{loading ? "..." : "Planifier"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   ENROLLMENTS (admin)
============================================================ */
function EnrollmentsAdmin() {
  const [rows, setRows] = useState<(Enrollment & { profile: Profile | null; training: Training | null })[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [{ data: enr }, { data: profs }, { data: trs }] = await Promise.all([
      supabase.from("enrollments").select("*").order("enrolled_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email, phone, access_granted, status"),
      supabase.from("trainings").select("*"),
    ]);
    const pmap = new Map((profs as Profile[] ?? []).map((p) => [p.id, p]));
    const tmap = new Map((trs as Training[] ?? []).map((t) => [t.id, t]));
    setRows(((enr as Enrollment[]) ?? []).map((e) => ({
      ...e,
      profile: pmap.get(e.user_id) ?? null,
      training: tmap.get(e.training_id) ?? null,
    })));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("enrollments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Inscription mise à jour"); load();
  }
  async function remove(id: string) {
    if (!confirm("Retirer cette inscription ?")) return;
    const { error } = await supabase.from("enrollments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Apprenant retiré de la formation"); load();
  }

  return (
    <Card className="border-border/60 shadow-card">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-brand-blue-deep">Inscriptions aux formations</h2>
        <p className="text-sm text-muted-foreground">Retirez ou suspendez un apprenant d'une formation spécifique.</p>
        {loading ? <p className="mt-6 text-muted-foreground">Chargement...</p> : rows.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Aucune inscription pour le moment.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="py-2">Apprenant</th><th>Formation</th><th>Date</th><th>Statut</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3">
                      <div className="font-medium">{r.profile?.full_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.profile?.email ?? r.user_id.slice(0, 8)}</div>
                    </td>
                    <td>{r.training?.title ?? "—"}</td>
                    <td className="text-xs text-muted-foreground">{new Date(r.enrolled_at).toLocaleDateString("fr-FR")}</td>
                    <td>
                      <Badge variant={r.status === "active" ? "default" : "outline"} className={r.status === "active" ? "bg-emerald-600" : ""}>{r.status}</Badge>
                    </td>
                    <td className="text-right">
                      {r.status === "active" ? (
                        <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "suspended")}>Suspendre</Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "active")}>Réactiver</Button>
                      )}
                      <Button size="sm" variant="outline" className="ml-2" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================
   LEARNERS (admin)
============================================================ */
function LearnersAdmin() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "suspended">("all");
  const deleteFn = useServerFn(deleteLearnerAccount);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("profiles")
      .select("id, full_name, email, phone, access_granted, status, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setUsers((data as Profile[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggleAccess(p: Profile) {
    const { error } = await supabase.from("profiles").update({ access_granted: !p.access_granted }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(p.access_granted ? "Accès retiré" : "Accès accordé"); load();
  }
  async function setStatus(p: Profile, status: string) {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Statut mis à jour"); load();
  }
  async function removeAccount(p: Profile) {
    try {
      await deleteFn({ data: { userId: p.id } });
      toast.success("Compte supprimé définitivement");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  const filtered = useMemo(() => users.filter((u) => {
    if (filter === "active" && !(u.access_granted && u.status === "active")) return false;
    if (filter === "pending" && u.access_granted) return false;
    if (filter === "suspended" && u.status !== "suspended") return false;
    if (query) {
      const q = query.toLowerCase();
      return (u.full_name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q);
    }
    return true;
  }), [users, filter, query]);

  return (
    <Card className="border-border/60 shadow-card">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-brand-blue-deep">Gestion des apprenants</h2>
            <p className="text-sm text-muted-foreground">Valider, suspendre ou supprimer un compte.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom, email..." className="w-56 pl-9" />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendus</option>
            </select>
          </div>
        </div>

        {loading ? <p className="mt-6 text-muted-foreground">Chargement...</p> : filtered.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Aucun apprenant.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="py-2">Apprenant</th><th>Contact</th><th>Statut</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3">
                      <div className="font-medium">{u.full_name ?? "(sans nom)"}</div>
                      <div className="text-xs text-muted-foreground">{u.id.slice(0, 8)}…</div>
                    </td>
                    <td className="text-xs">
                      <div>{u.email ?? "—"}</div>
                      <div className="text-muted-foreground">{u.phone ?? ""}</div>
                    </td>
                    <td>
                      {u.status === "suspended" ? <Badge variant="destructive">Suspendu</Badge>
                        : u.access_granted ? <Badge className="bg-emerald-600">Actif</Badge>
                        : <Badge variant="outline">En attente</Badge>}
                    </td>
                    <td className="space-x-2 text-right">
                      <Button size="sm" variant={u.access_granted ? "outline" : "default"} onClick={() => toggleAccess(u)} className={u.access_granted ? "" : "bg-gradient-brand text-white"}>
                        {u.access_granted ? <><UserX className="mr-1 h-3.5 w-3.5" />Retirer accès</> : <><UserCheck className="mr-1 h-3.5 w-3.5" />Valider</>}
                      </Button>
                      {u.status === "suspended" ? (
                        <Button size="sm" variant="outline" onClick={() => setStatus(u, "active")}>Réactiver</Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setStatus(u, "suspended")}>Suspendre</Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer définitivement le compte ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Le compte de <strong>{u.full_name ?? u.email}</strong> et toutes ses données (inscriptions, profil) seront supprimés.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeAccount(u)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================
   ANNOUNCEMENTS
============================================================ */
function AnnouncementsPanel({ isAdmin = false }: { isAdmin?: boolean }) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Announcement[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.from("announcements").insert({
      title: String(f.get("title") ?? "").trim(),
      body: String(f.get("body") ?? "").trim(),
    });
    if (error) return toast.error(error.message);
    toast.success("Annonce publiée"); setOpen(false); load();
  }
  async function remove(id: string) {
    if (!confirm("Supprimer cette annonce ?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Supprimée"); load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-brand-blue-deep">Annonces</h2>
          <p className="text-sm text-muted-foreground">Communications visibles par tous les apprenants validés.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="bg-gradient-brand text-white">+ Nouvelle annonce</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvelle annonce</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="grid gap-3">
                <div><Label>Titre *</Label><Input name="title" required maxLength={200} /></div>
                <div><Label>Message *</Label><Textarea name="body" required rows={5} maxLength={2000} /></div>
                <DialogFooter><Button type="submit" className="bg-gradient-brand text-white">Publier</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? <p className="mt-6 text-muted-foreground">Chargement...</p> : items.length === 0 ? (
        <Card className="mt-6 border-dashed"><CardContent className="p-10 text-center"><Megaphone className="mx-auto h-12 w-12 text-muted-foreground/60" /><p className="mt-3 text-muted-foreground">Aucune annonce.</p></CardContent></Card>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((a) => (
            <Card key={a.id} className="border-border/60 shadow-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-brand-blue-deep">{a.title}</h3>
                    <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{a.body}</p>
                    <div className="mt-2 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("fr-FR")}</div>
                  </div>
                  {isAdmin && <Button size="sm" variant="outline" onClick={() => remove(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   LEARNER DASHBOARD
============================================================ */
function LearnerDashboard({ userId }: { userId: string }) {
  return (
    <Tabs defaultValue="trainings">
      <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-secondary/60 p-1">
        <TabsTrigger value="trainings"><Video className="mr-1.5 h-4 w-4" />Formations</TabsTrigger>
        <TabsTrigger value="live"><Radio className="mr-1.5 h-4 w-4" />Sessions live</TabsTrigger>
        <TabsTrigger value="announcements"><Megaphone className="mr-1.5 h-4 w-4" />Annonces</TabsTrigger>
      </TabsList>
      <TabsContent value="trainings" className="mt-6"><VideoLibrary userId={userId} /></TabsContent>
      <TabsContent value="live" className="mt-6"><LivePanel /></TabsContent>
      <TabsContent value="announcements" className="mt-6"><AnnouncementsPanel /></TabsContent>
    </Tabs>
  );
}
