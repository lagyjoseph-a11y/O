import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  AUDIO,
  Arrow,
  Beat,
  beats,
  captions,
  Color,
  KICKER,
  Mark,
  SUBTITLE,
  TITLE,
} from "./data";

// ---------- Mise en page ----------
const W = 1080;
const BOARD = 960; // cases
const FRAME = 22; // cadre bois
const SQ = BOARD / 8;
const BOARD_Y = 440;
const BOARD_X = (W - BOARD - FRAME * 2) / 2;
const FONT = "Inter, 'Inter Display', sans-serif";
const GOLD = "#f4b63a";

const COLORS: Record<Color, string> = {
  gold: GOLD,
  green: "#62c554",
  red: "#ef4a3c",
  grey: "#9a948c",
};

// ---------- Plateau ----------
const START: Record<string, string> = {};
"RNBQKBNR".split("").forEach((p, i) => {
  START[String.fromCharCode(97 + i) + "1"] = "w" + p;
  START[String.fromCharCode(97 + i) + "8"] = "b" + p;
  START[String.fromCharCode(97 + i) + "2"] = "wP";
  START[String.fromCharCode(97 + i) + "7"] = "bP";
});

type Piece = { id: string; type: string; sq: string };
type MoveState = {
  pieces: Piece[]; // position après le coup
  moved?: { id: string; from: string; to: string };
  captured?: Piece;
};

const sqXY = (sq: string) => ({
  x: (sq.charCodeAt(0) - 97) * SQ,
  y: (8 - Number(sq[1])) * SQ,
});
const center = (sq: string) => {
  const p = sqXY(sq);
  return { x: p.x + SQ / 2, y: p.y + SQ / 2 };
};

// États successifs (index = nombre de coups joués).
const moveBeats = beats.filter((b) => b.move);
const states: MoveState[] = (() => {
  let pieces: Piece[] = Object.keys(START).map((sq) => ({ id: sq, type: START[sq], sq }));
  const out: MoveState[] = [{ pieces }];
  for (const b of moveBeats) {
    const m = b.move!;
    const mover = pieces.find((p) => p.sq === m.from)!;
    const captured = pieces.find((p) => p.sq === m.to);
    pieces = pieces
      .filter((p) => p !== captured)
      .map((p) => (p === mover ? { ...p, sq: m.to, type: m.promo ? p.type[0] + m.promo : p.type } : p));
    out.push({ pieces, moved: { id: mover.id, from: m.from, to: m.to }, captured });
  }
  return out;
})();

// Dernière valeur définie d'une propriété de beat à l'instant t (+ instant du changement).
function latest<K extends keyof Beat>(t: number, key: K, clearOnMove = false): { value: Beat[K] | undefined; since: number } {
  let value: Beat[K] | undefined;
  let since = 0;
  for (const b of beats) {
    if (b.t > t) break;
    if (key in b) {
      value = b[key];
      since = b.t;
    } else if (clearOnMove && b.move) {
      value = undefined;
      since = b.t;
    }
  }
  return { value, since };
}

const ArrowSvg: React.FC<{ a: Arrow; progress: number }> = ({ a, progress }) => {
  const p0 = center(a.from);
  const p1 = center(a.to);
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const head = 44;
  const endLen = (len - 18) * progress;
  const ex = p0.x + ux * endLen;
  const ey = p0.y + uy * endLen;
  const bx = ex - ux * head;
  const by = ey - uy * head;
  const c = COLORS[a.color];
  return (
    <g opacity={0.88}>
      <line x1={p0.x} y1={p0.y} x2={bx} y2={by} stroke={c} strokeWidth={24} strokeLinecap="round" />
      <polygon
        points={`${ex},${ey} ${bx - uy * 30},${by + ux * 30} ${bx + uy * 30},${by - ux * 30}`}
        fill={c}
      />
    </g>
  );
};

const Board: React.FC<{ t: number; frame: number; fps: number }> = ({ t, frame, fps }) => {
  // Nombre de coups joués et progression du dernier.
  let n = 0;
  let lastT = 0;
  for (const b of moveBeats) {
    if (b.t <= t) {
      n++;
      lastT = b.t;
    }
  }
  const st = states[n];
  const prog = n === 0 ? 1 : interpolate((t - lastT) * fps, [0, 9], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const arrowsS = latest(t, "arrows", true);
  const marksS = latest(t, "marks", true);
  const arrows = arrowsS.value ?? [];
  const marks = marksS.value ?? [];
  const arrowProg = interpolate((t - arrowsS.since) * fps, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const squares = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const light = (r + f) % 2 === 0;
      squares.push(
        <div
          key={`${r}${f}`}
          style={{
            position: "absolute",
            left: f * SQ,
            top: r * SQ,
            width: SQ,
            height: SQ,
            background: light ? "#f0dcb4" : "#b5845a",
          }}
        />,
      );
    }
  }

  const lastMove = st.moved;
  const markEl = (m: Mark, i: number, pulse: number) => {
    const p = sqXY(m.sq);
    const c = COLORS[m.color];
    return (
      <div
        key={"m" + i}
        style={{
          position: "absolute",
          left: p.x,
          top: p.y,
          width: SQ,
          height: SQ,
          background: c,
          opacity: 0.38 + 0.12 * pulse,
          boxShadow: `inset 0 0 0 6px ${c}`,
        }}
      />
    );
  };
  const pulse = (Math.sin(frame / 4) + 1) / 2;

  return (
    <div style={{ position: "absolute", width: BOARD, height: BOARD }}>
      {squares}
      {lastMove
        ? [lastMove.from, lastMove.to].map((sq) => {
            const p = sqXY(sq);
            return (
              <div
                key={"lm" + sq}
                style={{
                  position: "absolute",
                  left: p.x,
                  top: p.y,
                  width: SQ,
                  height: SQ,
                  background: "rgba(255, 214, 80, 0.42)",
                }}
              />
            );
          })
        : null}
      {marks.map((m, i) => markEl(m, i, pulse))}
      {/* Coordonnées */}
      {"abcdefgh".split("").map((f, i) => (
        <div
          key={"f" + f}
          style={{
            position: "absolute",
            left: i * SQ + SQ - 22,
            top: BOARD - 30,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 20,
            color: i % 2 === 0 ? "#f0dcb4" : "#b5845a",
          }}
        >
          {f}
        </div>
      ))}
      {[8, 7, 6, 5, 4, 3, 2, 1].map((r, i) => (
        <div
          key={"r" + r}
          style={{
            position: "absolute",
            left: 6,
            top: i * SQ + 4,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 20,
            color: i % 2 === 0 ? "#b5845a" : "#f0dcb4",
          }}
        >
          {r}
        </div>
      ))}
      {/* Pièce capturée qui s'efface */}
      {st.captured && prog < 1 ? (
        <Img
          src={staticFile(`pieces/${st.captured.type[0]}${st.captured.type[1]}.svg`)}
          style={{
            position: "absolute",
            left: sqXY(st.captured.sq).x,
            top: sqXY(st.captured.sq).y,
            width: SQ,
            height: SQ,
            opacity: 1 - prog,
            transform: `scale(${1 - prog * 0.4})`,
          }}
        />
      ) : null}
      {st.pieces.map((p) => {
        let { x, y } = sqXY(p.sq);
        let scale = 1;
        let z = 1;
        if (lastMove && p.id === lastMove.id && prog < 1) {
          const a = sqXY(lastMove.from);
          x = a.x + (x - a.x) * prog;
          y = a.y + (y - a.y) * prog;
          scale = 1 + 0.14 * Math.sin(prog * Math.PI);
          z = 5;
        }
        return (
          <Img
            key={p.id}
            src={staticFile(`pieces/${p.type}.svg`)}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: SQ,
              height: SQ,
              zIndex: z,
              transform: `scale(${scale})`,
              filter: z > 1 ? "drop-shadow(0 10px 10px rgba(0,0,0,0.45))" : "drop-shadow(0 3px 2px rgba(0,0,0,0.25))",
            }}
          />
        );
      })}
      <svg width={BOARD} height={BOARD} style={{ position: "absolute", zIndex: 10 }}>
        {arrows.map((a, i) => (
          <ArrowSvg key={i} a={a} progress={arrowProg} />
        ))}
      </svg>
    </div>
  );
};

// ---------- Sous-titres karaoké ----------
type Page = { words: typeof captions; start: number; end: number };
const pages: Page[] = (() => {
  const out: Page[] = [];
  let cur: typeof captions = [];
  captions.forEach((c, i) => {
    cur.push(c);
    const breakHere = /[.,!?…]$/.test(c.text) || cur.length >= 3 || i === captions.length - 1;
    if (breakHere) {
      out.push({ words: cur, start: cur[0].startMs / 1000, end: 0 });
      cur = [];
    }
  });
  out.forEach((p, i) => (p.end = i + 1 < out.length ? out[i + 1].start : p.words[p.words.length - 1].endMs / 1000 + 1.2));
  return out;
})();

const Captions: React.FC<{ t: number; fps: number }> = ({ t, fps }) => {
  const page = pages.find((p) => t >= p.start && t < p.end);
  if (!page) return null;
  const enter = spring({ frame: Math.round((t - page.start) * fps), fps, config: { damping: 14, stiffness: 220 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 1640,
        left: 60,
        right: 60,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 82,
        lineHeight: 1.1,
        letterSpacing: -1,
        transform: `scale(${0.85 + 0.15 * enter}) translateY(${(1 - enter) * 20}px)`,
      }}
    >
      {page.words.map((w, i) => {
        const active = t >= w.startMs / 1000 && (i === page.words.length - 1 || t < page.words[i + 1].startMs / 1000);
        const said = t >= w.startMs / 1000;
        return (
          <span
            key={i}
            style={{
              color: active ? GOLD : "#ffffff",
              opacity: said ? 1 : 0.45,
              textShadow: active ? `0 0 28px rgba(244,182,58,0.55), 0 4px 0 rgba(0,0,0,0.5)` : "0 4px 0 rgba(0,0,0,0.55)",
              marginRight: 26,
              display: "inline-block",
              transform: active ? "scale(1.08)" : "none",
            }}
          >
            {w.text.replace(/[.,]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

// ---------- Notation ----------
const Ticker: React.FC<{ t: number }> = ({ t }) => {
  const played = moveBeats.filter((b) => b.t <= t);
  const toks = played.map((b, i) => ({ n: i % 2 === 0 ? `${i / 2 + 1}.` : i === 0 ? "" : "", s: b.move!.san, i }));
  const shown = toks.slice(-6);
  return (
    <div
      style={{
        position: "absolute",
        top: BOARD_Y + BOARD + FRAME * 2 + 26,
        left: BOARD_X + 10,
        fontFamily: "'DejaVu Sans Mono', monospace",
        fontSize: 34,
        color: "#8d857b",
        display: "flex",
        gap: 18,
        whiteSpace: "nowrap",
      }}
    >
      {shown.map((k) => {
        const last = k.i === toks.length - 1;
        return (
          <span key={k.i} style={{ color: last ? "#fff" : "#8d857b", fontWeight: last ? 700 : 400 }}>
            {k.n ? <span style={{ color: "#8d857b", marginRight: 8 }}>{k.n}</span> : k.i % 2 === 1 && k === shown[0] ? <span style={{ marginRight: 8 }}>{Math.ceil(k.i / 2)}…</span> : null}
            {k.s}
          </span>
        );
      })}
    </div>
  );
};

// ---------- Composition ----------
const fmt = (t: number) => {
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${(m < 10 ? "0" : "") + m}:${(s < 10 ? "0" : "") + s.toFixed(1)}`;
};

export const ChessLesson: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;

  // Caméra (zoom sur une zone du plateau).
  const zoomBeats = beats.filter((b) => "zoom" in b);
  let prevZ = { sq: "e4", scale: 1 };
  let curZ = { sq: "e4", scale: 1 };
  let zSince = -10;
  for (const b of zoomBeats) {
    if (b.t > t) break;
    prevZ = curZ;
    curZ = b.zoom ? b.zoom : { sq: prevZ.sq, scale: 1 };
    zSince = b.t;
  }
  const zp = spring({ frame: Math.round((t - zSince) * fps), fps, config: { damping: 20, stiffness: 90 } });
  const zc0 = center(prevZ.sq);
  const zc1 = center(curZ.sq);
  const zScale = prevZ.scale + (curZ.scale - prevZ.scale) * zp;
  const zx = zc0.x + (zc1.x - zc0.x) * zp;
  const zy = zc0.y + (zc1.y - zc0.y) * zp;

  // Secousse + flash sur les moments forts.
  const lastImpact = [...beats].reverse().find((b) => b.sfx === "impact" && b.t <= t);
  const sinceImpact = lastImpact ? (t - lastImpact.t) * fps : 999;
  const shakeAmp = interpolate(sinceImpact, [0, 12], [14, 0], { extrapolateRight: "clamp" });
  const shakeX = Math.sin(frame * 2.7) * shakeAmp;
  const shakeY = Math.cos(frame * 3.1) * shakeAmp * 0.6;
  const flash = interpolate(sinceImpact, [0, 6], [0.22, 0], { extrapolateRight: "clamp" });

  // Pulsation légère sur chaque coup.
  const lastMoveB = [...moveBeats].reverse().find((b) => b.t <= t);
  const sinceMove = lastMoveB ? (t - lastMoveB.t) * fps : 999;
  const punch = 1 + interpolate(sinceMove, [0, 4, 12], [0, 0.012, 0], { extrapolateRight: "clamp" });

  // Étiquette au-dessus du plateau.
  const lab = latest(t, "label");
  const labIn = spring({ frame: Math.round((t - lab.since) * fps), fps, config: { damping: 12, stiffness: 200 } });

  // Grand texte superposé.
  const ov = latest(t, "overlay");
  const ovIn = ov.value ? spring({ frame: Math.round((t - ov.since) * fps), fps, config: { damping: 11, stiffness: 160 } }) : 0;

  // Intro de l'en-tête.
  const headIn = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 50% 42%, #3a2717 0%, #1b120c 55%, #0a0705 100%)",
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile(AUDIO)} />
      {beats.map((b, i) =>
        b.move || b.sfx ? (
          <Sequence key={"s" + i} from={Math.round(b.t * fps)} durationInFrames={30} layout="none">
            <Audio
              src={staticFile(`sfx/${b.sfx ?? "move"}.wav`)}
              volume={b.sfx === "impact" ? 0.55 : b.sfx === "whoosh" ? 0.35 : 0.5}
            />
            {b.sfx && b.move ? <Audio src={staticFile("sfx/move.wav")} volume={0.5} /> : null}
          </Sequence>
        ) : null,
      )}

      {/* Lignes de texture */}
      <AbsoluteFill
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 9px)",
        }}
      />

      {/* En-tête */}
      <div style={{ position: "absolute", top: 90, left: 60, right: 60, opacity: headIn, transform: `translateY(${(1 - headIn) * -30}px)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: GOLD, fontSize: 26, fontWeight: 700, letterSpacing: 5 }}>
          <span>{KICKER}</span>
          <span style={{ fontFamily: "'DejaVu Sans Mono', monospace", letterSpacing: 2, color: "#b9a68a" }}>{fmt(t)}</span>
        </div>
        <div style={{ color: "#fff", fontSize: 62, fontWeight: 900, marginTop: 14, letterSpacing: -1.5, whiteSpace: "nowrap" }}>{TITLE}</div>
        <div style={{ color: "#cfc6ba", fontSize: 32, fontWeight: 500, marginTop: 6 }}>{SUBTITLE}</div>
        <div style={{ width: 210 * headIn, height: 5, background: GOLD, marginTop: 20, borderRadius: 3 }} />
      </div>

      {/* Barre de progression verticale */}
      <div style={{ position: "absolute", left: 14, top: BOARD_Y, width: 8, height: BOARD + FRAME * 2, background: "rgba(255,255,255,0.12)", borderRadius: 4 }}>
        <div style={{ width: 8, height: (BOARD + FRAME * 2) * (frame / durationInFrames), background: "#fff", borderRadius: 4 }} />
      </div>

      {/* Plateau avec cadre bois */}
      <div
        style={{
          position: "absolute",
          left: BOARD_X,
          top: BOARD_Y,
          width: BOARD + FRAME * 2,
          height: BOARD + FRAME * 2,
          background: "linear-gradient(145deg, #6b4428, #3d2414 60%, #5a3820)",
          borderRadius: 10,
          boxShadow: "0 30px 70px rgba(0,0,0,0.65), inset 0 0 0 2px rgba(255,220,170,0.15)",
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${punch})`,
        }}
      >
        <div style={{ position: "absolute", left: FRAME, top: FRAME, width: BOARD, height: BOARD, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              width: BOARD,
              height: BOARD,
              transformOrigin: `${zx}px ${zy}px`,
              transform: `scale(${zScale})`,
              filter: `brightness(${1 - 0.6 * ovIn})`,
            }}
          >
            <Board t={t} frame={frame} fps={fps} />
          </div>
          {/* Grand texte */}
          {ov.value ? (
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div
                style={{
                  transform: `scale(${0.6 + 0.4 * ovIn})`,
                  opacity: ovIn,
                  color: "#fff",
                  fontSize: 118,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: -3,
                  textShadow: "0 0 40px rgba(244,182,58,0.6), 0 8px 0 rgba(0,0,0,0.5)",
                  padding: "0 40px",
                }}
              >
                {ov.value.title}
                {ov.value.sub ? (
                  <div style={{ color: GOLD, fontSize: 52, fontWeight: 800, marginTop: 22, letterSpacing: 1 }}>{ov.value.sub}</div>
                ) : null}
              </div>
            </AbsoluteFill>
          ) : null}
        </div>
        {/* Flash blanc */}
        <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash, borderRadius: 10, pointerEvents: "none" }} />
      </div>

      {/* Étiquette */}
      {lab.value ? (
        <div style={{ position: "absolute", top: BOARD_Y - 34, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20 }}>
          <div
            style={{
              transform: `scale(${0.5 + 0.5 * labIn})`,
              opacity: labIn,
              background: "rgba(16,10,6,0.92)",
              border: `3px solid ${COLORS[lab.value.color]}`,
              color: COLORS[lab.value.color],
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: 4,
              padding: "10px 26px",
              borderRadius: 8,
              boxShadow: `0 0 26px ${COLORS[lab.value.color]}55`,
            }}
          >
            {lab.value.text}
          </div>
        </div>
      ) : null}

      <Ticker t={t} />
      <Captions t={t} fps={fps} />
    </AbsoluteFill>
  );
};
