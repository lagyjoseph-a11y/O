import captionsJson from "../../captions-blackmar.json";
import { Beat, Caption, Lesson, makeAt } from "../types";

const captions = captionsJson as Caption[];
const at = makeAt(captions);

const beats: Beat[] = [
  { t: 0.05, move: { from: "d2", to: "d4", san: "d4" }, label: { text: "TU JOUES 1. d4", color: "gold" } },
  { t: at("d5"), move: { from: "d7", to: "d5", san: "d5" }, label: null },
  { t: at("e4."), move: { from: "e2", to: "e4", san: "e4" }, label: { text: "LE GAMBIT : 2. e4", color: "gold" }, marks: [{ sq: "e4", color: "gold" }] },
  { t: at("gambit"), arrows: [{ from: "d5", to: "e4", color: "red" }] },
  { t: at("prend"), move: { from: "d5", to: "e4", san: "dxe4" }, label: { text: "IL PREND LE PION", color: "grey" } },
  { t: at("c3."), move: { from: "b1", to: "c3", san: "Cc3" }, label: { text: "TU DÉVELOPPES", color: "green" }, arrows: [{ from: "c3", to: "e4", color: "green" }] },
  { t: at("c6."), move: { from: "b8", to: "c6", san: "Cc6" }, label: null },
  { t: at("d5", 2), move: { from: "d4", to: "d5", san: "d5" }, label: { text: "IL CHASSE LE CAVALIER", color: "green" }, arrows: [{ from: "d5", to: "c6", color: "red" }] },
  { t: at("e5."), move: { from: "c6", to: "e5", san: "Ce5" }, label: null },
  { t: at("d4 !"), move: { from: "d1", to: "d4", san: "Dd4" }, label: { text: "DOUBLE ATTAQUE", color: "gold" }, zoom: { sq: "e4", scale: 1.32 }, sfx: "whoosh" },
  { t: at("attaque"), arrows: [{ from: "d4", to: "e5", color: "red" }, { from: "d4", to: "e4", color: "red" }], marks: [{ sq: "e5", color: "red" }, { sq: "e4", color: "red" }] },
  { t: at("recule"), move: { from: "e5", to: "g6", san: "Cg6" }, zoom: null, label: null },
  { t: at("b5,"), move: { from: "f1", to: "b5", san: "Fb5+" }, label: { text: "ÉCHEC !", color: "red" }, arrows: [{ from: "b5", to: "e8", color: "red" }], marks: [{ sq: "e8", color: "red" }], sfx: "impact" },
  { t: at("bloque"), move: { from: "c7", to: "c6", san: "c6" }, label: { text: "IL BLOQUE", color: "grey" } },
  { t: at("fatale."), label: { text: "L'ERREUR FATALE", color: "red" }, marks: [{ sq: "c6", color: "red" }] },
  { t: at("Prends"), move: { from: "d5", to: "c6", san: "dxc6" }, label: null, zoom: { sq: "d6", scale: 1.25 } },
  { t: at("laisse"), label: { text: "TA DAME EST EN PRISE", color: "red" }, arrows: [{ from: "d8", to: "d4", color: "red" }], marks: [{ sq: "d4", color: "red" }] },
  { t: at("Personne"), overlay: { title: "SACRIFICE DE DAME", sub: "7. dxc6 !!" }, sfx: "whoosh" },
  { t: at("mange."), overlay: null, move: { from: "d8", to: "d4", san: "Dxd4" }, label: { text: "IL MANGE LA DAME", color: "grey" }, zoom: null },
  { t: at("Pion"), move: { from: "c6", to: "b7", san: "cxb7+" }, label: { text: "ÉCHEC À LA DÉCOUVERTE", color: "red" }, arrows: [{ from: "b5", to: "e8", color: "red" }], marks: [{ sq: "e8", color: "red" }], zoom: { sq: "c7", scale: 1.3 }, sfx: "impact" },
  { t: at("bloque", 2), move: { from: "c8", to: "d7", san: "Fd7" }, label: { text: "IL DOIT BLOQUER", color: "grey" } },
  { t: at("prends"), arrows: [{ from: "b7", to: "a8", color: "green" }], label: { text: "LA TOUR EST À TOI", color: "green" } },
  { t: at("a8,"), move: { from: "b7", to: "a8", promo: "Q", san: "bxa8=D#" }, label: { text: "NOUVELLE DAME", color: "gold" }, arrows: [{ from: "a8", to: "e8", color: "red" }], marks: [{ sq: "e8", color: "red" }, { sq: "a8", color: "gold" }] },
  { t: at("Échec"), overlay: { title: "ÉCHEC ET MAT", sub: "9. bxa8=D#" }, zoom: null, sfx: "impact" },
  { t: at("Enregistre"), overlay: null, label: { text: "ENREGISTRE CETTE VIDÉO", color: "gold" } },
];

export const blackmar: Lesson = {
  title: "Le gambit Blackmar-Diemer",
  subtitle: "Mat en 9 coups",
  audio: "mix-blackmar.mp3",
  durationS: 43.4,
  captions,
  beats,
};
