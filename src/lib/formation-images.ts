import business from "@/assets/training-business.jpg";
import techAsset from "@/assets/training-tech-new.jpg.asset.json";
const tech = techAsset.url;
import journalismAsset from "@/assets/training-journalism-new.jpg.asset.json";
const journalism = journalismAsset.url;
import edcp from "@/assets/training-edcp.jpg";
import statsAsset from "@/assets/training-stats-new.jpg.asset.json";
const stats = statsAsset.url;
import commAsset from "@/assets/training-comm-new.jpg.asset.json";
const comm = commAsset.url;
import agriAsset from "@/assets/training-agri-new.jpg.asset.json";
const agri = agriAsset.url;
import leadershipAsset from "@/assets/training-leadership-new.jpg.asset.json";
const leadership = leadershipAsset.url;
import comptaAsset from "@/assets/training-compta-new.jpg.asset.json";
const compta = comptaAsset.url;
import methodesAsset from "@/assets/training-methodes-v2.jpg.asset.json";
const methodes = methodesAsset.url;
import langues from "@/assets/training-langues.jpg";
import approAsset from "@/assets/training-appro-new.jpg.asset.json";
const appro = approAsset.url;

export const FORMATION_IMAGES: Record<string, string> = {
  gestion: business,
  edcp,
  technique: tech,
  journalisme: journalism,
  statistique: stats,
  communication: comm,
  agri,
  leadership,
  compta,
  methodes,
  langues,
  appro,
};
