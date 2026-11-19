import captionsJson from "../../captions-tennison.json";
import { Beat, Caption, Lesson, makeAt } from "../types";

const captions = captionsJson as Caption[];
const at = makeAt(captions);

// Gambit Tennison : 1. Cf3 d5 2. e4 dxe4 3. Ce5 f6 4. Dh5+ g6 5. Fc4 gxh5?? 6. Ff7#
const beats: Beat[] = [
  { t: at("commence"), label: { text: "TU COMMENCES PAR 1. Cf3", color: "gold" } },
  { t: at("f3 !"), move: { from: "g1", to: "f3", san: "Cf3" } },
  { t: at("d5."), move: { from: "d7", to: "d5", san: "d5" }, label: null },
  { t: at("e4,"), move: { from: "e2", to: "e4", san: "e4" }, label: { text: "LE GAMBIT : 2. e4", color: "gold" }, arrows: [{ from: "d5", to: "e4", color: "red" }], sfx: "whoosh" },
  { t: at("prend"), move: { from: "d5", to: "e4", san: "dxe4" }, label: { text: "IL PREND", color: "grey" } },
  { t: at("Tennison."), label: { text: "LE GAMBIT TENNISON", color: "gold" } },
  { t: at("saute"), move: { from: "f3", to: "e5", san: "Ce5" }, label: { text: "IL VISE f7", color: "gold" }, arrows: [{ from: "e5", to: "f7", color: "gold" }], marks: [{ sq: "f7", color: "gold" }] },
  { t: at("chasse"), move: { from: "f7", to: "f6", san: "f6" }, label: { text: "IL CHASSE TON CAVALIER", color: "red" }, arrows: [{ from: "f6", to: "e5", color: "red" }] },
  { t: at("Dame"), move: { from: "d1", to: "h5", san: "Dh5+" }, label: { text: "ÉCHEC !", color: "red" }, arrows: [{ from: "h5", to: "e8", color: "red" }], marks: [{ sq: "e8", color: "red" }], zoom: { sq: "f6", scale: 1.2 }, sfx: "impact" },
  { t: at("aucune"), label: { text: "AUCUNE CASE DE FUITE", color: "red" }, marks: [{ sq: "e8", color: "red" }, { sq: "d7", color: "red" }, { sq: "f7", color: "red" }] },
  { t: at("bloquer"), move: { from: "g7", to: "g6", san: "g6" }, label: { text: "IL DOIT BLOQUER", color: "grey" }, zoom: null },
  { t: at("c4…"), move: { from: "f1", to: "c4", san: "Fc4!" }, label: { text: "TA DAME EST EN PRISE", color: "red" }, arrows: [{ from: "g6", to: "h5", color: "red" }, { from: "c4", to: "f7", color: "gold" }], marks: [{ sq: "h5", color: "red" }], zoom: { sq: "f6", scale: 1.2 }, sfx: "whoosh" },
  { t: at("mange."), move: { from: "g6", to: "h5", san: "gxh5" }, label: { text: "IL MANGE LA DAME", color: "grey" } },
  { t: at("Fou"), move: { from: "c4", to: "f7", san: "Ff7#" }, label: { text: "PROTÉGÉ PAR LE CAVALIER", color: "green" }, arrows: [{ from: "e5", to: "f7", color: "green" }], marks: [{ sq: "e8", color: "red" }], sfx: "impact" },
  { t: at("Échec"), overlay: { title: "ÉCHEC ET MAT", sub: "6. Ff7#" }, zoom: null, sfx: "impact" },
  { t: at("Tu"), overlay: null, label: null, sfx: "whoosh" },
];

export const tennison: Lesson = {
  title: "Le gambit Tennison",
  subtitle: "Mat en 6 coups",
  audio: "mix-tennison.mp3",
  durationS: 36.5,
  captions,
  beats,
  promo: { t: at("Tu"), image: "ebook-couverture.png", price: "5,99 €", title: "10 PIÈGES|D'OUVERTURE" },
};
