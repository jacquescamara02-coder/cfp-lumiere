import business from "@/assets/training-business.jpg";
import techAsset from "@/assets/training-tech-new.jpg.asset.json";
const tech = techAsset.url;
import journalismAsset from "@/assets/training-journalism-new.jpg.asset.json";
const journalism = journalismAsset.url;
import edcp from "@/assets/training-edcp.jpg";
import statsAsset from "@/assets/training-stats-new.jpg.asset.json";
const stats = statsAsset.url;
import comm from "@/assets/training-comm.jpg";
import agri from "@/assets/training-agri.jpg";
import leadership from "@/assets/training-leadership.jpg";
import compta from "@/assets/training-compta.jpg";
import methodes from "@/assets/training-methodes.jpg";
import langues from "@/assets/training-langues.jpg";
import appro from "@/assets/training-appro.jpg";

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
