// Construit l'e-book : node ebook/build.mjs  →  ebook/10-pieges-d-ouverture.pdf (+ couverture PNG)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { LIVRE, PIEGES, PLAN } from "./contenu.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(DIR, "../remotion/package.json"));
const { Chess } = require("chess.js");
const { chromium } = require("playwright");
const LIGNES = JSON.parse(fs.readFileSync(path.join(DIR, "pieges.json"), "utf8"));

// ---------- Pièces (cburnett, CC BY-SA 3.0) ----------
const PIECES = {};
for (const c of "wb") for (const p of "KQRBNP") {
  const svg = fs.readFileSync(path.join(DIR, `../remotion/public/pieces/${c}${p}.svg`));
  PIECES[c + p] = `data:image/svg+xml;base64,${svg.toString("base64")}`;
}

// ---------- Notation française ----------
const FR = { N: "C", B: "F", R: "T", Q: "D", K: "R" };
const fr = (san) => san.replace(/^[NBRQK]/, (m) => FR[m]).replace(/=([NBRQ])/, (_, m) => "=" + FR[m]);
const ligneFR = (sans, debut = 0) =>
  sans.map((s, i) => { const k = debut + i; return (k % 2 === 0 ? `${k / 2 + 1}. ` : i === 0 ? `${Math.ceil(k / 2)}… ` : "") + fr(s); }).join(" ");

// ---------- Diagramme SVG ----------
function diagramme(fen, { flip = false, last = null, rouge = [], taille = 300 } = {}) {
  const sq = taille / 8;
  const g = new Chess(fen);
  let out = `<svg viewBox="0 0 ${taille} ${taille}" width="${taille}" height="${taille}" xmlns="http://www.w3.org/2000/svg">`;
  const pos = (s) => { const f = s.charCodeAt(0) - 97, r = Number(s[1]); return flip ? [(7 - f) * sq, (r - 1) * sq] : [f * sq, (8 - r) * sq]; };
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++)
    out += `<rect x="${f * sq}" y="${r * sq}" width="${sq}" height="${sq}" fill="${(r + f) % 2 ? "#7393b8" : "#e6ecf3"}"/>`;
  if (last) for (const s of [last.from, last.to]) { const [x, y] = pos(s); out += `<rect x="${x}" y="${y}" width="${sq}" height="${sq}" fill="#35d6ff" opacity="0.45"/>`; }
  for (const s of rouge) { const [x, y] = pos(s); out += `<rect x="${x + 2}" y="${y + 2}" width="${sq - 4}" height="${sq - 4}" rx="5" fill="#ff4d6d" opacity="0.35" stroke="#ff4d6d" stroke-width="3"/>`; }
  for (const row of g.board()) for (const p of row) if (p) {
    const [x, y] = pos(p.square);
    out += `<image href="${PIECES[p.color + p.type.toUpperCase()]}" x="${x}" y="${y}" width="${sq}" height="${sq}"/>`;
  }
  const files = flip ? "hgfedcba" : "abcdefgh";
  for (let i = 0; i < 8; i++) {
    out += `<text x="${i * sq + sq - 3}" y="${taille - 3}" font-size="${sq * 0.2}" text-anchor="end" font-weight="700" fill="${i % 2 ? "#e6ecf3" : "#7393b8"}">${files[i]}</text>`;
    out += `<text x="3" y="${i * sq + sq * 0.24}" font-size="${sq * 0.2}" font-weight="700" fill="${i % 2 ? "#e6ecf3" : "#7393b8"}">${flip ? i + 1 : 8 - i}</text>`;
  }
  return out + "</svg>";
}

// Rejoue une ligne et renvoie l'état après n demi-coups.
function etat(coups, n) {
  const c = new Chess();
  let last = null;
  for (let i = 0; i < n; i++) last = c.move(coups[i]);
  return { fen: c.fen(), last, chess: c };
}

// ---------- Vérification de toutes les lignes ----------
const chapitres = PIEGES.map((p, i) => {
  const L = LIGNES.find((l) => l.id === p.id);
  if (!L) throw new Error("Ligne manquante : " + p.id);
  const fin = etat(L.coups, L.coups.length);
  if (!fin.chess.isCheckmate()) throw new Error("Pas de mat : " + p.id);
  const sans = L.coups.map((m, k) => etat(L.coups, k + 1).last.san);
  const flip = L.camp === "b";
  const roiPerdant = fin.chess.board().flat().find((x) => x && x.type === "k" && x.color === fin.chess.turn()).square;
  return { ...p, n: i + 1, nom: L.nom, camp: L.camp, sans, flip, fin, roiPerdant, nbCoups: Math.ceil(L.coups.length / 2) };
});

// ---------- HTML ----------
const css = `
@page { size: A5; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, 'Inter Display', sans-serif; color: #e9eef6; background: #0a1222; }
.page { width: 148mm; height: 210mm; padding: 14mm 13mm 16mm; position: relative; page-break-after: always; overflow: hidden;
  background: radial-gradient(ellipse at 50% 30%, #13223f 0%, #0a1222 55%, #060b16 100%); }
.page::before { content: ""; position: absolute; inset: 0; background-image: radial-gradient(rgba(140,180,255,0.10) 1px, transparent 1px); background-size: 14px 14px; pointer-events: none; }
.page > * { position: relative; }
.pied { position: absolute; bottom: 7mm; left: 13mm; right: 13mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: #6f7f99; }
.tag { display: inline-block; background: #35d6ff; color: #061020; font-weight: 900; font-size: 7.5pt; letter-spacing: 1.5px; padding: 3px 9px; border-radius: 99px; }
.tag.noir { background: #fff; }
h1 { font-size: 30pt; line-height: 1; margin: 6px 0; font-weight: 900; font-style: italic; color: #35d6ff; letter-spacing: -1px; text-transform: uppercase; text-shadow: 0 0 18px rgba(53,214,255,.45); }
h2 { font-size: 19pt; margin: 6px 0 2px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
h3 { font-size: 10pt; margin: 14px 0 5px; color: #35d6ff; text-transform: uppercase; letter-spacing: 1.5px; }
p, li { font-size: 9.6pt; line-height: 1.5; color: #d3dbe8; }
.accroche { font-size: 10.5pt; color: #fff; font-weight: 600; font-style: italic; margin: 2px 0 10px; }
.ligne { font-family: 'DejaVu Sans Mono', monospace; font-size: 8.6pt; background: rgba(120,150,200,.12); border: 1px solid rgba(120,150,200,.25); border-radius: 8px; padding: 8px 10px; color: #fff; line-height: 1.6; }
.diag { display: flex; flex-direction: column; align-items: center; margin: 10px 0 4px; }
.diag svg { border-radius: 10px; box-shadow: 0 0 0 3px #35d6ff, 0 0 26px rgba(53,214,255,.35); }
.legende { font-size: 8.5pt; color: #9fb0c8; margin-top: 8px; font-weight: 700; text-align: center; }
ol { padding-left: 16px; margin: 6px 0; } li { margin-bottom: 4px; }
.etapes { list-style: none; padding-left: 0; margin: 6px 0; } .etapes li { padding-left: 14px; position: relative; } .etapes li::before { content: ""; position: absolute; left: 0; top: 7px; width: 6px; height: 6px; border-radius: 50%; background: #35d6ff; }
.encart { border-left: 3px solid #35d6ff; background: rgba(53,214,255,.07); padding: 7px 10px; border-radius: 0 8px 8px 0; margin-top: 8px; }
.encart.rouge { border-color: #ff4d6d; background: rgba(255,77,109,.07); }
.encart b { color: #fff; }
.niveau { float: right; font-size: 7.5pt; font-weight: 800; color: #9fb0c8; border: 1px solid rgba(120,150,200,.35); border-radius: 99px; padding: 2px 8px; }
.grille { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px; }
.grille .diag { margin: 0; } .grille svg { box-shadow: 0 0 0 2px #35d6ff; border-radius: 6px; }
table { width: 100%; border-collapse: collapse; } td { font-size: 9.4pt; padding: 7px 4px; border-bottom: 1px solid rgba(120,150,200,.2); color: #d3dbe8; vertical-align: top; }
td:first-child { color: #35d6ff; font-weight: 800; white-space: nowrap; width: 22mm; }
.couv { display: flex; flex-direction: column; justify-content: space-between; padding: 18mm 14mm 16mm; }
`;

const pied = (num) => `<div class="pied"><span>${LIVRE.auteur}</span><span>${num}</span></div>`;
const pages = [];
let num = 0;
const page = (contenu, cls = "") => { num++; pages.push(`<section class="page ${cls}">${contenu}${cls.includes("couv") ? "" : pied(num)}</section>`); };

// Couverture
const couvDiag = diagramme(chapitres[0].fin.fen, { last: chapitres[0].fin.last, rouge: [chapitres[0].roiPerdant], taille: 330 });
const COUVERTURE = `
  <div><span class="tag">E-BOOK · ÉCHECS</span>
  <h1 style="font-size:40pt;margin-top:14px">10 pièges<br>d'ouverture</h1>
  <p style="font-size:12pt;color:#fff;font-weight:600;margin:0">${LIVRE.sousTitre}</p></div>
  <div class="diag">${couvDiag}</div>
  <div style="display:flex;justify-content:space-between;align-items:flex-end">
    <div><div style="font-size:9pt;color:#9fb0c8;font-weight:700;letter-spacing:2px">5 PIÈGES BLANCS · 5 PIÈGES NOIRS · 10 EXERCICES</div>
    <div style="font-size:14pt;font-weight:900;margin-top:6px">${LIVRE.auteur}</div></div>
  </div>`;
page(COUVERTURE, "couv");

// Sommaire
page(`<span class="tag">SOMMAIRE</span><h2 style="margin-top:12px">Au programme</h2>
<table>${chapitres.map((c) => `<tr><td>Piège ${c.n}</td><td><b style="color:#fff">${c.nom}</b><br><span style="font-size:8.4pt;color:#9fb0c8">${c.camp === "w" ? "Avec les blancs" : "Avec les noirs"} · mat en ${c.nbCoups} coups · ${c.niveau}</span></td></tr>`).join("")}
<tr><td>Bonus</td><td><b style="color:#fff">10 exercices + solutions</b></td></tr>
<tr><td>Bonus</td><td><b style="color:#fff">Ton plan sur 7 jours</b></td></tr></table>`);

// Mode d'emploi
page(`<span class="tag">AVANT DE COMMENCER</span><h2 style="margin-top:12px">Comment lire ce livre</h2>
<p>Chaque piège tient sur deux pages : l'idée, la ligne complète, le moment clé, le mat final, et surtout <b style="color:#fff">quoi faire si l'adversaire ne tombe pas dans le piège</b>.</p>
<h3>La notation</h3>
<table>
<tr><td>R D T F C</td><td>Roi, Dame, Tour, Fou, Cavalier (le pion n'a pas de lettre)</td></tr>
<tr><td>x</td><td>une prise : <b>Cxe5</b> = le cavalier prend en e5</td></tr>
<tr><td>+ / #</td><td>échec / échec et mat</td></tr>
<tr><td>=D</td><td>promotion : le pion devient une dame</td></tr>
<tr><td>! / !!</td><td>bon coup / coup brillant</td></tr>
<tr><td>? / ??</td><td>erreur / gaffe</td></tr>
<tr><td>O-O</td><td>petit roque</td></tr></table>
<h3>Les 3 règles d'or des pièges</h3>
<ol><li><b style="color:#fff">Vise f7 (ou f2).</b> Au début de la partie, ce pion n'est défendu que par le roi.</li>
<li><b style="color:#fff">Un échec avant tout.</b> Le camp qui donne des échecs garde l'initiative, même avec une pièce de moins.</li>
<li><b style="color:#fff">Ne mise pas tout sur le piège.</b> Un bon piège laisse une position jouable si l'adversaire le voit.</li></ol>`);

// Chapitres
for (const c of chapitres) {
  const cle = etat(LIGNES.find((l) => l.id === c.id).coups, c.cle);
  page(`<span class="tag ${c.camp === "b" ? "noir" : ""}">PIÈGE ${c.n} · ${c.camp === "w" ? "AVEC LES BLANCS" : "AVEC LES NOIRS"}</span><span class="niveau">${c.niveau}</span>
  <h2>${c.nom}</h2><p class="accroche">${c.accroche}</p>
  <p>${c.idee}</p>
  <div class="ligne">${ligneFR(c.sans)}</div>
  <div class="diag">${diagramme(cle.fen, { flip: c.flip, last: cle.last, taille: 250 })}<div class="legende">Le moment clé · ${c.cleTitre}</div></div>`);
  page(`<h3 style="margin-top:0">Étape par étape</h3><ul class="etapes">${c.etapes.map((e) => `<li>${e}</li>`).join("")}</ul>
  <div class="diag">${diagramme(c.fin.fen, { flip: c.flip, last: c.fin.last, rouge: [c.roiPerdant], taille: 210 })}<div class="legende">Position finale · ${fr(c.sans[c.sans.length - 1])} échec et mat</div></div>
  <div class="encart"><b>Pourquoi ça marche :</b> ${c.pourquoi}</div>
  <div class="encart rouge"><b>S'il ne tombe pas dans le piège :</b> ${c.parade}</div>`);
}

// Exercices
const exos = chapitres.map((c) => {
  const L = LIGNES.find((l) => l.id === c.id);
  const e = etat(L.coups, L.coups.length - 1);
  return { c, e };
});
for (let k = 0; k < 10; k += 4) {
  page(`<span class="tag">EXERCICES ${k + 1}-${Math.min(k + 4, 10)}</span><h2 style="margin-top:10px">Trouve le mat en 1</h2>
  <p style="margin-top:0">Le camp qui a le trait joue et donne échec et mat.</p>
  <div class="grille">${exos.slice(k, k + 4).map(({ c, e }) => `<div class="diag">${diagramme(e.fen, { flip: c.flip, last: e.last, taille: 190 })}<div class="legende">Exercice ${c.n} · ${c.camp === "w" ? "les blancs jouent" : "les noirs jouent"}</div></div>`).join("")}</div>`);
}
page(`<span class="tag">SOLUTIONS</span><h2 style="margin-top:12px">Les réponses</h2>
<table>${exos.map(({ c }) => `<tr><td>Exercice ${c.n}</td><td><b style="color:#fff">${fr(c.sans[c.sans.length - 1])}</b> — ${c.nom}</td></tr>`).join("")}</table>
<p style="margin-top:12px">Tu as trouvé moins de 7 bonnes réponses ? Relis les chapitres concernés et refais les exercices demain.</p>`);

// Plan + fin
page(`<span class="tag">TON PLAN</span><h2 style="margin-top:12px">7 jours pour les maîtriser</h2>
<table>${PLAN.map(([j, t]) => `<tr><td>${j}</td><td>${t}</td></tr>`).join("")}</table>
<div class="encart" style="margin-top:16px"><b>Le conseil final :</b> un piège ne remplace pas les bases. Développe tes pièces, roque tôt, et garde les pièges comme une arme surprise.</div>
<p style="margin-top:22px;font-size:11pt;color:#fff;font-weight:800">Merci d'avoir acheté ce livre !</p>
<p>Retrouve un nouveau piège chaque semaine sur TikTok : <b style="color:#35d6ff">${LIVRE.auteur}</b></p>
<p style="font-size:7.5pt;color:#6f7f99;margin-top:30px">Pièces d'échecs : Colin M.L. Burnett (jeu « cburnett »), licence CC BY-SA 3.0. Toutes les lignes de ce livre ont été vérifiées par ordinateur.<br>© ${new Date().getFullYear()} ${LIVRE.auteur} — usage personnel, reproduction interdite.</p>`);

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${LIVRE.titre}</title><style>${css}</style></head><body>${pages.join("")}</body></html>`;
fs.writeFileSync(path.join(DIR, "ebook.html"), html);

// Couverture seule (pour la vidéo et la boutique)
const couvHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${css} body{background:transparent}</style></head><body><section class="page couv">${COUVERTURE}</section></body></html>`;
fs.writeFileSync(path.join(DIR, "couverture.html"), couvHtml);

const browser = await chromium.launch();
const pg = await browser.newPage();
await pg.goto("file://" + path.join(DIR, "ebook.html"));
await pg.pdf({ path: path.join(DIR, "10-pieges-d-ouverture.pdf"), format: "A5", printBackground: true });
const pc = await browser.newPage({ viewport: { width: 559, height: 794 }, deviceScaleFactor: 2 });
await pc.goto("file://" + path.join(DIR, "couverture.html"));
await pc.screenshot({ path: path.join(DIR, "couverture.png"), clip: { x: 0, y: 0, width: 559, height: 794 } });
await browser.close();
console.log(`PDF : ${num} pages, ${chapitres.length} pièges vérifiés (mat réel à chaque fois).`);
