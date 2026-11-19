// Contenu de l'e-book « 10 pièges d'ouverture » — @gambit_frr
// Chaque ligne de coups est vérifiée par chess.js au moment de la construction (le mat doit être réel).
// cle = nombre de demi-coups joués avant le « moment clé » ; exo = demi-coups joués avant le coup de mat.

export const LIVRE = {
  titre: "10 pièges d'ouverture",
  sousTitre: "pour gagner tes parties en moins de 20 coups",
  auteur: "@gambit_frr",
  prix: "5,99 €",
};

export const PIEGES = [
  {
    id: "tennison",
    niveau: "Débutant",
    accroche: "Le cavalier et le fou attaquent f7, et ta dame sert d'appât.",
    cle: 8,
    cleTitre: "À toi de jouer : 5. Fc4 !",
    idee:
      "Tu commences par 1. Cf3, un coup calme, puis tu offres ton pion e4. Les noirs le prennent presque toujours. Ton cavalier saute ensuite en e5 et vise directement f7, la case la plus faible du camp noir au début de la partie.",
    etapes: [
      "1. Cf3 d5 2. e4 : tu offres le pion e4.",
      "2… dxe4 3. Ce5 : ton cavalier se place au centre et vise f7.",
      "3… f6 : les noirs chassent ton cavalier, mais ils affaiblissent la diagonale e8-h5.",
      "4. Dh5+ g6 : le roi n'a aucune case, les noirs doivent bloquer.",
      "5. Fc4 ! : tu laisses ta dame en prise et tu vises f7 avec le fou.",
      "5… gxh5?? 6. Ff7# : le fou est protégé par le cavalier e5, le roi ne peut pas le prendre.",
    ],
    pourquoi:
      "Le pion f7 n'est défendu que par le roi. En jouant 3… f6, les noirs ont ouvert la diagonale vers leur roi : le cavalier e5 et le fou c4 suffisent alors à donner un mat imparable.",
    parade:
      "Si les noirs ne jouent pas 3… f6 (par exemple 3… Cf6 ou 3… Cd7), il n'y a pas de piège : développe tes pièces (d3, Cc3) et cherche à récupérer le pion e4. Et si après 5. Fc4 ils ne prennent pas la dame, garde l'œil sur f7.",
  },
  {
    id: "blackmar",
    niveau: "Intermédiaire",
    accroche: "Un sacrifice de dame, puis un pion qui devient une nouvelle dame.",
    cle: 12,
    cleTitre: "À toi de jouer : 7. dxc6 !!",
    idee:
      "Contre 1… d5, tu joues 2. e4 et tu sacrifies un pion pour développer tes pièces très vite. Ta dame et ton fou mettent ensuite le roi noir sous pression, jusqu'à un final spectaculaire.",
    etapes: [
      "1. d4 d5 2. e4 dxe4 3. Cc3 Cc6 : les deux camps se développent.",
      "4. d5 Ce5 5. Dd4 : ta dame attaque le cavalier e5 et le pion e4.",
      "5… Cg6 6. Fb5+ c6 : les noirs bloquent l'échec avec un pion. C'est l'erreur.",
      "7. dxc6 !! : tu laisses ta dame en prise.",
      "7… Dxd4 8. cxb7+ : échec à la découverte du fou b5.",
      "8… Fd7 9. bxa8=D# : le pion prend la tour, devient une dame et c'est mat.",
    ],
    pourquoi:
      "Après 8. cxb7+, les noirs doivent parer l'échec du fou b5. Leur fou se met en d7, mais il est cloué : il ne peut plus bloquer la rangée 8. La nouvelle dame en a8 donne mat sur toute la rangée.",
    parade:
      "Après 6. Fb5+, la meilleure défense est 6… Fd7 : les noirs échangent les fous et la partie continue. Toi, garde ton avance de développement et ne te précipite pas.",
  },
  {
    id: "roi",
    niveau: "Débutant",
    accroche: "Un double échec : le roi ne peut aller nulle part.",
    cle: 10,
    cleTitre: "À toi de jouer : 6. De2 !",
    idee:
      "Le gambit du roi est l'une des ouvertures les plus agressives : tu offres le pion f4 pour ouvrir le jeu. Dans ce piège, ta dame se place discrètement sur la colonne e, derrière ton cavalier.",
    etapes: [
      "1. e4 e5 2. f4 exf4 : les noirs acceptent le gambit.",
      "3. Cf3 d5 4. Cc3 dxe4 5. Cxe4 : tu reprends le pion avec le cavalier.",
      "5… Fg4 : le fou cloue ton cavalier f3 sur ta dame.",
      "6. De2 ! : ta dame se place sur la colonne e, derrière le cavalier e4.",
      "6… Fxf3?? : les noirs prennent ton cavalier.",
      "7. Cf6# : double échec, du cavalier et de la dame. C'est mat.",
    ],
    pourquoi:
      "Un double échec ne se pare qu'en déplaçant le roi. Ici, d7 est contrôlée par le cavalier f6 et e7 par la dame e2 : le roi n'a aucune case.",
    parade:
      "Si les noirs ne prennent pas en f3 et bloquent la colonne e (par exemple 6… De7 ou 6… Fe7), le piège ne marche plus : continue ton développement avec d4 et Fxf4.",
  },
  {
    id: "legal",
    niveau: "Débutant",
    accroche: "Le plus célèbre des pièges : tu donnes ta dame et tu mates avec trois pièces.",
    cle: 8,
    cleTitre: "À toi de jouer : 5. Cxe5 !",
    idee:
      "Le piège de Légal date du XVIIIe siècle et fonctionne toujours en blitz. Le fou noir cloue ton cavalier sur ta dame… mais ce clouage n'est qu'une illusion.",
    etapes: [
      "1. e4 e5 2. Cf3 d6 3. Fc4 Fg4 : le fou cloue ton cavalier sur ta dame.",
      "4. Cc3 g6? : un coup trop lent.",
      "5. Cxe5 ! : tu ignores le clouage et tu laisses ta dame en prise.",
      "5… Fxd1?? 6. Fxf7+ Re7 : le roi n'a qu'une case.",
      "7. Cd5# : le cavalier, le fou et le cavalier e5 bloquent toutes les cases.",
    ],
    pourquoi:
      "Après 6. Fxf7+, le roi noir est forcé d'aller en e7. Le cavalier d5 donne alors échec, et toutes les cases autour du roi sont contrôlées par tes trois pièces ou occupées par ses propres pièces.",
    parade:
      "Si les noirs ne prennent pas ta dame et jouent 5… dxe5, reprends le fou avec 6. Dxg4 : tu as gagné un pion et une bonne position.",
  },
  {
    id: "soller",
    niveau: "Intermédiaire",
    accroche: "Avec les noirs : ton cavalier abandonne la dame et ton fou mate en f2.",
    cle: 9,
    cleTitre: "À toi de jouer (noirs) : 5… Ce4 !!",
    idee:
      "Le gambit Soller est une variante du gambit Englund. Contre 1. d4, tu réponds 1… e5 puis 2… f6 : tu sacrifies des pions pour ouvrir des lignes vers le roi blanc, et surtout vers la case f2.",
    etapes: [
      "1. d4 e5 2. dxe5 f6 : tu offres un deuxième pion.",
      "3. exf6 Cxf6 4. Cf3 Fc5 : ton fou vise f2.",
      "5. Fg5? : le fou blanc cloue ton cavalier sur ta dame.",
      "5… Ce4 !! : ton cavalier abandonne la dame et protège f2.",
      "6. Fxd8?? Fxf2# : le roi ne peut pas reprendre, ton cavalier défend f2.",
    ],
    pourquoi:
      "Le roi blanc n'a aucune case de fuite : d2 est contrôlée par le cavalier e4, e2 et f1 sont occupées par ses propres pièces, et f2 est protégée par ton cavalier.",
    parade:
      "Si les blancs ne jouent pas 5. Fg5 mais un coup calme (e3, Cc3), continue ton développement : roque, Cc6, et garde ton fou sur la diagonale de f2.",
  },
  {
    id: "englund",
    niveau: "Intermédiaire",
    accroche: "Avec les noirs : ta dame dévore l'aile dame et mate en c1.",
    cle: 7,
    cleTitre: "À toi de jouer (noirs) : 4… Db4+ !",
    idee:
      "Le gambit Englund (1. d4 e5) surprend beaucoup de joueurs. Ta dame en e7 prépare une attaque rapide sur le pion b2, puis sur le roi blanc resté au centre.",
    etapes: [
      "1. d4 e5 2. dxe5 Cc6 3. Cf3 De7 : ta dame attaque le pion e5.",
      "4. Ff4? Db4+ : échec, et ta dame attaque aussi b2.",
      "5. Fd2 Dxb2 : tu manges le pion et tu menaces la tour a1.",
      "6. Fc3 Fb4 ! : tu cloues le fou c3 sur le roi.",
      "7. Dd2 Fxc3 8. Dxc3 Dc1# : la dame mate sur la première rangée.",
    ],
    pourquoi:
      "Après 8. Dxc3, la case d2 n'est plus protégée et la dame blanche a quitté d1. Ta dame en c1 donne échec, et le roi n'a aucune case : d2 est contrôlée par ta dame, et le cavalier b1 empêche la tour de reprendre.",
    parade:
      "Si les blancs ne jouent pas 4. Ff4, récupère simplement ton pion en e5 dès que possible et développe tes pièces normalement.",
  },
  {
    id: "budapest",
    niveau: "Intermédiaire",
    accroche: "Avec les noirs : un mat du cavalier en plein milieu de l'échiquier.",
    cle: 13,
    cleTitre: "À toi de jouer (noirs) : 7… Cgxe5 !",
    idee:
      "Le gambit de Budapest répond à 1. d4 Cf6 2. c4 par 2… e5. Tu récupères souvent le pion, et le cavalier d3 devient un cauchemar pour les blancs.",
    etapes: [
      "1. d4 Cf6 2. c4 e5 3. dxe5 Cg4 : ton cavalier attaque e5.",
      "4. Ff4 Cc6 5. Cf3 Fb4+ 6. Cbd2 De7 : tu mets la pression sur e5.",
      "7. a3 Cgxe5 ! : tu récupères le pion et tu laisses ton fou attaqué.",
      "8. axb4?? Cd3# : le cavalier donne échec et le roi est enfermé.",
    ],
    pourquoi:
      "Le pion e2 ne peut pas prendre en d3 : il est cloué par ta dame e7 sur la colonne e. Le roi blanc est bloqué par ses propres pièces, c'est un mat « étouffé ».",
    parade:
      "Si les blancs ne prennent pas ton fou mais jouent 8. e3, échange-le (8… Fxd2+) : tu as récupéré ton pion et ta position est très confortable.",
  },
  {
    id: "stafford",
    niveau: "Intermédiaire",
    accroche: "Avec les noirs : un sacrifice de dame et deux fous qui finissent le travail.",
    cle: 11,
    cleTitre: "À toi de jouer (noirs) : 6… Cxe4 !",
    idee:
      "Le gambit Stafford est devenu célèbre en ligne : tu sacrifies le pion e5 contre 2. Cf3, puis tes pièces se ruent sur le roi blanc.",
    etapes: [
      "1. e4 e5 2. Cf3 Cf6 3. Cxe5 Cc6 4. Cxc6 dxc6 : la colonne d s'ouvre pour ta dame.",
      "5. d3 Fc5 : ton fou vise f2.",
      "6. Fg5? Cxe4 ! : tu laisses ta dame en prise.",
      "7. Fxd8?? Fxf2+ 8. Re2 Fg4# : tes deux fous et ton cavalier enferment le roi.",
    ],
    pourquoi:
      "Après 8. Re2, le fou g4 donne échec sur la diagonale. Le roi ne peut ni avancer ni reculer : toutes ses cases sont contrôlées par ton fou f2, ton fou g4 et ton cavalier e4.",
    parade:
      "Si les blancs jouent un coup prudent au lieu de 6. Fg5 (par exemple 6. Fe2), roque et développe tes pièces : tu as un pion de moins mais une belle activité.",
  },
  {
    id: "shilling",
    niveau: "Débutant",
    accroche: "Avec les noirs : ta dame entre en g2 et le cavalier mate en f3.",
    cle: 7,
    cleTitre: "À toi de jouer (noirs) : 4… Dg5 !",
    idee:
      "Le gambit Blackburne-Shilling (3… Cd4 dans la partie italienne) semble perdre un pion. Si les blancs prennent avec avidité, ta dame contre-attaque immédiatement.",
    etapes: [
      "1. e4 e5 2. Cf3 Cc6 3. Fc4 Cd4 : un coup piège qui laisse e5.",
      "4. Cxe5? Dg5 ! : ta dame attaque le cavalier e5 et le pion g2.",
      "5. Cxf7?? Dxg2 6. Tf1 Dxe4+ : tu manges les pions avec échec.",
      "7. Fe2 Cf3# : le cavalier donne échec et le fou e2 est cloué.",
    ],
    pourquoi:
      "Le fou e2 ne peut pas prendre le cavalier f3 : il est cloué par ta dame e4 sur le roi. Et le roi n'a aucune case de fuite.",
    parade:
      "Si les blancs ne prennent pas en e5 (par exemple 4. Cxd4 exd4 ou 4. O-O), il n'y a pas de piège : continue ton développement normalement.",
  },
  {
    id: "siberien",
    niveau: "Avancé",
    accroche: "Avec les noirs : un mat en h2 caché dans le gambit Smith-Morra.",
    cle: 17,
    cleTitre: "À toi de jouer (noirs) : 9… Cd4 !",
    idee:
      "Contre le gambit Smith-Morra (1. e4 c5 2. d4 cxd4 3. c3), ta dame en c7 et ton cavalier en g4 préparent une attaque sur h2. Il suffit d'un coup naturel des blancs pour que tout s'effondre.",
    etapes: [
      "1. e4 c5 2. d4 cxd4 3. c3 dxc3 4. Cxc3 Cc6 5. Cf3 e6 6. Fc4 Dc7 : les noirs se développent.",
      "7. O-O Cf6 8. De2 Cg4 : ton cavalier et ta dame visent h2.",
      "9. h3?? Cd4 ! : ton cavalier attaque la dame e2 et dévie le cavalier f3.",
      "10. Cxd4 Dh2# : la dame mate en h2, protégée par le cavalier g4.",
    ],
    pourquoi:
      "Le cavalier f3 défendait h2. En le forçant à prendre en d4, tu supprimes la seule défense de h2 : ta dame y entre avec mat.",
    parade:
      "Si les blancs ne jouent pas 9. h3, continue simplement ton développement (Fe7, roque). Pour eux, la bonne défense consiste à protéger h2 avant de chasser ton cavalier.",
  },
];

export const PLAN = [
  ["Jour 1", "Lis les pièges 1 à 3 et rejoue-les sur un vrai échiquier."],
  ["Jour 2", "Lis les pièges 4 à 6. Rejoue chaque ligne trois fois, sans regarder."],
  ["Jour 3", "Lis les pièges 7 à 10."],
  ["Jour 4", "Fais les 10 exercices sans regarder les solutions."],
  ["Jour 5", "Joue 5 parties en blitz en tentant tes pièges préférés."],
  ["Jour 6", "Analyse tes parties : où l'adversaire a-t-il évité le piège ?"],
  ["Jour 7", "Choisis 2 pièges avec les blancs et 2 avec les noirs, et garde-les dans ton répertoire."],
];
