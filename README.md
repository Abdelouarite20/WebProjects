# WebProjects

## Lien pour voir la video démo:

https://drive.google.com/file/d/15GfDCMyaIiTZY0b6DX5M6VrS9LQUjt3Z/view?usp=drive_link

## Auteurs

Ce projet a ete realise par deux etudiants :

- Abdelouarite GHILANE EL HASSANI
- Elhadj Oumar DIALLO

## Presentation du projet

`WebProjects` est notre projet de plateforme de jeux web. L'idee principale etait de ne pas faire un seul jeu isole, mais une vraie mini plateforme avec :

- une page d'accueil / lobby
- un systeme d'inscription et de connexion
- une gestion des scores
- un classement general
- plusieurs jeux construits avec des approches techniques differentes

Le projet est centre autour du dossier `miagePlatform`, qui contient a la fois :

- le backend Node.js / Express
- la base de la logique metier
- le frontend principal
- les trois jeux

Notre objectif etait autant pedagogique que technique :

- travailler l'architecture d'une application web complete
- pratiquer le JavaScript dans plusieurs contextes
- manipuler le DOM, le Canvas 2D et la 3D avec Babylon.js
- mettre en place une API backend simple mais propre
- connecter le frontend a une base MongoDB pour sauvegarder les comptes et les scores


## Fonctionnalites principales

La plateforme propose actuellement :

- creation de compte utilisateur
- connexion / deconnexion
- stockage securise du token dans un cookie HttpOnly
- lobby principal avec navigation entre les jeux
- leaderboard global et filtrable par jeu
- sauvegarde des scores pour les jeux relies au backend
- interface front unifiee pour presenter les jeux

## Les jeux du projet

### 1. 2048 - DOM Project

Ce jeu est une reimplementation du 2048 en JavaScript avec manipulation du DOM.

Fonctionnalites principales :

- deplacement avec les fleches du clavier
- fusion des tuiles
- gestion du score
- detection de victoire et de defaite
- adaptation de la taille de la grille selon le niveau choisi
- sauvegarde du score sur le backend quand la partie se termine

Ce jeu nous a permis de travailler :

- les classes JavaScript
- la logique de grille
- la mise a jour de l'interface en temps reel
- la gestion d'evenements clavier

### 2. Crazy Fish - Canvas Project

`Crazy Fish` est un jeu de survie 2D base sur l'API Canvas.

Principe :

- le joueur controle un poisson
- il doit manger les poissons plus petits
- il doit eviter les poissons plus gros
- le score augmente au fil des captures
- la difficulte augmente pendant la partie

Fonctionnalites principales :

- menu de selection de difficulte
- HUD de partie
- systeme de vies
- bulles et particules
- bonus de vitesse et de bouclier
- sauvegarde locale et backend du score
- classement integre a la plateforme

Ce jeu nous a surtout fait travailler :

- la boucle de rendu
- le dessin en Canvas
- la gestion du temps reel
- les collisions
- l'optimisation de performances
- la robustesse d'un rendu 2D qui tourne en continu

### 3. Air Combat 3D - Babylon Project

Ce jeu est la partie 3D du projet, realisee avec Babylon.js.

L'idee est de proposer un jeu de combat aerien arcade avec :

- deplacement d'un avion
- tirs
- apparition d'ennemis
- progression de la difficulte
- score, argent et pouvoirs

Le projet Babylon est plus ambitieux graphiquement et plus riche techniquement. Il montre notre volonte de couvrir plusieurs approches du developpement de jeux web.

Remarque :

- ce jeu est jouable mais il n'est pas encore finalisé

## Choix techniques

Nous avons volontairement choisi une stack simple, moderne et adaptee a un projet etudiant full-stack JavaScript.

### Frontend

- HTML5
- CSS3
- JavaScript natif
- Canvas API
- Babylon.js pour la partie 3D

### Backend

- Node.js
- Express
- MongoDB
- Mongoose

### Securite / middleware

- `helmet`
- `cors`
- `cookie-parser`
- `express-rate-limit`
- `express-mongo-sanitize`
- `jsonwebtoken`
- `bcryptjs`

## Architecture generale

Le coeur du projet se trouve ici (arborescence principale) :

```text
WebProjects/
|-- README.md
|-- RAPPORT_CONCEPTION.md
`-- miagePlatform/
    |-- .env
    |-- .gitignore
    |-- index.js
    |-- package-lock.json
    |-- package.json
    |-- connectDb/
    |   `-- connectDb.js
    |-- controllers/
    |   |-- authController.js
    |   `-- scoreController.js
    |-- middleware/
    |   `-- authMiddleware.js
    |-- models/
    |   |-- Score.js
    |   `-- User.js
    |-- routes/
    |   |-- authRoutes.js
    |   `-- scoreRoutes.js
    `-- frontend/
        |-- index.html
        |-- assets/
        |   |-- css/
        |   |   `-- style.css
        |   `-- images/
        |       |-- 2048.png
        |       |-- background.png
        |       |-- bg1.png
        |       |-- bg2.png
        |       |-- fish-bg.png
        |       `-- planeAttack.png
        |-- js/
        |   `-- main.js
        `-- games/
            |-- BabylonProject/
            |   |-- index.html
            |   |-- style.css
            |   |-- docs/
            |   |   `-- conception.md
            |   `-- js/
            |       |-- allies.js
            |       |-- app.js
            |       |-- battlefield.js
            |       |-- effects.js
            |       |-- enemies.js
            |       |-- input.js
            |       |-- main.js
            |       |-- planes.js
            |       |-- player.js
            |       |-- progression.js
            |       |-- projectiles.js
            |       |-- scene.js
            |       |-- sky.js
            |       `-- ui.js
            |-- CanvasProject/
            |   |-- index.html
            |   |-- assets/
            |   |   `-- images/
            |   |       `-- background_menu fish.png
            |   |-- css/
            |   |   `-- style.css
            |   `-- js/
            |       |-- bubble.js
            |       |-- entity.js
            |       |-- fish.js
            |       |-- game.js
            |       |-- moving_entity.js
            |       |-- particle.js
            |       `-- powerup.js
            `-- DOMProject/
                |-- index.html
                |-- assets/
                |   `-- images/
                |       `-- bg2048.png
                |-- css/
                |   `-- styles.css
                `-- js/
                    |-- Board.js
                    |-- Game.js
                    |-- LevelManager.js
                    |-- NumberTile.js
                    |-- Tile.js
                    `-- script.js
```

Note :

- le dossier `node_modules/` existe bien apres installation, mais il n'est pas detaille ici car il est genere automatiquement
- certains fichiers techniques ou de placeholder, comme `.gitkeep`, ne sont pas listes pour garder l'arborescence lisible

## Organisation backend

### Serveur principal

Le point d'entree du backend est :

- `miagePlatform/index.js`

Ce fichier :

- charge les variables d'environnement avec `dotenv`
- connecte MongoDB
- configure les middlewares de securite
- expose les fichiers statiques du frontend
- monte les routes d'authentification et de scores

### Base de donnees

La connexion MongoDB est geree dans :

- `miagePlatform/connectDb/connectDb.js`

Le projet attend une variable :

- `MONGODB_URI`

### Modeles

Deux modeles Mongoose sont utilises :

#### `User`

Fichier :

- `miagePlatform/models/User.js`

Il contient :

- `username`
- `email`
- `password`

Le mot de passe est :

- valide
- hache avec `bcryptjs`
- non retourne par defaut dans les requetes

#### `Score`

Fichier :

- `miagePlatform/models/Score.js`

Chaque score contient :

- l'utilisateur
- le nom du jeu
- le nombre de points
- les dates de creation / mise a jour

Les jeux autorises actuellement sont :

- `2048`
- `Crazy Fish`
- `babylon`

### Authentification

Les routes d'authentification sont :

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/logout`

Le login cree un token JWT puis le stocke dans un cookie `HttpOnly`.

Cela nous a permis :

- d'eviter de stocker le token directement dans le JavaScript du client
- de proteger un peu mieux les requetes authentifiees

### Scores et leaderboard

Les routes de score sont :

- `POST /api/scores/add`
- `GET /api/scores/leaderboard/:game`

Le `POST /api/scores/add` est protege par le middleware :

- `miagePlatform/middleware/authMiddleware.js`

Le leaderboard retourne le top 25 pour un jeu donne.

## Securite mise en place

Nous avons ajoute plusieurs elements de securite simples mais utiles :

- `helmet` pour renforcer les en-tetes HTTP
- `cors` pour controler les origines autorisees
- `express-rate-limit` pour limiter le spam sur l'API
- `express-mongo-sanitize` pour eviter certaines injections MongoDB
- `cookie-parser` pour lire les cookies d'authentification
- `bcryptjs` pour hasher les mots de passe
- `jsonwebtoken` pour l'authentification

Nous savons qu'il ne s'agit pas d'une securite "production enterprise", mais pour un projet etudiant, cela nous a permis de mettre en pratique de bonnes bases.

## Variables d'environnement

Le projet utilise un fichier `.env` dans `miagePlatform/`.

Variables attendues :

```env
PORT=5000
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=une_cle_secrete
```

Important :

- le frontend appelle actuellement l'API sur `http://localhost:5000`
- il est donc recommande d'utiliser `PORT=5000` pour eviter les incoherences

## Installation du projet

### 1. Cloner ou recuperer le projet

Placez le projet dans votre espace de travail.

### 2. Se placer dans le dossier backend

```bash
cd miagePlatform
```

### 3. Installer les dependances

```bash
npm install
```

### 4. Configurer le fichier `.env`

Ajouter au minimum :

```env
PORT=5000
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
```

### 5. Lancer le serveur

En mode normal :

```bash
npm start
```

En mode developpement :

```bash
npm run dev
```

### 6. Ouvrir l'application

Ensuite ouvrir :

```text
http://localhost:5000
```

## Utilisation de la plateforme

Une fois le projet lance :

1. creer un compte
2. se connecter
3. acceder au lobby
4. choisir un jeu
5. jouer
6. consulter le classement general ou par jeu

## Ce que nous avons voulu montrer dans ce projet

Avec cette plateforme, nous avons voulu montrer que nous etions capables de :

- concevoir un projet web complet
- relier frontend, backend et base de donnees
- gerer plusieurs mini-projets dans une meme application
- utiliser differentes technologies selon le besoin
- travailler en equipe sur un projet structure

## Difficultes rencontrees

Comme dans beaucoup de projets etudiants, nous avons rencontre plusieurs difficultes :

- synchroniser plusieurs jeux dans une meme plateforme
- rendre cohérente l'interface globale
- connecter proprement les scores au backend
- gerer les collisions et la stabilite du rendu dans le jeu Canvas
- organiser les fichiers pour que le projet reste lisible
- faire cohabiter une logique 2D DOM, une logique Canvas temps reel et une logique 3D Babylon

Ces difficultes nous ont obliges a corriger, tester, refactoriser et mieux comprendre le comportement du navigateur et du moteur JavaScript.

## Limites actuelles

Le projet fonctionne, mais il reste quelques limites :

- Le jeu Air Combat n' est pas encore finalisé
- le deqigne peut encore s'améliorer pour tous les jeux
- l'ensemble pourrait beneficier de tests automatises
- l'ergonomie mobile pourrait etre encore amelioree

## Pistes d'amelioration

Si nous poursuivions ce projet, nous aimerions ajouter :

- un profil utilisateur plus complet
- une meilleure gestion des avatars / statistiques par joueur
- un leaderboard global en temps reel
- une architecture frontend plus modulaire
- une couche de services API commune a tous les jeux
- des tests unitaires et tests d'integration
- une vraie phase de deploiement en ligne
- plus de contenu et de progression dans le jeu 3D

## Ce que nous retenons du projet

Ce projet nous a beaucoup appris, notamment sur :

- la structuration d'une application full-stack
- la communication entre frontend et backend
- la persistance des donnees
- la securisation minimale d'une API
- la gestion de projet en binome
- les specificites du rendu dans le navigateur

Au-dela du resultat final, ce projet a surtout ete une vraie experience de developpement complete, avec des choix, des erreurs, des corrections et une progression concrete.

## Repartition du travail, difficultes et justification des choix

### 1. Qui a fait quoi dans le groupe

- Abdelouarite GHILANE EL HASSANI a principalement realise le jeu `CanvasProject` (`Crazy Fish`) ainsi que le jeu `BabylonProject`(`Air Combat 3D`).
- Elhadj Oumar DIALLO a principalement realise le `DOMProject` (`2048`) et gere le backend de la plateforme (API, authentification, scores et liaison avec la base de donnees).
- Nous n'avons cependant pas travaille en silos. A chaque fois que l'un de nous avancait sur une partie, il la montrait a l'autre pour relecture, avis technique et suivi global. De cette maniere, chacun restait au courant de l'evolution complete du projet.

### 2. Pourcentage de travail fourni par chacun

- Abdelouarite GHILANE EL HASSANI : 50%
- Elhadj Oumar DIALLO : 50%

Cette estimation nous parait coherente, car le projet reposait sur quatre blocs essentiels : le jeu DOM, le jeu Canvas, le jeu Babylon et le backend de la plateforme. Chacun a pris en charge environ deux blocs, avec en plus une logique de revue croisee.

### 3. Parties les plus difficiles, problemes rencontres et resolutions

Certaines difficultes ont ete generales a la plateforme :

- la securisation des sessions et des scores sans passer par un systeme de sessions serveur lourd
- les blocages CORS entre les jeux et l'API
- l'evolution du schema de base de donnees quand de nouveaux jeux etaient ajoutes
- l'affichage asynchrone du leaderboard

Pour y repondre, nous avons mis en place :

- des tokens JWT stockes dans des cookies `HttpOnly` pour fiabiliser l'identite du joueur
- une configuration CORS adaptee avec gestion des `credentials`
- un modele Mongoose plus souple pour accepter plusieurs jeux
- l'usage de `async/await` pour attendre correctement les reponses avant d'afficher les classements

Nous avons aussi rencontre des difficultes tres concretes selon les jeux :

- pour la partie Babylon, la difficulte principale etait le design du `battlefield`. Pour avancer, nous nous sommes inspires de la documentation Babylon.js ainsi que de l'IA afin de trouver une mise en scene plus credible et plus lisible
- toujours dans Babylon, le capteur de vitesse posait probleme : l'aiguille ne tournait pas dans le bon sens et la valeur affichee ne correspondait pas bien a la vitesse de l'avion. Une premiere tentative avec l'IA n'a pas abouti correctement, donc la correction a finalement ete faite a la main en appliquant les relations mathematiques du sinus et du cosinus
- pour le jeu Canvas, le jeu finissait par crasher apres un certain temps. Une tentative de correction seule n'a pas suffi. En cherchant ensuite des explications dans des videos YouTube, il a ete possible de mieux comprendre l'origine du probleme et de le corriger

Ces difficultes ont ete importantes, mais elles ont aussi ete formatrices, car elles nous ont obliges a alterner recherche, experimentation, tests, revue mutuelle et correction progressive.

### 4. Justification des choix : pourquoi ces jeux et pas d'autres

Le choix des jeux n'a pas ete fait au hasard. Nous voulions un ensemble coherent qui montre plusieurs facettes du developpement web, tout en restant realisable dans un cadre etudiant.

Nous avons choisi `2048` car :

- c'est un jeu basique, mais en meme temps cool et efficace
- il est simple a comprendre pour un utilisateur, tout en restant interessant a developper
- il nous permettait de travailler proprement la logique de grille, les evenements clavier et les mises a jour du DOM

Nous avons choisi `Crazy Fish` car :

- quand nous etions petits, nous etions fans du jeu Agar.io
- nous voulions reprendre un principe proche, avec une progression basee sur le fait de manger plus petit que soi et d'eviter plus grand que soi
- ce concept etait bien adapte a un jeu Canvas dynamique, avec collisions, bonus, difficulte progressive et gestion du temps reel

Nous avons choisi `Air Combat 3D` avec Babylon.js car :

- nous jouions tous les deux a `Air Conflicts`, et nous voulions creer un jeu qui allait dans le meme style
- le combat aerien etait un bon moyen de construire une vraie ambiance 3D avec deplacement, camera, ennemis et projectiles

Le choix global de ces trois jeux est donc justifie par un equilibre entre :

- faisabilite dans le temps du projet
- complementarite technique
- interet pedagogique
- diversite des experiences de jeu
- coherence avec une plateforme commune de compte, score et classement

Sur le plan technologique, nous avons aussi fait des choix logiques :

- `Node.js` / `Express` nous ont permis d'utiliser JavaScript du frontend au backend, ce qui simplifiait l'organisation du projet et accelerait le developpement
- `MongoDB` et `Mongoose` etaient adaptes a un projet de scores et de profils simples, avec une structure assez souple pour faire evoluer les donnees

Autrement dit, nous n'avons pas choisi "n'importe quels jeux" : nous avons choisi des jeux qui avaient du sens ensemble, qui couvraient plusieurs techniques web, et qui pouvaient etre defendus comme des choix humains, raisonnables et pedagogiques.


## Resume en une phrase

`WebProjects` est une plateforme de jeux web, developpee par Abdelouarite GHILANE EL HASSANI et Elhadj Oumar DIALLO, qui combine authentification, sauvegarde des scores, leaderboard et trois jeux realises avec des technologies web differentes.
