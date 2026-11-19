import captionsJson from "../../captions-soller.json";
import { Beat, Caption, Lesson, makeAt } from "../types";

const captions = captionsJson as Caption[];
const at = makeAt(captions);

// Gambit Soller (variante du gambit Englund), le spectateur joue les noirs :
// 1. d4 e5 2. dxe5 f6 3. exf6 Cxf6 4. Cf3 Fc5 5. Fg5? Ce4!! 6. Fxd8?? Fxf2#
const beats: Beat[] = [
  { t: 0.05, move: { from: "d2", to: "d4", san: "d4" }, label: { text: "IL JOUE 1. d4", color: "grey" } },
  { t: at("e5 !"), move: { from: "e7", to: "e5", san: "e5" }, label: { text: "TU RÉPONDS e5 !", color: "gold" } },
  { t: at("prend,"), move: { from: "d4", to: "e5", san: "dxe5" }, label: { text: "IL PREND", color: "grey" } },
  { t: at("f6 :"), move: { from: "f7", to: "f6", san: "f6" }, label: { text: "LE GAMBIT : 2… f6", color: "gold" }, marks: [{ sq: "f6", color: "gold" }], sfx: "whoosh" },
  { t: at("Soller."), label: { text: "LE GAMBIT SOLLER", color: "gold" } },
  { t: at("reprend"), move: { from: "e5", to: "f6", san: "exf6" }, label: { text: "IL PREND ENCORE", color: "grey" } },
  { t: at("reprends"), move: { from: "g8", to: "f6", san: "Cxf6" }, label: { text: "TU REPRENDS", color: "green" } },
  { t: at("f3."), move: { from: "g1", to: "f3", san: "Cf3" }, label: null },
  { t: at("c5…"), move: { from: "f8", to: "c5", san: "Fc5" }, label: { text: "TON FOU VISE f2", color: "gold" }, arrows: [{ from: "c5", to: "f2", color: "gold" }], marks: [{ sq: "f2", color: "gold" }] },
  { t: at("cloue"), move: { from: "c1", to: "g5", san: "Fg5" }, label: { text: "IL CLOUE TON CAVALIER", color: "red" }, arrows: [{ from: "g5", to: "d8", color: "red" }], marks: [{ sq: "f6", color: "red" }] },
  { t: at("gagné…"), label: { text: "IL PENSE AVOIR GAGNÉ", color: "grey" } },
  { t: at("e4 !"), move: { from: "f6", to: "e4", san: "Ce4!!" }, label: { text: "LE COUP BRILLANT : Ce4 !!", color: "gold" }, zoom: { sq: "e3", scale: 1.25 }, arrows: [{ from: "e4", to: "f2", color: "gold" }], sfx: "whoosh" },
  { t: at("laisses"), zoom: null, label: { text: "TA DAME EST EN PRISE", color: "red" }, arrows: [{ from: "g5", to: "d8", color: "red" }], marks: [{ sq: "d8", color: "red" }] },
  { t: at("mange."), move: { from: "g5", to: "d8", san: "Fxd8" }, label: { text: "IL MANGE LA DAME", color: "grey" }, zoom: null },
  { t: at("Identifie"), overlay: { title: "IDENTIFIE UN POTE", sub: "QUI L'AURAIT MANGÉE AUSSI" }, sfx: "whoosh" },
  { t: at("maintenant…"), overlay: null, label: null },
  { t: at("prend"), move: { from: "c5", to: "f2", san: "Fxf2#" }, label: { text: "ÉCHEC !", color: "red" }, marks: [{ sq: "e1", color: "red" }], zoom: { sq: "e1", scale: 1.25 }, sfx: "impact" },
  { t: at("reprendre :"), label: { text: "TON CAVALIER PROTÈGE f2", color: "green" }, arrows: [{ from: "e4", to: "f2", color: "green" }], marks: [{ sq: "e1", color: "red" }, { sq: "f2", color: "green" }] },
  { t: at("Échec"), overlay: { title: "ÉCHEC ET MAT", sub: "6… Fxf2#" }, zoom: null, sfx: "impact" },
  { t: at("Quel"), overlay: null, label: { text: "QUEL PIÈGE ENSUITE ? COMMENTE", color: "gold" } },
];

export const soller: Lesson = {
  title: "Le gambit Soller",
  subtitle: "Mat en 6 coups",
  audio: "mix-soller.mp3",
  orientation: "black",
  durationS: 38.7,
  captions,
  beats,
};
