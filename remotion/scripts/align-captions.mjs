// Aligne le texte exact du script sur les minutages Whisper (mot à mot).
// Usage : node scripts/align-captions.mjs script.txt words.json sortie.json
import fs from "node:fs";

const [scriptPath, wordsPath, outPath] = process.argv.slice(2);
const script = fs.readFileSync(scriptPath, "utf8").trim();

// Mots du script ; « ! » et « ? » isolés sont collés au mot précédent.
const sw = [];
for (const tok of script.split(/\s+/)) {
  if (/^[!?:;…]+$/.test(tok) && sw.length) sw[sw.length - 1] += " " + tok;
  else sw.push(tok);
}

// Mots Whisper ; on recolle les morceaux (« C » + « 'est », « ! »).
const ww = [];
for (const w of JSON.parse(fs.readFileSync(wordsPath, "utf8"))) {
  if ((/^['’]/.test(w.w) || /^[!?.,…]+$/.test(w.w)) && ww.length) {
    ww[ww.length - 1].w += w.w;
    ww[ww.length - 1].e = w.e;
  } else ww.push({ ...w });
}

const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

// Plus longue sous-séquence commune (égalité exacte, ou préfixe commun ≥ 3 lettres).
const eq = (a, b) => {
  const x = norm(a), y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const n = Math.min(x.length, y.length, 4);
  return n >= 3 && x.slice(0, n) === y.slice(0, n);
};
const n = sw.length, m = ww.length;
const L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
for (let i = n - 1; i >= 0; i--)
  for (let j = m - 1; j >= 0; j--)
    L[i][j] = eq(sw[i], ww[j].w) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
const match = new Array(n).fill(null);
for (let i = 0, j = 0; i < n && j < m; ) {
  if (eq(sw[i], ww[j].w)) { match[i] = ww[j]; i++; j++; }
  else if (L[i + 1][j] >= L[i][j + 1]) i++;
  else j++;
}

// Mots non appariés : interpolation entre les voisins appariés.
const out = sw.map((text, i) => ({ text, s: match[i]?.s, e: match[i]?.e }));
for (let i = 0; i < n; i++) {
  if (out[i].s !== undefined) continue;
  let a = i - 1; while (a >= 0 && out[a].s === undefined) a--;
  let b = i + 1; while (b < n && match[b] === null) b++;
  const t0 = a >= 0 ? out[a].e : 0;
  const t1 = b < n ? match[b].s : t0 + 0.4 * (b - i);
  const k = b - a;
  for (let q = a + 1; q < b; q++) {
    out[q].s = t0 + ((t1 - t0) * (q - a - 1)) / (k - 1);
    out[q].e = t0 + ((t1 - t0) * (q - a)) / (k - 1);
  }
  i = b - 1;
}
const res = out.map((o) => ({ text: o.text, startMs: Math.round(o.s * 1000), endMs: Math.round(o.e * 1000) }));
fs.writeFileSync(outPath, JSON.stringify(res, null, 1));
console.log(`${match.filter(Boolean).length}/${n} mots appariés`);
console.log(res.map((r) => `${r.text}@${(r.startMs / 1000).toFixed(2)}`).join(" "));
