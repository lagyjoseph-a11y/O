# Studio vidéo — leçons d'échecs format court (9:16)

Style de référence : `reference/exemple-gambit.mp4` (aperçu : `reference/apercu-gambit.png`,
transcription : `reference/transcript-gambit.txt`).

Ce qu'on y voit : plateau animé, flèches vertes/rouges, cases surlignées, étiquettes
(« IL VISE f7 », « ÉCHEC ! »), notation qui défile sous le plateau, sous-titres mot à mot
avec le mot prononcé en jaune, zooms, écrans « TU CONNAIS SON NOM ? », voix off rapide en français.

## Installé

| Outil | Où | Lancer |
|---|---|---|
| **Remotion** 4 (template TikTok + sous-titres Whisper) + `chess.js` | `remotion/` | `cd remotion && npm run dev` / `npx remotion render` |
| **HyperFrames** 0.9 (HeyGen, vidéo en HTML + GSAP) | `hyperframes/` | `cd hyperframes && npx hyperframes preview` / `npx hyperframes render` |
| **ffmpeg / ffprobe** 6.1 | système | `ffmpeg` |
| **whisper.cpp** + modèle `medium` (écoute / transcription FR mot à mot) | `tools/whisper.cpp/` | `tools/transcribe.sh video.mp4 sortie` |
| **Kokoro** (voix locale gratuite, secours si pas d'ElevenLabs) | `tools/kokoro/` | `tools/venv/bin/python tools/tts_kokoro.py "texte" out.wav ff_siwis` |
| Skills agent Remotion (13) + HyperFrames (6) | `.claude/skills/` | chargés automatiquement par Claude Code |

| **ElevenLabs** (connecteur claude.ai) | — | voix off, effets sonores, transcription |
| `chessground` (pièces/plateau Lichess) + `stockfish` (moteur) | `remotion/node_modules` | `import` dans Remotion |
| Dépôts GitHub clonés + dépendances installées | `external/` | voir ci-dessous |
| Skills tirés des dépôts : `toolkit-elevenlabs`, `toolkit-ffmpeg`, `toolkit-video-design`, `toolkit-moviepy`, `faceless-make-short`, `faceless-suggest-sfx` | `.claude/skills/` | |

Les outils lourds et `external/` ne sont pas versionnés : `./setup.sh` les réinstalle.

## Trouvé sur GitHub

**Échecs**
- [jhlywa/chess.js](https://github.com/jhlywa/chess.js) — règles, coups légaux, PGN/FEN (installé dans `remotion/`).
- [lichess-org/chessground](https://github.com/lichess-org/chessground) — plateau de Lichess, flèches/surlignages ; ses pièces SVG (cburnett) sont réutilisables.
- [Clariity/react-chessboard](https://github.com/Clariity/react-chessboard) — plateau React (mieux vaut un plateau SVG maison piloté par `useCurrentFrame()` dans Remotion).
- [lichess-org/stockfish.wasm](https://github.com/lichess-org/stockfish.wasm) — moteur pour vérifier les lignes / trouver les pièges.
- [erayzeki/chess-to-video](https://github.com/erayzeki/chess-to-video), [shaack/pgn-to-video-converter](https://github.com/shaack/pgn-to-video-converter) — PGN → vidéo (idées de pipeline).

**Sous-titres / format court**
- [remotion-dev/template-tiktok](https://github.com/remotion-dev/template-tiktok) — base de `remotion/` (sous-titres mot à mot).
- [hassancs91/claude-faceless-shorts-creator](https://github.com/hassancs91/claude-faceless-shorts-creator) — Shorts « faceless » Remotion + voix ElevenLabs avec timestamps mot à mot : le plus proche de ce style.
- [tsensei/OpenReels](https://github.com/tsensei/OpenReels), [jnMetaCode/openshorts](https://github.com/jnMetaCode/openshorts) — pipelines sujet → script → voix → Short.
- [DojoCodingLabs/remotion-superpowers](https://github.com/DojoCodingLabs/remotion-superpowers) — skills de production Remotion pour Claude Code.

**Boîtes à outils agent vidéo**
- [digitalsamba/claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit) — script, voix IA, musique, rendu.
- [OpenMontageInc/OpenMontage](https://github.com/OpenMontageInc/OpenMontage) — système de production vidéo agentique complet.
- [zhuyansen/awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) — liste de 180 repos de skills vidéo.
- [nexu-io/html-video](https://github.com/nexu-io/html-video) — alternative HTML → MP4.
