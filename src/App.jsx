import React, { useState, useRef, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc } from "firebase/firestore";

// --- CONFIGURATION FIREBASE ---
// N'OUBLIE PAS DE REMPLACER "XXXXX" PAR TA VRAIE CLÉ !
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// --- BASE DE DONNÉES DES QUESTIONS ---
const QUESTIONS = [
  // --- NIVEAU 1 : Collège - Les Fondamentaux (iPad & Vie scolaire) ---
  {
    niveau: 1,
    question: "Tu trouves une clé USB par terre devant le 3C. Que fais-tu ?",
    options: [
      "Je la branche sur mon iPad avec un adaptateur pour voir à qui elle est.",
      "Je la donne immédiatement à l'accueil ou à la vie scolaire.",
      "Je la formate depuis le PC d'impression pour l'utiliser en cours.",
      "Je l'ignore, c'est le problème de quelqu'un d'autre."
    ],
    reponse: 1,
    explication: "Ne connecte jamais un support inconnu à ton matériel. Il pourrait contenir un virus ou un script malveillant qui s'exécute automatiquement."
  },
  {
    niveau: 1,
    question: "Tu es au 3C et tu dois aller aux toilettes. Comme ton iPad n'a pas de code de verrouillage :",
    options: [
      "Je le laisse sur la table, je reviens vite.",
      "Je ferme juste la housse de protection.",
      "Je le glisse dans mon sac et je l'emmène avec moi (ou je le confie à un ami sûr).",
      "Je baisse la luminosité au minimum pour qu'on ne voie rien."
    ],
    reponse: 2,
    explication: "Sans code de déverrouillage, n'importe qui peut ouvrir ton iPad, lire tes messages, envoyer des emails en ton nom ou effacer tes devoirs. La sécurité physique est ta seule protection !"
  },
  {
    niveau: 1,
    question: "Un ami te demande tes identifiants ÉcoleDirecte pour 'récupérer les devoirs car son compte bugue'.",
    options: [
      "Je lui donne, c'est normal d'aider un ami.",
      "Je refuse, mes identifiants sont strictement personnels.",
      "Je lui donne mais je change mon mot de passe le lendemain.",
      "Je lui donne seulement mon mot de passe, pas mon identifiant."
    ],
    reponse: 1,
    explication: "On ne partage JAMAIS ses identifiants scolaires. S'il fait une bêtise sur l'ENT (insulte, suppression de document), c'est ton nom qui apparaîtra et tu seras le seul responsable."
  },
  {
    niveau: 1,
    question: "Tu reçois un message urgent : 'Alerte ÉcoleDirecte : Ton compte va être supprimé. Clique ici pour confirmer ton mot de passe.'",
    options: [
      "Je clique vite pour ne pas perdre mes cours.",
      "Je transfère le mail à mes camarades pour voir s'ils l'ont eu.",
      "Je ne clique pas, je me connecte à ÉcoleDirecte via mon application habituelle pour vérifier.",
      "Je réponds au mail en donnant mon mot de passe pour prouver que c'est moi."
    ],
    reponse: 2,
    explication: "C'est du Phishing (hameçonnage). Les pirates créent un sentiment d'urgence. L'école ne te demandera jamais de cliquer sur un lien par mail pour fournir ton mot de passe."
  },
  {
    niveau: 1,
    question: "Sur un site web, une grosse alerte rouge apparaît : 'ATTENTION, ton iPad est infecté par 3 virus ! Clique ici pour nettoyer.'",
    options: [
      "Je clique immédiatement pour télécharger l'antivirus proposé.",
      "Je ferme simplement l'onglet, c'est une fausse publicité.",
      "Je redémarre mon iPad 3 fois de suite.",
      "Je clique sur le lien mais je ne donne pas mon nom."
    ],
    reponse: 1,
    explication: "C'est une arnaque classique (Scareware) pour te faire paniquer. Un site web ne peut pas scanner ton iPad. Ferme l'onglet, tu ne risques rien."
  },

  // --- NIVEAU 2 : Collège - Les risques du quotidien ---
  {
    niveau: 2,
    question: "Qu'est-ce qui rend un mot de passe VRAIMENT difficile à deviner pour un ordinateur ?",
    options: [
      "Mettre beaucoup de caractères spéciaux (@, #, !).",
      "Sa longueur (ex: une phrase secrète comme 'Le-Chat-Mange-Une-Pomme').",
      "Le changer toutes les semaines.",
      "L'écrire à l'envers."
    ],
    reponse: 1,
    explication: "La longueur bat la complexité. Une 'phrase de passe' (longue et facile à retenir pour toi) est beaucoup plus dure à craquer pour une machine qu'un mot court et compliqué comme 'M@th12!'."
  },
  {
    niveau: 2,
    question: "Pourquoi est-il dangereux d'utiliser le MÊME mot de passe pour TikTok, Snapchat et ÉcoleDirecte ?",
    options: [
      "Parce que c'est interdit par la loi.",
      "Parce que l'iPad va se bloquer s'il détecte des doublons.",
      "Si un seul de ces sites est piraté, le hacker aura accès à TOUS tes autres comptes.",
      "Ça prend trop de place dans la mémoire de l'appareil."
    ],
    reponse: 2,
    explication: "Si TikTok se fait pirater, les hackers essaieront ton adresse email et ton mot de passe TikTok sur tous les autres sites (Insta, mail, école) pour voir si ça marche."
  },
  {
    niveau: 2,
    question: "Tu trouves une vidéo sur YouTube qui offre '10 000 V-Bucks/Robux gratuits' si tu te connectes sur un lien en description.",
    options: [
      "Je fonce, c'est une super occasion.",
      "Je me connecte mais avec un faux compte pour tester.",
      "Je signale la vidéo, c'est une arnaque pour voler mes identifiants de jeu.",
      "Je partage le lien à mes amis pour qu'ils essaient d'abord."
    ],
    reponse: 2,
    explication: "Rien n'est gratuit sur Internet. Ces faux générateurs sont conçus pour récupérer le mot de passe de ton compte de jeu afin de le voler et le revendre."
  },
  {
    niveau: 2,
    question: "Un camarade te laisse son iPad déverrouillé sur sa table. Que fais-tu ?",
    options: [
      "J'envoie un message drôle à quelqu'un depuis son compte, c'est juste une blague.",
      "Je fouille vite fait dans ses photos.",
      "Je ne touche à rien ou je verrouille son écran pour le protéger.",
      "Je change son fond d'écran."
    ],
    reponse: 2,
    explication: "L'usurpation d'identité (même 'pour rire') est un délit puni par la loi. En cybersécurité, on protège le matériel des autres comme on aimerait qu'on protège le sien."
  },
  {
    niveau: 2,
    question: "Concernant ton identité numérique, que se passe-t-il quand tu publies une photo puis que tu la supprimes 5 minutes plus tard ?",
    options: [
      "Elle disparaît définitivement d'Internet.",
      "Seule la police peut encore la voir.",
      "Quelqu'un a pu faire une capture d'écran, elle peut donc exister pour toujours.",
      "Elle reste visible uniquement pendant 24h."
    ],
    reponse: 2,
    explication: "Internet n'oublie jamais rien. Avant de publier ou d'envoyer un message ou une photo, pars du principe que tout le monde pourrait le voir un jour."
  },

  // --- NIVEAU 3 : Lycée - Réseaux et Bonnes pratiques (Un peu plus complexe) ---
  {
    niveau: 3,
    question: "Tu es au McDo ou dans une gare et tu connectes ton PC au 'Wi-Fi Gratuit'. Quel est le risque majeur ?",
    options: [
      "Que la connexion soit trop lente pour charger tes cours.",
      "Qu'un pirate connecté sur le même Wi-Fi intercepte tes données de navigation.",
      "D'attraper un virus informatique instantanément juste en te connectant.",
      "De payer des frais cachés à ton opérateur téléphonique."
    ],
    reponse: 1,
    explication: "Sur un réseau Wi-Fi public ouvert (sans mot de passe), n'importe qui utilisant un logiciel d'analyse gratuit peut potentiellement 'écouter' les données non chiffrées que tu envoies."
  },
  {
    niveau: 3,
    question: "Que garantit réellement le petit cadenas 🔒 (HTTPS) à côté de l'URL d'un site web ?",
    options: [
      "Que le site est 100% légitime et sécurisé.",
      "Que le site a été scanné et ne contient aucun malware.",
      "Uniquement que la communication entre ton appareil et le site est chiffrée.",
      "Que l'entreprise propriétaire du site est certifiée par l'État."
    ],
    reponse: 2,
    explication: "Attention au mythe du cadenas ! Il signifie seulement que la connexion est chiffrée (illisible par un espion). Mais un pirate peut très bien créer un site frauduleux parfait AVEC un cadenas HTTPS."
  },
  {
    niveau: 3,
    question: "C'est quoi la MFA (Authentification Multi-Facteurs), de plus en plus obligatoire sur vos comptes ?",
    options: [
      "Un puissant pare-feu intégré au Cloud.",
      "L'obligation d'avoir deux mots de passe différents pour un même compte.",
      "Prouver ton identité avec deux éléments distincts (ex: ton mot de passe + une notification sur ton smartphone).",
      "Un réseau privé virtuel (VPN) pour contourner les blocages."
    ],
    reponse: 2,
    explication: "La MFA combine ce que tu sais (ton mot de passe) et ce que tu possèdes (ton téléphone). Même si un pirate devine ton mot de passe, il ne pourra pas se connecter sans ton téléphone."
  },
  {
    niveau: 3,
    question: "Pourquoi est-il crucial de faire les mises à jour (Windows, iOS, macOS) dès qu'elles sont demandées ?",
    options: [
      "Surtout pour obtenir les nouveaux designs et emojis.",
      "Pour corriger (patcher) des failles de sécurité récemment découvertes.",
      "Pour libérer de l'espace de stockage sur l'appareil.",
      "Pour éviter que la garantie de l'appareil ne saute."
    ],
    reponse: 1,
    explication: "Les mises à jour contiennent des correctifs critiques. Les ignorer, c'est laisser la porte ouverte aux pirates qui connaissent et exploitent ces failles désormais publiques."
  },
  {
    niveau: 3,
    question: "En gestion de données (cours, projets), c'est quoi la règle de sauvegarde absolue '3-2-1' ?",
    options: [
      "3 mots de passe, 2 comptes, 1 antivirus.",
      "3 copies de tes données, sur 2 supports différents, dont 1 hors-ligne ou sur le Cloud.",
      "3 clics max pour atteindre un fichier, 2 dossiers, 1 disque dur.",
      "Faire 3 sauvegardes par mois, 2 par semaine, 1 par jour."
    ],
    reponse: 1,
    explication: "Avoir son projet sur son PC + sur une clé USB + sur un Cloud (OneDrive/Google Drive). C'est la seule protection garantie contre la perte, le vol ou le piratage."
  },

  // --- NIVEAU 4 : Pôle Sup & Professeurs - Expert (Concepts Balèzes) ---
  {
    niveau: 4,
    question: "Comment un 'Ransomware' (Rançongiciel) paralyse-t-il une infrastructure scolaire ou d'entreprise ?",
    options: [
      "Il efface les disques durs et détruit le matériel physiquement.",
      "Il vole les données confidentielles et les publie instantanément sur le dark web.",
      "Il chiffre (verrouille) les fichiers serveurs et exige un paiement pour la clé de déchiffrement.",
      "Il surcharge le réseau d'emails spams jusqu'à faire exploser les serveurs."
    ],
    reponse: 2,
    explication: "Le ransomware rend les données illisibles. Sans la clé de déchiffrement (ou sans une sauvegarde isolée), l'organisation ne peut plus fonctionner."
  },
  {
    niveau: 4,
    question: "En cryptographie, quelle est la différence fondamentale entre 'Chiffrer' et 'Hacher' (Hash) une donnée ?",
    options: [
      "Le chiffrement est réversible (avec une clé), le hachage est une opération à sens unique.",
      "Le chiffrement est plus rapide mais moins sûr que le hachage.",
      "Le hachage est utilisé pour les fichiers lourds, le chiffrement pour les mots de passe.",
      "Il n'y a aucune différence technique, ce sont des synonymes."
    ],
    reponse: 1,
    explication: "Une base de données sécurisée stocke l'empreinte de ton mot de passe (le Hash), pas le mot de passe lui-même. C'est irréversible : on ne peut pas retrouver le mot de passe à partir du hash."
  },
  {
    niveau: 4,
    question: "Quelle est la différence entre le 'Phishing' classique et le 'Spear-Phishing' ?",
    options: [
      "Le spear-phishing attaque directement les serveurs au lieu des mails.",
      "Le spear-phishing est une attaque d'ingénierie sociale ultra-ciblée et personnalisée contre un individu précis.",
      "Le spear-phishing n'utilise pas de liens malveillants, seulement des pièces jointes.",
      "Le phishing cible les particuliers, le spear-phishing cible les entreprises."
    ],
    reponse: 1,
    explication: "Contrairement au phishing classique (envoyé en masse), le spear-phishing est taillé sur mesure pour la victime (ex: un mail qui cite ses collègues, ses projets ou la direction de Jean XXIII)."
  },
  {
    niveau: 4,
    question: "En sécurité informatique, qu'est-ce qu'une vulnérabilité 'Zero-Day' ?",
    options: [
      "Une faille critique qui permet de formater un système en moins de 24 heures.",
      "Un malware programmé pour s'autodétruire sans laisser aucune trace.",
      "Une faille exploitée par des pirates avant même que l'éditeur du logiciel n'en ait connaissance ou n'ait publié de correctif.",
      "Une attaque qui ramène la configuration d'un serveur à son jour zéro (paramètres d'usine)."
    ],
    reponse: 2,
    explication: "C'est la menace ultime (et la plus chère au marché noir). L'éditeur ayant eu 'zéro jour' pour réagir, il n'existe aucune parade au moment où les attaques commencent."
  },
  {
    niveau: 4,
    question: "Sur quel principe strict repose l'architecture de sécurité réseau 'Zero Trust' (Zéro Confiance) ?",
    options: [
      "Interdire toute connexion à internet depuis le réseau interne.",
      "Ne faire confiance par défaut à aucun appareil ni utilisateur, même s'ils sont déjà authentifiés à l'intérieur du réseau de l'école.",
      "Bloquer systématiquement toutes les communications entrantes depuis l'extérieur.",
      "Imposer un renouvellement des mots de passe tous les jours à minuit."
    ],
    reponse: 1,
    explication: "L'ancien modèle (le château fort) pensait : 'Si tu es dans le réseau de l'école, tu es sûr'. Le Zero Trust affirme : 'La menace peut venir de l'intérieur, on vérifie continuellement chaque action'."
  }
];

export default function CyberQuizJeanXXIII() {
  const [gameState, setGameState] = useState('login');
  const [playerName, setPlayerName] = useState('');
  const [profCode, setProfCode] = useState('');
  const [isProf, setIsProf] = useState(false);
  
  // NOUVEAU : État pour gérer l'affichage de la fenêtre des règles. (true = ouvert au lancement)
  const [showRules, setShowRules] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  const [leaderboardEleves, setLeaderboardEleves] = useState([]);
  const [leaderboardProfs, setLeaderboardProfs] = useState([]);

  const CODE_ADMIN_SECRET = "ADMIN2026";
  const isAdminSession = profCode === CODE_ADMIN_SECRET;

  useEffect(() => {
    const q = query(collection(db, "scores"), orderBy("score", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eleves = [];
      const profs = [];
      
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        data.id = docSnapshot.id; 
        
        if (data.isProf) {
          profs.push(data);
        } else {
          eleves.push(data);
        }
      });
      
      setLeaderboardEleves(eleves);
      setLeaderboardProfs(profs);
    });

    return () => unsubscribe();
  }, []);

  const deleteScore = async (id) => {
    if (window.confirm("Action Administrateur : Es-tu sûr de vouloir supprimer ce score définitivement ?")) {
      try {
        await deleteDoc(doc(db, "scores", id));
      } catch (error) {
        console.error("Erreur de suppression : ", error);
      }
    }
  };

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.15;
    }
  }, []);

  useEffect(() => {
    if (gameState === 'quiz') {
      const currentQ = QUESTIONS[currentIndex];
      let optionsMapped = currentQ.options.map((opt, i) => ({
        text: opt,
        isCorrect: i === currentQ.reponse
      }));
      
      for (let i = optionsMapped.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsMapped[i], optionsMapped[j]] = [optionsMapped[j], optionsMapped[i]];
      }
      
      setShuffledOptions(optionsMapped);
      setShowExplanation(false);
      setSelectedAnswer(null);
    }
  }, [currentIndex, gameState]);

const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      // On force la lecture et on capture l'erreur si le fichier est introuvable
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMusicPlaying(true);
          })
          .catch((error) => {
            console.error("Erreur audio détectée :", error);
            alert("Erreur : Le fichier audio est introuvable. Vérifie qu'il est bien dans le dossier 'public' et nommé exactement 'musique.mp3'");
            setIsMusicPlaying(false);
          });
      }
    }
  };
  const startGame = (e) => {
    e.preventDefault();
    if (isAdminSession) return;

    if (playerName.trim().length > 2) {
      if (profCode === '123456') { 
        setIsProf(true);
      }
      setGameState('quiz');
    }
  };

  const handleAnswer = (index, isCorrect) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentIndex + 1 < QUESTIONS.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setGameState('result');
      try {
        await addDoc(collection(db, "scores"), {
          nom: playerName,
          score: score,
          isProf: isProf,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Erreur de connexion : ", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-emerald-500 font-mono relative selection:bg-emerald-900 selection:text-emerald-100 flex flex-col justify-between overflow-hidden">
      
      {/* Fenêtre Modale de Briefing (Règles et Prévention) */}
      {showRules && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="neon-border bg-black/95 p-6 md:p-10 max-w-2xl w-full text-left shadow-2xl rounded-lg">
            <h2 className="text-2xl font-bold neon-text mb-6 uppercase tracking-widest text-emerald-400 border-b border-emerald-900 pb-4">
              &gt; Protocole d'Engagement
            </h2>
            <div className="space-y-4 text-sm md:text-base text-emerald-100 leading-relaxed mb-8">
              <p>
                <strong className="text-emerald-500">CONTEXTE :</strong> Octobre est le Mois de la Cybersécurité. L'Ensemble Scolaire Jean XXIII lance une simulation générale pour tester vos défenses numériques.
              </p>
              <p>
                <strong className="text-emerald-500">OBJECTIF :</strong> Sensibiliser aux menaces réelles du quotidien (sécurité des iPads, phishing sur ÉcoleDirecte, vols de mots de passe, etc.) à travers une expérience interactive.
              </p>
              <p className="pt-2">
                <strong className="text-emerald-500">DÉROULEMENT DU DÉFI :</strong>
              </p>
              <ul className="list-disc pl-5 space-y-2 text-emerald-200/80">
                <li>Le test comporte <strong className="text-emerald-400">20 questions</strong> (du niveau Collège à Expert).</li>
                <li>Lisez attentivement l'analyse après chaque réponse pour apprendre les bons réflexes.</li>
                <li>
                  <strong className="text-blue-400">La Compétition :</strong> Le système met à jour en temps réel un classement opposant les meilleurs Élèves aux meilleurs Professeurs.
                </li>
              </ul>
            </div>
            <button
              onClick={() => setShowRules(false)}
              className="w-full border border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-400 font-bold py-4 rounded transition-all uppercase tracking-widest cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              [ J'ai compris, accepter la mission ]
            </button>
          </div>
        </div>
      )}

      {/* EFFETS DE FOND */}
      <audio ref={audioRef} src="/musique.mp3" loop preload="auto" />
      <div className="cyber-glow"></div>
      <div className="cyber-grid"></div>
      <div className="scanner-line"></div>
      <div className="scanlines"></div>

      <div className="relative z-10 p-4 md:p-8 flex flex-col items-center justify-center grow">
        
        <header className="w-full max-w-6xl mb-12 border-b border-emerald-900/50 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 backdrop-blur-sm">
          <div>
            <p className="text-xs text-emerald-600 mb-1">Connexion sécurisée établie...</p>
            <h1 className="text-2xl md:text-3xl font-bold neon-text tracking-widest uppercase">
              Ensemble_Scolaire<br/>
              <span className="text-white">Jean_XXIII</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* NOUVEAU BOUTON : Permet de réafficher les règles depuis le menu principal */}
            <button 
              onClick={() => setShowRules(true)}
              className="text-xs font-bold border border-emerald-500 text-emerald-400 px-4 py-2 bg-emerald-950/40 hover:bg-emerald-900/80 transition-colors cursor-pointer rounded shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            >
              [ ℹ️ PROTOCOLE ]
            </button>
            
            <button 
              onClick={toggleMusic}
              className="text-xs border border-emerald-800 px-4 py-2 bg-emerald-950/40 hover:bg-emerald-900/80 transition-colors cursor-pointer rounded"
            >
              {isMusicPlaying ? '🔊 AUDIO ON' : '🔈 AUDIO OFF'}
            </button>
          </div>
        </header>

        {gameState === 'login' && (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="hidden lg:block neon-border bg-black/40 backdrop-blur-md p-6 rounded-lg min-h-75">
              <h3 className="text-emerald-400 font-bold mb-4 border-b border-emerald-900/50 pb-3 flex items-center gap-2">
                <span className="animate-pulse h-2 w-2 bg-emerald-500 rounded-full"></span>
                TOP OPÉRATEURS (Élèves)
              </h3>
              <ul className="space-y-3 text-sm">
                {leaderboardEleves.length === 0 ? <p className="text-emerald-800 italic">En attente d'activités réseau...</p> : null}
                {leaderboardEleves.slice(0, 10).map((joueur, i) => (
                  <li key={joueur.id} className="flex justify-between items-center text-emerald-100 hover:text-emerald-400 transition-colors group">
                    <span className="truncate pr-4">{i + 1}. {joueur.nom}</span>
                    <div className="flex items-center">
                      <span className="text-emerald-500 font-bold bg-emerald-950/50 px-2 py-1 rounded">{joueur.score}/20</span>
                      {isAdminSession && (
                        <button onClick={() => deleteScore(joueur.id)} className="ml-3 text-red-500 hover:text-red-300 font-bold">
                          [X]
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="neon-border bg-black/60 backdrop-blur-lg p-8 rounded-lg w-full shadow-2xl shadow-emerald-900/20">
              <p className="text-emerald-400 mb-8 flex items-center text-lg font-bold">
                <span className="mr-3 text-2xl">&gt;</span> Authentification requise...
              </p>
              
              <form onSubmit={startGame} className="space-y-6">
                <div>
                  <label className="block text-xs mb-2 text-emerald-600 uppercase tracking-wider">Identifiant Opérateur</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-3.5 text-emerald-700 transition-colors group-focus-within:text-emerald-400">~#</span>
                    <input 
                      type="text" 
                      placeholder="Prénom Nom"
                      className="w-full pl-12 p-3 bg-black/50 border border-emerald-900/80 rounded focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:outline-none transition-all text-emerald-300 placeholder:text-emerald-900"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      required={!isAdminSession}
                      disabled={isAdminSession}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-2 text-emerald-800 uppercase tracking-wider">Accréditation (Optionnel)</label>
                  <input 
                    type="password" 
                    placeholder="Code d'accès sécurisé" 
                    className="w-full p-3 bg-black/50 border border-emerald-900/50 rounded focus:border-emerald-600 focus:outline-none transition-all text-emerald-600 placeholder:text-emerald-900/50"
                    value={profCode}
                    onChange={(e) => setProfCode(e.target.value)}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isAdminSession}
                  className={`w-full py-4 rounded transition-all uppercase tracking-widest font-bold mt-6 shadow-lg hover:shadow-emerald-900/50
                    ${isAdminSession ? 'border border-red-500 bg-red-950/30 text-red-500' : 'border border-emerald-500 bg-emerald-900/20 hover:bg-emerald-500 hover:text-black text-emerald-400 cursor-pointer'}`}
                >
                  {isAdminSession ? "[ MODE ADMIN ACTIF ]" : "Lancer l'Intrusion"}
                  {!isAdminSession && <span className="animate-blink inline-block w-2 h-4 bg-current ml-3 align-middle"></span>}
                </button>
              </form>
            </div>

            <div className="hidden lg:block neon-border bg-black/40 backdrop-blur-md p-6 rounded-lg min-h-75 border-blue-900/50">
              <h3 className="text-blue-400 font-bold mb-4 border-b border-blue-900/50 pb-3 flex items-center gap-2">
                <span className="animate-pulse h-2 w-2 bg-blue-500 rounded-full"></span>
                TOP ADMINISTRATEURS (Profs)
              </h3>
              <ul className="space-y-3 text-sm">
                 {leaderboardProfs.length === 0 ? <p className="text-blue-900 italic">En attente de connexions...</p> : null}
                 {leaderboardProfs.slice(0, 10).map((prof, i) => (
                  <li key={prof.id} className="flex justify-between items-center text-blue-200 hover:text-blue-400 transition-colors group">
                    <span className="truncate pr-4">{i + 1}. {prof.nom}</span>
                    <div className="flex items-center">
                      <span className="text-blue-500 font-bold bg-blue-950/50 px-2 py-1 rounded">{prof.score}/20</span>
                      {isAdminSession && (
                        <button onClick={() => deleteScore(prof.id)} className="ml-3 text-red-500 hover:text-red-300 font-bold">
                          [X]
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

        {gameState === 'quiz' && (
          <div className="w-full max-w-3xl">
            <div className="flex justify-between items-center mb-6 text-sm backdrop-blur-sm bg-black/30 p-4 rounded neon-border">
              <p>
                <span className={isProf ? "text-blue-500 font-bold" : "text-emerald-600"}>
                  {isProf ? "ADMIN :" : "OPÉRATEUR :"}
                </span> <span className="text-emerald-100 ml-2">{playerName}</span>
              </p>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-emerald-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${((currentIndex) / QUESTIONS.length) * 100}%` }}></div>
                </div>
                <p className="text-emerald-500 font-bold">
                  {currentIndex + 1}/{QUESTIONS.length}
                </p>
              </div>
            </div>

            <div className="neon-border bg-black/60 backdrop-blur-xl p-6 md:p-10 mb-6 rounded-lg shadow-2xl">
              <div className="mb-2 text-xs text-emerald-600 font-bold uppercase tracking-widest">Niveau de sécurité {QUESTIONS[currentIndex].niveau}</div>
              <h2 className="text-xl md:text-2xl text-emerald-50 mb-8 leading-relaxed font-semibold">
                <span className="text-emerald-500 mr-3 text-2xl">?</span>
                {QUESTIONS[currentIndex].question}
              </h2>

              <div className="space-y-4">
                {shuffledOptions.map((opt, index) => {
                  let btnClass = "w-full text-left p-4 rounded border transition-all duration-200 flex items-start group ";
                  
                  if (!showExplanation) {
                    btnClass += "border-emerald-900/50 bg-black/50 hover:border-emerald-400 hover:bg-emerald-950/50 cursor-pointer shadow-lg";
                  } else {
                    if (opt.isCorrect) {
                      btnClass += "border-emerald-500 bg-emerald-500/20 text-emerald-100 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                    } else if (index === selectedAnswer) {
                      btnClass += "border-red-600/50 bg-red-950/30 text-red-200";
                    } else {
                      btnClass += "border-transparent bg-black/20 text-emerald-900 opacity-40 cursor-not-allowed";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index, opt.isCorrect)}
                      disabled={showExplanation}
                      className={btnClass}
                    >
                      <span className={`mr-4 ${showExplanation && opt.isCorrect ? 'text-emerald-400' : 'text-emerald-700 group-hover:text-emerald-400 transition-colors'}`}>[{index + 1}]</span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="mt-8 border-l-4 border-emerald-500 pl-6 py-4 bg-emerald-950/20 rounded-r animate-fade-in">
                  <p className="text-emerald-100 mb-6 leading-relaxed">
                    <strong className="text-emerald-400 block mb-2 tracking-wider text-sm">Rapport d'analyse :</strong> {QUESTIONS[currentIndex].explication}
                  </p>
                  <button 
                    onClick={nextQuestion}
                    className="w-full border border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-bold py-4 rounded transition-all uppercase tracking-widest cursor-pointer shadow-lg"
                  >
                    {currentIndex === QUESTIONS.length - 1 ? "Décrypter le score final" : "Question Suivante ➔"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="w-full max-w-xl mt-10 text-center neon-border bg-black/60 backdrop-blur-xl p-10 rounded-lg shadow-2xl">
            <h2 className="text-3xl font-bold mb-2 text-white uppercase tracking-widest">Simulation Terminée</h2>
            <p className={isProf ? "text-blue-500 font-bold mb-8" : "text-emerald-600 mb-8"}>
              {isProf ? "Administrateur" : "Opérateur"} : {playerName}
            </p>
            
            <div className="text-7xl font-black neon-text mb-8 py-4">
              {score}<span className="text-4xl text-emerald-700/50">/20</span>
            </div>
            
            <div className="mb-10 p-6 border border-emerald-800/50 bg-black/40 rounded text-left">
              <p className="text-emerald-500 mb-3 font-bold uppercase text-sm tracking-wider">&gt; Diagnostic du système :</p>
              <p className="text-emerald-100 leading-relaxed">
                {score < 10 && "Accès vulnérable ! Tes défenses numériques ont besoin d'être renforcées. Garde les bons réflexes en tête et n'hésite pas à retenter ta chance pour t'améliorer !"}
                {score >= 10 && score < 16 && "Bons réflexes ! Ton pare-feu est actif, mais il reste encore quelques petites mises à jour à faire pour éviter tous les pièges du quotidien."}
                {score >= 16 && "Profil Expert validé ! Ton système est ultra-sécurisé. Tu es un véritable bouclier numérique pour ton iPad et pour l'école. Félicitations !"}
              </p>
            </div>
            
            <button 
              onClick={() => window.location.reload()} 
              className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold py-4 px-8 rounded transition-all uppercase tracking-widest cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              [ Reconnecter un nouvel utilisateur ]
            </button>
          </div>
        )}

      </div>
      
      <footer className="relative z-10 w-full p-3 border-t border-emerald-900/30 flex justify-between text-[10px] md:text-xs text-emerald-700 font-mono bg-black/80 backdrop-blur">
        <div>SYS_LOAD: [||||||||||  ] 82%</div>
        <div className="hidden md:block">ENC_KEY: RSA-4096 VALID</div>
        <div>NET_UPLINK: ACTIF_</div>
      </footer>
    </div>
  );
}