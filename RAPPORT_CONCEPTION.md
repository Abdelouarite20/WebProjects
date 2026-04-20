# Rapport De Conception

## Projet

**WebProjects / MIAGE Platform**

**Auteurs :**

- Abdelouarite GHILANE EL HASSANI
- Elhadj Oumar DIALLO

## 1. Objet du depot

Ce depot contient un projet academique de plateforme de jeux web. L'objectif n'etait pas seulement de produire un jeu unique, mais de construire une application complete regroupant :

- un backend Node.js / Express
- une authentification utilisateur
- une base de donnees MongoDB
- un lobby central
- un systeme de scores
- un classement global
- trois jeux developpes avec des approches techniques differentes

Le projet principal se trouve dans le dossier `miagePlatform/`. Le depot racine contient surtout la documentation generale et l'historique Git.

## 2. Descriptif du repo

### Racine du repo

- `README.md` : presentation generale du projet, de la stack, des jeux et du lancement.
- `RAPPORT_CONCEPTION.md` : document present, oriente "descriptif de depot + conception".
- `miagePlatform/` : coeur technique du projet.
- `.git/` : suivi de version Git.


### Dossier `miagePlatform/`

Ce dossier contient toute l'application executable.

- `index.js` : point d'entree du serveur Express.
- `.env` : variables d'environnement.
- `package.json` : scripts et dependances Node.js.
- `package-lock.json` : verrouillage des versions.


Sous-dossiers principaux :

- `connectDb/`
- `controllers/`
- `middleware/`
- `models/`
- `routes/`
- `frontend/`

## 3. Description des fichiers source

### 3.1 Backend

Le backend est structure de maniere classique, afin de separer les responsabilites.

#### `index.js`

Ce fichier :

- charge les variables d'environnement avec `dotenv`
- connecte MongoDB
- configure les middlewares de securite (`helmet`, `cors`, `cookie-parser`, `express-rate-limit`, `express-mongo-sanitize`)
- expose les fichiers statiques du frontend
- monte les routes API

Il s'agit du centre de l'application serveur.

#### `connectDb/connectDb.js`

Ce fichier gere la connexion a MongoDB avec Mongoose. Nous avons choisi de l'isoler pour garder `index.js` plus lisible.

#### `controllers/`

- `authController.js` : inscription, connexion, deconnexion
- `scoreController.js` : ajout de score et recuperation du leaderboard

La logique metier des routes est placee ici pour eviter d'alourdir directement les routes.

#### `middleware/`

- `authMiddleware.js` : verification du token JWT via cookie HttpOnly

Ce middleware protege les routes qui necessitent un utilisateur connecte, en particulier l'ajout de score.

#### `models/`

- `User.js` : schema utilisateur avec `username`, `email`, `password`
- `Score.js` : schema de score lie a un utilisateur et a un jeu

Le mot de passe est hache avec `bcryptjs` avant enregistrement.

#### `routes/`

- `authRoutes.js`
- `scoreRoutes.js`

Les routes sont volontairement simples et courtes. Elles appellent les controllers pour garder une architecture modulaire.

### 3.2 Frontend global

Le frontend principal se trouve dans `miagePlatform/frontend/`.

- `index.html` : page principale de la plateforme
- `js/main.js` : logique du lobby, authentification, navigation, leaderboard
- `assets/css/style.css` : style global du site
- `assets/images/` : illustrations du lobby et des cartes de jeux

Le frontend global a pour role de fournir une interface unique autour des jeux.

Fonctions principales :

- afficher la page d'authentification
- gerer le passage au lobby
- lancer les jeux
- afficher les classements

### 3.3 Jeux

#### DOMProject

Ce dossier correspond au jeu 2048.

Fichiers principaux :

- `index.html`
- `css/styles.css`
- `js/script.js`
- `js/Game.js`
- `js/Board.js`
- `js/Tile.js`
- `js/NumberTile.js`
- `js/LevelManager.js`

Role des fichiers :

- `Game.js` coordonne la partie
- `Board.js` gere la logique de grille
- `Tile.js` et `NumberTile.js` representent les tuiles
- `LevelManager.js` gere la taille de la grille

#### CanvasProject

Ce dossier contient `Crazy Fish`, le jeu Canvas 2D.

Fichiers principaux :

- `index.html`
- `css/style.css`
- `js/game.js`
- `js/entity.js`
- `js/moving_entity.js`
- `js/fish.js`
- `js/bubble.js`
- `js/particle.js`
- `js/powerup.js`

Role des fichiers :

- `game.js` contient la boucle principale, les etats de jeu, les collisions, le HUD et les overlays
- `entity.js` et `moving_entity.js` definissent la base des objets du jeu
- `fish.js` definit le comportement et le rendu des poissons
- `bubble.js`, `particle.js`, `powerup.js` gerent les effets secondaires

#### BabylonProject

Ce dossier contient le jeu 3D base sur Babylon.js.

Fichiers principaux :

- `index.html`
- `style.css`
- `js/app.js`
- `js/main.js`
- `js/scene.js`
- `js/player.js`
- `js/enemies.js`
- `js/projectiles.js`
- `js/allies.js`
- `js/progression.js`
- `js/input.js`
- `js/ui.js`
- `js/effects.js`
- `js/battlefield.js`
- `js/sky.js`
- `js/planes.js`
- `docs/conception.md`



## 4. Description des assets

Les assets du projet sont principalement des images de fond et des visuels d'interface.

### Assets globaux

Dans `miagePlatform/frontend/assets/images/` :

- `2048.png` : image de presentation du jeu 2048
- `fish-bg.png` : image de presentation de Crazy Fish
- `planeAttack.png` : image de presentation du jeu 3D
- `background.png`, `bg1.png`, `bg2.png` : fonds visuels du site

Dans `miagePlatform/frontend/assets/css/` :

- `style.css` : feuille de style globale du lobby et des pages principales

### Assets des jeux

- `DOMProject/assets/images/bg2048.png` : fond du jeu 2048
- `CanvasProject/assets/images/background_menu fish.png` : image de fond du menu de Crazy Fish

Les assets ont surtout un role de :

- rendre la plateforme plus lisible visuellement
- differencier les jeux
- donner une identite graphique minimale mais coherente

## 5. Court rapport de conception

### 5.1 Besoin initial

Nous voulions concevoir une plateforme simple, jouable et credible dans un cadre etudiant. Le besoin de depart etait le suivant :

- proposer plusieurs jeux sur une meme application
- partager un systeme commun de comptes et de scores
- montrer plusieurs competences techniques dans un seul projet

Au lieu d'avoir un seul mini-jeu, nous avons prefere construire une petite architecture de plateforme. Ce choix est important, car il transforme le projet en application web complete et non en simple prototype graphique.

### 5.2 Principes de conception retenus

Nous avons retenu quatre principes de conception :

1. **Separation claire frontend / backend**

Le backend gere les utilisateurs, l'authentification et les scores. Le frontend gere l'interface, la navigation et l'experience de jeu.

2. **Un dossier par responsabilite**

Controllers, routes, models, middleware et connexion a la base sont separes. Cette organisation rend le code plus lisible et plus maintenable.

3. **Un dossier par jeu**

Chaque jeu dispose de son propre `index.html`, de son CSS et de ses fichiers JavaScript. Cela nous permet de faire evoluer un jeu sans casser les autres.

4. **Choix technologiques varies mais coherents**

Nous avons utilise :

- le DOM pour 2048
- Canvas 2D pour Crazy Fish
- Babylon.js pour la partie 3D

Ce choix n'est pas un hasard. Il nous permettait de montrer que le web peut supporter plusieurs styles de jeux avec des logiques techniques differentes.

### 5.3 Justification de l'architecture

L'architecture choisie est volontairement simple. Il est plus important d'avoir une structure claire et defendable qu'une architecture trop complexe.

Nous avons donc evite :

- les frameworks frontend lourds
- les couches d'abstraction inutiles
- une sur-complexite qui aurait rendu le projet difficile a maintenir

Nous avons privilegie :

- du JavaScript lisible
- des fichiers specialises
- des API courtes et comprenables

### 5.4 Conception de l'experience utilisateur

Le projet est pense comme une progression logique :

1. l'utilisateur arrive sur la page principale
2. il cree un compte ou se connecte
3. il accede au lobby
4. il choisit un jeu
5. il joue
6. son score est conserve et remonte dans le classement

Cette logique de parcours etait importante pour donner une coherence au projet. Les jeux ne sont pas simplement poses cote a cote : ils sont relies par un systeme commun.

### 5.5 Place de l'IA dans la conception

La conception n'a pas ete entierement deleguee a une IA. Dans notre demarche, l'IA a ete utilisee comme **assistant technique et redactionnel**, mais les choix de fond sont restes humains.

Concretement, nous avons fourni a l'assistant IA des specifications du type :

- conserver une architecture simple de projet etudiant
- separer backend, frontend et jeux
- rester en JavaScript natif quand c'etait pertinent
- garder une logique de plateforme commune avec score et authentification
- produire des propositions realistes, comprenables et justifiables

L'IA a ensuite servi a :

- proposer des formulations ou une structure de documentation
- suggerer des decoupages de fichiers
- aider a corriger certains bugs
- accelerer certaines phases de redaction ou de debogage

Elle nous a aussi aide quand nous rencontrions un probleme que nous ne savions pas resoudre immediatement. Dans ces cas-la, nous l'utilisions pour obtenir des pistes, comprendre l'origine possible du blocage et tester une direction de correction, tout en gardant la validation finale de notre cote.

En revanche, nous avons garde la main sur :

- les objectifs du projet
- les choix de technologies
- les tests
- les validations fonctionnelles
- l'integration finale dans le depot

Autrement dit, l'IA a ete employee comme **outil d'assistance**, pas comme substitut complet a la conception.

### 5.6 Ce que cette conception apporte

Cette conception nous a permis d'obtenir :

- un projet plus propre qu'un ensemble de fichiers disperses
- une meilleure lisibilite du code
- une plateforme evolutive
- une demonstration concrete de plusieurs technologies web

Elle reste perfectible, mais elle est adaptee au cadre du projet : suffisamment serieuse pour etre defendue, sans tomber dans une architecture disproportionnee.

## 6. Conclusion

Ce depot montre un projet de plateforme de jeux web realise dans une logique simple mais qualitative. Le code source est organise par couches et par jeux, les assets sont ranges par usage, et la conception privilegie la clarte, la modularite et la coherence globale.

Le point le plus important a retenir est que la plateforme ne repose pas sur un simple assemblage de mini-jeux : elle repose sur une conception unifiee avec authentification, backend, base de donnees et classement. C'est cet aspect qui donne son interet principal au projet.
