import captionsJson from "../../captions-roi.json";
import { Beat, Caption, Lesson, makeAt } from "../types";

const captions = captionsJson as Caption[];
const at = makeAt(captions);

// 1. e4 e5 2. f4 exf4 3. Cf3 d5 4. Cc3 dxe4 5. Cxe4 Fg4 6. De2 Fxf3?? 7. Cf6#
const beats: Beat[] = [
  { t: 0.05, move: { from: "e2", to: "e4", san: "e4" }, label: { text: "TU JOUES 1. e4", color: "gold" } },
  { t: at("e5,"), move: { from: "e7", to: "e5", san: "e5" }, label: null },
  { t: at("f4 !"), move: { from: "f2", to: "f4", san: "f4" }, label: { text: "L'ARME SECRÈTE : 2. f4", color: "gold" }, arrows: [{ from: "f4", to: "e5", color: "gold" }], marks: [{ sq: "f4", color: "gold" }], sfx: "whoosh" },
  { t: at("roi."), label: { text: "LE GAMBIT DU ROI", color: "gold" } },
  { t: at("prend"), move: { from: "e5", to: "f4", san: "exf4" }, label: { text: "IL PREND LE PION", color: "grey" } },
  { t: at("f3."), move: { from: "g1", to: "f3", san: "Cf3" }, label: { text: "TU DÉVELOPPES", color: "green" } },
  { t: at("d5."), move: { from: "d7", to: "d5", san: "d5" }, label: { text: "IL CONTRE-ATTAQUE", color: "red" }, arrows: [{ from: "d5", to: "e4", color: "red" }] },
  { t: at("c3."), move: { from: "b1", to: "c3", san: "Cc3" }, label: { text: "TU DÉVELOPPES", color: "green" }, arrows: [{ from: "c3", to: "e4", color: "green" }] },
  { t: at("mange"), move: { from: "d5", to: "e4", san: "dxe4" }, label: { text: "IL MANGE LE PION", color: "grey" } },
  { t: at("Reprends"), move: { from: "c3", to: "e4", san: "Cxe4" }, label: { text: "TU REPRENDS", color: "green" } },
  { t: at("cloue"), move: { from: "c8", to: "g4", san: "Fg4" }, label: { text: "CLOUAGE", color: "red" }, arrows: [{ from: "g4", to: "d1", color: "red" }], marks: [{ sq: "f3", color: "red" }] },
  { t: at("dame"), move: { from: "d1", to: "e2", san: "De2" }, label: { text: "LE PIÈGE EST POSÉ", color: "gold" }, zoom: { sq: "e5", scale: 1.22 }, sfx: "whoosh" },
  { t: at("colonne"), zoom: null, label: { text: "REGARDE LA COLONNE e", color: "gold" }, arrows: [{ from: "e2", to: "e8", color: "gold" }], marks: [{ sq: "e8", color: "red" }] },
  { t: at("mange", 2), move: { from: "g4", to: "f3", san: "Fxf3" }, label: null, zoom: null },
  { t: at("erreur !"), label: { text: "GROSSE ERREUR", color: "red" }, marks: [{ sq: "f3", color: "red" }] },
  { t: at("f6…"), move: { from: "e4", to: "f6", san: "Cf6#" }, label: { text: "DOUBLE ÉCHEC !", color: "red" }, arrows: [{ from: "f6", to: "e8", color: "red" }, { from: "e2", to: "e8", color: "red" }], marks: [{ sq: "e8", color: "red" }], zoom: { sq: "e7", scale: 1.25 }, sfx: "impact" },
  { t: at("roi"), label: { text: "LE ROI EST PRIS AU PIÈGE", color: "red" }, marks: [{ sq: "e8", color: "red" }, { sq: "d7", color: "red" }, { sq: "e7", color: "red" }] },
  { t: at("Échec"), overlay: { title: "ÉCHEC ET MAT", sub: "7. Cf6#" }, zoom: null, sfx: "impact" },
  { t: at("Enregistre"), overlay: null, label: { text: "ENREGISTRE CETTE VIDÉO", color: "gold" } },
];

export const roi: Lesson = {
  title: "Le gambit du roi",
  subtitle: "Mat en 7 coups",
  audio: "mix-roi.mp3",
  durationS: 36.8,
  captions,
  beats,
};
