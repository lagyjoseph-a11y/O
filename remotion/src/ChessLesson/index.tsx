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
import { AUDIO, Arrow, Beat, beats, captions, Color, Mark, SUBTITLE, TITLE } from "./data";

// ---------- Identité visuelle « néon minuit » ----------
const W = 1080;
const BOARD = 960;
const BORDER = 5;
const SQ = BOARD / 8;
const BOARD_Y = 452;
const BOARD_X = (W - BOARD - BORDER * 2) / 2;
const FONT = "Inter, 'Inter Display', sans-serif";
const ACCENT = "#35d6ff";
const INK = "#061020";

const COLORS: Record<Color, string> = {
  gold: ACCENT,
  green: "#8cff5a",
  red: "#ff4d6d",
  grey: "#8b95a7",
};
const LIGHT_SQ = "#e6ecf3";
const DARK_SQ = "#7393b8";

// ---------- Plateau ----------
const START: Record<string, string> = {};
"RNBQKBNR".split("").forEach((p, i) => {
  START[String.fromCharCode(97 + i) + "1"] = "w" + p;
  START[String.fromCharCode(97 + i) + "8"] = "b" + p;
  START[String.fromCharCode(97 + i) + "2"] = "wP";
  START[String.fromCharCode(97 + i) + "7"] = "bP";
});

type Piece = { id: string; type: string; sq: string };
type MoveState = { pieces: Piece[]; moved?: { id: string; from: string; to: string }; captured?: Piece };

const sqXY = (sq: string) => ({ x: (sq.charCodeAt(0) - 97) * SQ, y: (8 - Number(sq[1])) * SQ });
const center = (sq: string) => {
  const p = sqXY(sq);
  return { x: p.x + SQ / 2, y: p.y + SQ / 2 };
};

const moveBeats = beats.filter((b) => b.move);
const TOTAL_MOVES = Math.ceil(moveBeats.length / 2);
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
  const head = 40;
  const endLen = (len - 16) * progress;
  const ex = p0.x + ux * endLen;
  const ey = p0.y + uy * endLen;
  const bx = ex - ux * head;
  const by = ey - uy * head;
  const c = COLORS[a.color];
  return (
    <g style={{ filter: `drop-shadow(0 0 10px ${c})` }}>
      <circle cx={p0.x} cy={p0.y} r={14} fill={c} />
      <line x1={p0.x} y1={p0.y} x2={bx} y2={by} stroke={c} strokeWidth={18} strokeLinecap="round" />
      <polygon points={`${ex},${ey} ${bx - uy * 28},${by + ux * 28} ${bx + uy * 28},${by - ux * 28}`} fill={c} />
    </g>
  );
};

const Board: React.FC<{ t: number; frame: number; fps: number }> = ({ t, frame, fps }) => {
  let n = 0;
  let lastT = 0;
  for (const b of moveBeats) {
    if (b.t <= t) {
      n++;
      lastT = b.t;
    }
  }
  const st = states[n];
  const prog = n === 0 ? 1 : interpolate((t - lastT) * fps, [0, 9], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const arrowsS = latest(t, "arrows", true);
  const marksS = latest(t, "marks", true);
  const arrows = arrowsS.value ?? [];
  const marks = marksS.value ?? [];
  const arrowProg = interpolate((t - arrowsS.since) * fps, [0, 10], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const pulse = (Math.sin(frame / 4) + 1) / 2;

  const squares = [];
  for (let r = 0; r < 8; r++)
    for (let f = 0; f < 8; f++)
      squares.push(
        <div key={`${r}${f}`} style={{ position: "absolute", left: f * SQ, top: r * SQ, width: SQ, height: SQ, background: (r + f) % 2 === 0 ? LIGHT_SQ : DARK_SQ }} />,
      );

  const lastMove = st.moved;
  const markEl = (m: Mark, i: number) => {
    const p = sqXY(m.sq);
    const c = COLORS[m.color];
    const inset = 8 - 3 * pulse;
    return (
      <div key={"m" + i} style={{ position: "absolute", left: p.x, top: p.y, width: SQ, height: SQ }}>
        <div style={{ position: "absolute", inset, borderRadius: 18, border: `6px solid ${c}`, background: `${c}40`, boxShadow: `0 0 24px ${c}` }} />
      </div>
    );
  };

  return (
    <div style={{ position: "absolute", width: BOARD, height: BOARD }}>
      {squares}
      {lastMove
        ? [lastMove.from, lastMove.to].map((sq) => {
            const p = sqXY(sq);
            return <div key={"lm" + sq} style={{ position: "absolute", left: p.x, top: p.y, width: SQ, height: SQ, background: "rgba(53,214,255,0.32)" }} />;
          })
        : null}
      {marks.map(markEl)}
      {"abcdefgh".split("").map((f, i) => (
        <div key={"f" + f} style={{ position: "absolute", left: i * SQ + SQ - 24, top: BOARD - 30, fontFamily: FONT, fontWeight: 800, fontSize: 20, color: i % 2 === 0 ? LIGHT_SQ : DARK_SQ }}>
          {f}
        </div>
      ))}
      {[8, 7, 6, 5, 4, 3, 2, 1].map((r, i) => (
        <div key={"r" + r} style={{ position: "absolute", left: 8, top: i * SQ + 6, fontFamily: FONT, fontWeight: 800, fontSize: 20, color: i % 2 === 0 ? DARK_SQ : LIGHT_SQ }}>
          {r}
        </div>
      ))}
      {st.captured && prog < 1 ? (
        <Img
          src={staticFile(`pieces/${st.captured.type}.svg`)}
          style={{ position: "absolute", left: sqXY(st.captured.sq).x, top: sqXY(st.captured.sq).y, width: SQ, height: SQ, opacity: 1 - prog, transform: `scale(${1 - prog * 0.4}) rotate(${prog * 25}deg)` }}
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
          scale = 1 + 0.16 * Math.sin(prog * Math.PI);
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
              filter: z > 1 ? `drop-shadow(0 0 14px ${ACCENT})` : "drop-shadow(0 3px 2px rgba(0,0,0,0.3))",
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

// ---------- Sous-titres : mot actif surligné ----------
type Page = { words: typeof captions; start: number; end: number };
const pages: Page[] = (() => {
  const out: Page[] = [];
  let cur: typeof captions = [];
  captions.forEach((c, i) => {
    cur.push(c);
    if (/[.,!?…]$/.test(c.text) || cur.length >= 3 || i === captions.length - 1) {
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
  const enter = interpolate((t - page.start) * fps, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: 1600,
        left: 50,
        right: 50,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px 14px",
        fontFamily: FONT,
        fontWeight: 900,
        fontStyle: "italic",
        fontSize: 80,
        lineHeight: 1.15,
        letterSpacing: -1,
        opacity: enter,
      }}
    >
      {page.words.map((w, i) => {
        const s = w.startMs / 1000;
        const active = t >= s && (i === page.words.length - 1 || t < page.words[i + 1].startMs / 1000);
        const said = t >= s;
        return (
          <span
            key={i}
            style={{
              color: active ? ACCENT : "#ffffff",
              opacity: said ? 1 : 0.4,
              padding: "2px 6px",
              textShadow: active ? `0 0 18px ${ACCENT}66, 0 4px 0 rgba(0,0,0,0.6)` : "0 4px 0 rgba(0,0,0,0.6)",
            }}
          >
            {w.text.replace(/[.,]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

// ---------- Notation en pastilles ----------
const Chips: React.FC<{ t: number }> = ({ t }) => {
  const played = moveBeats.filter((b) => b.t <= t);
  const shown = played.map((b, i) => ({ s: b.move!.san, i })).slice(-5);
  return (
    <div style={{ position: "absolute", top: BOARD_Y + BOARD + BORDER * 2 + 26, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 12 }}>
      {shown.map((k, j) => {
        const last = j === shown.length - 1;
        const num = k.i % 2 === 0 ? `${k.i / 2 + 1}.` : `${Math.ceil(k.i / 2)}…`;
        return (
          <div
            key={k.i}
            style={{
              fontFamily: FONT,
              fontSize: 30,
              fontWeight: last ? 900 : 600,
              padding: "8px 18px",
              borderRadius: 999,
              background: last ? ACCENT : "rgba(120,150,200,0.14)",
              color: last ? INK : "#9fb0c8",
              border: last ? "none" : "1.5px solid rgba(120,150,200,0.25)",
              boxShadow: last ? `0 0 22px ${ACCENT}88` : "none",
            }}
          >
            <span style={{ opacity: 0.6, marginRight: 8, fontWeight: 600 }}>{num}</span>
            {k.s}
          </div>
        );
      })}
    </div>
  );
};

// ---------- Composition ----------
export const ChessLesson: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;

  // Caméra
  let prevZ = { sq: "e4", scale: 1 };
  let curZ = { sq: "e4", scale: 1 };
  let zSince = -10;
  for (const b of beats.filter((x) => "zoom" in x)) {
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

  // Impacts : secousse + flash couleur
  const lastImpact = [...beats].reverse().find((b) => b.sfx === "impact" && b.t <= t);
  const sinceImpact = lastImpact ? (t - lastImpact.t) * fps : 999;
  const shakeAmp = interpolate(sinceImpact, [0, 12], [16, 0], { extrapolateRight: "clamp" });
  const shakeX = Math.sin(frame * 2.7) * shakeAmp;
  const shakeY = Math.cos(frame * 3.1) * shakeAmp * 0.6;
  const flash = interpolate(sinceImpact, [0, 7], [0.3, 0], { extrapolateRight: "clamp" });
  const flashColor = lastImpact?.overlay || lastImpact?.label?.color === "red" ? COLORS.red : ACCENT;

  const lastMoveB = [...moveBeats].reverse().find((b) => b.t <= t);
  const movesPlayed = moveBeats.filter((b) => b.t <= t).length;
  const sinceMove = lastMoveB ? (t - lastMoveB.t) * fps : 999;
  const punch = 1 + interpolate(sinceMove, [0, 4, 12], [0, 0.012, 0], { extrapolateRight: "clamp" });

  const lab = latest(t, "label");
  const labIn = spring({ frame: Math.round((t - lab.since) * fps), fps, config: { damping: 13, stiffness: 210 } });
  const ov = latest(t, "overlay");
  const ovIn = ov.value ? spring({ frame: Math.round((t - ov.since) * fps), fps, config: { damping: 14, stiffness: 170 } }) : 0;
  const headIn = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const coup = Math.max(1, Math.ceil(movesPlayed / 2));

  const [titleA, titleB] = (() => {
    const m = TITLE.match(/^(.*?gambit)\s+(.*)$/i);
    return m ? [m[1], m[2]] : ["", TITLE];
  })();

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #13223f 0%, #0a1222 50%, #04070e 100%)", fontFamily: FONT, overflow: "hidden" }}>
      <Audio src={staticFile(AUDIO)} />
      {beats.map((b, i) =>
        b.move || b.sfx ? (
          <Sequence key={"s" + i} from={Math.round(b.t * fps)} durationInFrames={30} layout="none">
            <Audio src={staticFile(`sfx/${b.sfx ?? "move"}.wav`)} volume={b.sfx === "impact" ? 0.5 : b.sfx === "whoosh" ? 0.3 : 0.45} />
            {b.sfx && b.move ? <Audio src={staticFile("sfx/move.wav")} volume={0.45} /> : null}
          </Sequence>
        ) : null,
      )}

      {/* Grille de points + balayage lumineux */}
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(140,180,255,0.13) 1.5px, transparent 1.5px)", backgroundSize: "36px 36px" }} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, transparent 40%, rgba(53,214,255,0.07) 50%, transparent 60%)`,
          transform: `translateX(${interpolate(frame % 240, [0, 240], [-1100, 1100])}px)`,
        }}
      />

      {/* En-tête centré */}
      <div style={{ position: "absolute", top: 78, left: 0, right: 0, textAlign: "center", opacity: headIn, transform: `translateY(${(1 - headIn) * -30}px)` }}>
        <div style={{ display: "inline-block", background: ACCENT, color: INK, fontWeight: 900, fontSize: 26, letterSpacing: 4, padding: "8px 20px", borderRadius: 999 }}>PIÈGE D'OUVERTURE</div>
        <div style={{ color: "#fff", fontSize: 46, fontWeight: 800, letterSpacing: 8, marginTop: 22, textTransform: "uppercase" }}>{titleA}</div>
        <div
          style={{
            color: ACCENT,
            fontSize: 92,
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: -2,
            lineHeight: 1,
            marginTop: 2,
            textTransform: "uppercase",
            textShadow: `0 0 36px ${ACCENT}88`,
            whiteSpace: "nowrap",
          }}
        >
          {titleB}
        </div>
        <div style={{ color: "#9fb0c8", fontSize: 28, fontWeight: 700, letterSpacing: 6, marginTop: 16 }}>{SUBTITLE.toUpperCase()}</div>
      </div>

      {/* Infos au-dessus du plateau */}
      <div style={{ position: "absolute", top: BOARD_Y - 58, left: BOARD_X, right: BOARD_X, display: "flex", justifyContent: "flex-end", gap: 12, fontWeight: 800, fontSize: 26 }}>
        <div style={{ color: INK, background: "#fff", padding: "6px 16px", borderRadius: 999 }}>
          COUP {coup}/{TOTAL_MOVES}
        </div>
      </div>

      {/* Plateau */}
      <div
        style={{
          position: "absolute",
          left: BOARD_X,
          top: BOARD_Y,
          width: BOARD + BORDER * 2,
          height: BOARD + BORDER * 2,
          borderRadius: 30,
          background: `linear-gradient(135deg, ${ACCENT}, #2a4a8a 50%, ${ACCENT})`,
          boxShadow: `0 0 70px rgba(53,214,255,0.28), 0 40px 80px rgba(0,0,0,0.6)`,
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${punch})`,
        }}
      >
        <div style={{ position: "absolute", left: BORDER, top: BORDER, width: BOARD, height: BOARD, overflow: "hidden", borderRadius: 26 }}>
          <div style={{ position: "absolute", width: BOARD, height: BOARD, transformOrigin: `${zx}px ${zy}px`, transform: `scale(${zScale})`, filter: `brightness(${1 - 0.55 * ovIn}) saturate(${1 - 0.5 * ovIn})` }}>
            <Board t={t} frame={frame} fps={fps} />
          </div>
          {/* Bande diagonale */}
          {ov.value ? (
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  width: 1400,
                  transform: `rotate(-7deg) translateX(${(1 - ovIn) * -1400}px)`,
                  background: ov.value.title.includes("MAT") ? COLORS.red : ACCENT,
                  padding: "26px 0 22px",
                  textAlign: "center",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                }}
              >
                <div style={{ color: INK, fontSize: 104, fontWeight: 900, fontStyle: "italic", letterSpacing: -3, lineHeight: 1 }}>{ov.value.title}</div>
                {ov.value.sub ? <div style={{ color: INK, fontSize: 44, fontWeight: 800, marginTop: 10, opacity: 0.8 }}>{ov.value.sub}</div> : null}
              </div>
            </AbsoluteFill>
          ) : null}
        </div>
        <div style={{ position: "absolute", inset: 0, background: flashColor, opacity: flash, borderRadius: 30, pointerEvents: "none" }} />
      </div>

      {/* Sticker d'étiquette */}
      {lab.value ? (
        <div style={{ position: "absolute", top: BOARD_Y - 30, left: BOARD_X - 6, zIndex: 20 }}>
          <div
            style={{
              transform: `translateX(${(1 - labIn) * -80}px) rotate(${-4 * labIn}deg) scale(${0.7 + 0.3 * labIn})`,
              transformOrigin: "left center",
              opacity: labIn,
              background: COLORS[lab.value.color],
              color: INK,
              fontSize: 36,
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: 1,
              padding: "12px 24px",
              borderRadius: 12,
              boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 30px ${COLORS[lab.value.color]}66`,
            }}
          >
            {lab.value.text}
          </div>
        </div>
      ) : null}

      <Chips t={t} />
      <Captions t={t} fps={fps} />

      {/* Barre de progression en bas */}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 10, width: W * (frame / durationInFrames), background: `linear-gradient(90deg, #2a4a8a, ${ACCENT})`, boxShadow: `0 0 20px ${ACCENT}` }} />
    </AbsoluteFill>
  );
};
