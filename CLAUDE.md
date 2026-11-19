# Studio vidéo @gambit_frr — règles du projet

Vidéos TikTok verticales (1080×1920) de pièges d'échecs, faites avec Remotion (`remotion/`).

## Règles obligatoires
- **Watermark `@gambit_frr` sur CHAQUE vidéo**, en bas, blanc semi-transparent (35 %). Il est intégré au modèle commun
  (`remotion/src/ChessLesson/brand.ts`) : ne jamais le retirer ni faire une vidéo hors de ce modèle sans lui.
  Vérifier sa présence sur une image avant d'envoyer une vidéo.
- **Style « néon minuit »** (bleu nuit, accent cyan #35d6ff, plateau bleu ardoise) : `remotion/src/ChessLesson/index.tsx`.
- **Voix** : ElevenLabs, voix Léo (`AfbuxQ9DVtS4azaxN1W7`), modèle `eleven_v4`, avec indications [excited]/[dramatic]/[intense],
  1 seule prise (`generations_count: 1`). Toujours dire combien de crédits ça coûte ; demander avant toute dépense non prévue.
- **Traitement voix** : `tools/process_voice.sh brute.mp3 seche.mp3` (moins de résonance, plus proche).
- **Musique** : « August » (Intelligency), fournie par l'utilisateur, NON versionnée (droits). Le passage fort du morceau
  est à 76,395 s : le caler vers le milieu de la vidéo (pas à la fin). `tools/mix_music.sh voix musique DEBUT DUREE sortie`.
- **Sous-titres** : mot actif en cyan, sans boîte ni mouvement.
- Notation française (C, F, T, D, R), vérifier chaque ligne avec chess.js (le mat doit être réel).

## Nouvelle vidéo
1. Relever les coups (vidéo d'exemple → images), valider avec chess.js.
2. Écrire le script, générer la voix (Léo), `process_voice.sh`, `tools/word_times.py` puis `scripts/align-captions.mjs`.
3. Créer `remotion/src/ChessLesson/lessons/<id>.ts` et l'ajouter dans `lessons/index.ts`.
4. Mixer la musique, rendre : `npx remotion render Gambit-<id> ../renders/<nom>.mp4 --codec=h264 --crf=18`.
