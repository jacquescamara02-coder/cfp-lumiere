import { BarChart3, Briefcase, Cpu, Megaphone, Newspaper, Sprout, Users, Languages, GraduationCap, Boxes, Calculator, ShieldCheck } from "lucide-react";

export type FormationCategory = {
  key: string;
  title: string;
  icon: typeof BarChart3;
  topics: string[];
  description: string;
};

export const FORMATIONS: FormationCategory[] = [
  {
    key: "gestion",
    title: "Gestion",
    icon: Briefcase,
    description: "Maîtriser les fondamentaux managériaux d'une entreprise moderne.",
    topics: ["Commerciale", "Entreprise", "Stock", "Financière"],
  },
  {
    key: "edcp",
    title: "EDCP — Cycle Pro",
    icon: GraduationCap,
    description: "Production, logistique, risque, cahier des charges et approvisionnement.",
    topics: ["Production", "Logistique", "Risque", "Cahier des charges", "Achat & Stock"],
  },
  {
    key: "technique",
    title: "Informatique & Tech",
    icon: Cpu,
    description: "De la bureautique à la création de sites web et au développement logiciel.",
    topics: ["Bureautique", "Création de site web", "Développement"],
  },
  {
    key: "journalisme",
    title: "Journalisme",
    icon: Newspaper,
    description: "Reportage de terrain, écriture journalistique, éthique et déontologie.",
    topics: ["Journaliste Reporter", "Rédaction", "Investigation"],
  },
  {
    key: "statistique",
    title: "Statistique",
    icon: BarChart3,
    description: "Analyse statistique appliquée à l'industrie et à l'agriculture.",
    topics: ["Appliquée à l'industrie", "Appliquée à l'agriculture"],
  },
  {
    key: "communication",
    title: "Communication",
    icon: Megaphone,
    description: "Communication d'entreprise, prise de parole, relations publiques.",
    topics: ["Communication interne", "Relations publiques", "Storytelling"],
  },
  {
    key: "agri",
    title: "Agriculture & Élevage",
    icon: Sprout,
    description: "Pratiques modernes, productivité, valorisation des filières locales.",
    topics: ["Agriculture", "Élevage"],
  },
  {
    key: "leadership",
    title: "Leadership & Entrepreneuriat",
    icon: Users,
    description: "Posture de leader, gestion d'équipe, lancement et pilotage d'entreprise.",
    topics: ["Leadership", "Création d'entreprise", "Pilotage"],
  },
  {
    key: "compta",
    title: "Comptabilité & Contrôle qualité",
    icon: Calculator,
    description: "Comptabilité, gestion RH, contrôle qualité — en milieu de travail ou en externe.",
    topics: ["Comptabilité", "RH", "Contrôle qualité"],
  },
  {
    key: "methodes",
    title: "Méthodes & Didactique",
    icon: ShieldCheck,
    description: "Approches pédagogiques modernes : par compétence et par objectif.",
    topics: ["Approche par compétence", "Approche par objectif", "Fiche de préparation"],
  },
  {
    key: "langues",
    title: "Langues",
    icon: Languages,
    description: "Anglais professionnel et langues locales pour mieux communiquer.",
    topics: ["Anglais", "Langues locales"],
  },
  {
    key: "appro",
    title: "Approvisionnement",
    icon: Boxes,
    description: "Commande, achat, gestion de stock et chaîne d'approvisionnement.",
    topics: ["Commande", "Achat", "Stock"],
  },
];

export const TESTIMONIALS = [
  { name: "Patrick K.", role: "Chef de projet", text: "Une formation pratique et adaptée à la réalité du terrain. Mon équipe a gagné en efficacité dès le premier mois." },
  { name: "Sarah M.", role: "Comptable junior", text: "Les formateurs sont disponibles et passionnés. J'ai trouvé un emploi 2 semaines après la fin du cycle comptabilité." },
  { name: "Jean-Pierre N.", role: "Entrepreneur", text: "Le module leadership m'a transformé. La méthode par compétence est redoutablement efficace." },
  { name: "Aline T.", role: "Journaliste", text: "Un encadrement professionnel, certifié par le Ministère. Je recommande sans hésiter." },
  { name: "Yannick L.", role: "Développeur web", text: "J'ai construit mon premier site fonctionnel en quelques semaines. Merci CFP Lumière !" },
  { name: "Bénédicte W.", role: "Responsable RH", text: "Nous avons formé toute notre équipe en entreprise. Très professionnel, contenu de haut niveau." },
];

export const FAQ = [
  { q: "Où se trouve le centre ?", a: "Nous sommes situés sur l'Avenue Lomami, impasse derrière la Cour d'appel au centre-ville de Lubumbashi, à 5 minutes de la Poste." },
  { q: "Les formations sont-elles certifiées ?", a: "Oui, nos formations sont certifiées par le Ministère de la Formation et des Métiers de la RDC." },
  { q: "Peut-on suivre une formation en entreprise ?", a: "Absolument. Nos formations sont données soit en entreprise (sur le lieu de travail) soit dans nos locaux." },
  { q: "Comment accéder à l'espace vidéos de formation ?", a: "Créez un compte gratuitement, puis l'administrateur valide votre accès. Une fois validé, vous débloquez l'ensemble des vidéos pédagogiques." },
  { q: "Proposez-vous de la formation en ligne ?", a: "L'option d'une formation 100% en ligne est actuellement à l'étude. En attendant, l'espace vidéo sécurisé vous donne accès à de nombreux contenus à distance." },
  { q: "Quels sont les modes de paiement ?", a: "Nous acceptons le paiement en espèces, par virement bancaire et via Mobile Money. Contactez-nous via WhatsApp pour les détails." },
];
