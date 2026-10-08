# 🛡️ Défi Cyber - Ensemble Scolaire Jean XXIII

Application web interactive développée dans le cadre du **Mois de la Cybersécurité (12-16 octobre)**.

Elle est destinée aux **élèves utilisant les iPads**, ainsi qu'aux **lycéens, étudiants et professeurs** de l'établissement.

---

## 🚀 Fonctionnalités

- **Quiz de 20 questions progressives**  
  Du niveau Collège (sécurité physique, phishing, ÉcoleDirecte) au niveau Expert (ransomwares, Zero-Day, Zero Trust).

- **Mélange aléatoire des réponses**  
  Les options de réponses sont brassées à chaque partie afin de limiter la triche.

- **Classement en temps réel**  
  Système synchronisé via **Firebase Firestore**, avec séparation entre :
  - 🧑‍🎓 Top Élèves
  - 👨‍🏫 Top Administrateurs / Professeurs

- **Mode Admin**  
  Suppression des scores en direct via un code d'accréditation secret.

- **Immersion Cyber**  
  Interface inspirée des terminaux informatiques avec :
  - Grille animée
  - Scanlines
  - Lueur radiale
  - Ambiance sonore intégrée

---

## 🛠️ Stack Technique

| Technologie | Utilisation |
|---|---|
| React | Front-end |
| Vite | Build et serveur de développement |
| Tailwind CSS | Interface et styles |
| Firebase Firestore | Base de données temps réel |
| Netlify / Vercel | Hébergement |

---

## ⚙️ Installation locale

### 1. Cloner le projet

```bash
git clone https://github.com/Akune122/jean-xxiii-cyber.git
cd jean-xxiii-cyber
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet en s'inspirant du fichier `.env.example`.

Exemple :

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **Ne jamais publier de secrets ou de credentials privés dans le dépôt GitHub.**
>
> Vérifie que `.env` est bien présent dans `.gitignore`.

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera ensuite accessible à l'adresse indiquée par Vite, généralement :

```text
http://localhost:5173
```

---

# 📦 Déploiement sur GitHub

Ouvre ton terminal dans **VS Code**, à la racine du projet, puis exécute les commandes suivantes.

## 1. Initialiser Git

Si Git n'est pas encore initialisé :

```bash
git init
```

---

## 2. Vérifier le `.gitignore`

Avant de faire `git add .`, vérifie que ton `.gitignore` contient au minimum :

```gitignore
node_modules/
dist/
.env
.env.local
.env.*.local
```

Cela permet notamment d'éviter d'envoyer ton fichier `.env` sur GitHub.

---

## 3. Ajouter les fichiers

```bash
git add .
```

Tu peux vérifier ce qui sera envoyé avec :

```bash
git status
```

> Vérifie notamment que `.env` **n'apparaît pas** dans la liste des fichiers à envoyer.

---

## 4. Créer le premier commit

```bash
git commit -m "feat: initial commit - cyber quiz jean xxiii"
```

---

## 5. Créer le dépôt GitHub

Sur GitHub :

1. Crée un nouveau repository.
2. Donne-lui par exemple le nom :
   `jean-xxiii-cyber`
3. Évite d'ajouter automatiquement un README si tu en as déjà créé un localement.
4. Copie l'URL HTTPS du repository.

Elle ressemblera à :

```text
https://github.com/Akune122/jean-xxiii-cyber.git
```

---

## 6. Lier le projet local à GitHub

Remplace l'URL ci-dessous par celle de ton dépôt :

```bash
git remote add origin https://github.com/Akune122/jean-xxiii-cyber.git
```

Tu peux vérifier que le remote est correctement configuré :

```bash
git remote -v
```

---

## 7. Envoyer le projet sur GitHub

```bash
git branch -M main
git push -u origin main
```

Ton projet devrait maintenant être disponible sur ton repository GitHub.

---

# 🔐 Sécurité

Ce projet utilise Firebase et peut contenir des informations de configuration dans les variables d'environnement.

**Ne commit jamais :**

- `.env`
- `.env.local`
- Clés privées
- Tokens d'administration
- Codes d'accréditation secrets
- Credentials Firebase privés
- Webhooks Discord privés

Le fichier `.env.example` peut en revanche être inclus dans le repository avec des valeurs fictives.

Exemple :

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
```

---

# 📁 Structure du projet

Une structure typique peut ressembler à :

```text
jean-xxiii-cyber/
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── firebase/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tailwind.config.js
└── vite.config.js
```

---

# 🎯 Objectif pédagogique

Le **Défi Cyber** a pour objectif de sensibiliser les utilisateurs aux principaux risques liés à la cybersécurité de manière interactive et ludique.

Les questions abordent notamment :

- 🛡️ Sécurité informatique
- 🎣 Phishing
- 🔑 Mots de passe
- 📱 Sécurité des appareils mobiles
- 🌐 Navigation Internet
- 📧 Ingénierie sociale
- 🦠 Ransomwares
- 💥 Zero-Day
- 🔐 Zero Trust
- 🚨 Réponse aux incidents

La difficulté augmente progressivement afin de permettre aux participants de tester leurs connaissances quel que soit leur niveau.

---

# 📝 License

Ce projet est développé dans un cadre pédagogique pour l'**Ensemble Scolaire Jean XXIII**.

---

# 👤 Auteur

Développé par **Akune122**.

**GitHub :**  
https://github.com/Akune122
