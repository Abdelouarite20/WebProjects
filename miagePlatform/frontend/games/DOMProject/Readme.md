# JEU 2048 - Projet Intégré

## 📝 Présentation
Ce projet est une version web complète et dynamique du célèbre jeu **2048**. Il a été développé et intégré en tant que module au sein de notre plateforme d'Arcade (Miage Platform). Le but est de fusionner des tuiles de même valeur pour atteindre (ou dépasser !) la tuile 2048.

---

## 🛠️ Détails d'implémentation

L'architecture repose sur des standards modernes utilisant du **Vanilla JavaScript (ES6)** orienté objet. Le projet est découpé de manière modulaire (MVC-like) pour conserver un code propre :

- **`Game.js` :** Le contrôleur principal. Il gère la boucle de jeu, écoute les frappes clavier (flèches directionnelles), gère les conditions de victoire/défaite et s'occupe de communiquer avec l'API Backend pour sauvegarder les scores de façon sécurisée (avec envoi de cookies HttpOnly).
- **`Board.js` :** Le cœur logique (Modèle). Il représente la grille de jeu sous forme de matrice (tableau 2D). Il calcule les fusions de tuiles, le déplacement mathématique, et la mise à jour des points.
- **`LevelManager.js` :** Un gestionnaire de difficulté qui permet de modifier dynamiquement la taille de la grille (allant de 3x3 pour le mode extrême à 6x6 pour le mode chill).
- **CSS Grid Dynamique :** La grille HTML n'est pas fixe. Le JavaScript injecte des variables CSS natives pour redessiner la grille instantanément lorsqu'on change de niveau de difficulté.

---

## 🧗 Les principales difficultés rencontrées & Solutions

Au cours du développement, plusieurs défis techniques majeurs se sont présentés :

### 1. L'Algorithme de fusion (Glissement des tuiles)
**Le problème :** Gérer le comportement exact du 2048 n'est pas si simple. Si nous avons une ligne contenant `[2, 2, 2, 2]` et que nous glissons vers la droite, cela doit donner `[_, _, 4, 4]` et non pas `[_, _, _, 8]` (une tuile ne peut fusionner qu'une seule fois par coup). 
**La solution :** Nous avons développé une logique de filtrage (suppression des zéros) suivie d'une itération qui ne fusionne que les paires adjacentes strictement identiques. Une fois la fusion faite, l'algorithme "pousse" les éléments et comble le vide avec de nouveaux zéros.

### 2. Le redimensionnement dynamique du plateau
**Le problème :** Passer d'une grille 4x4 à une grille 6x6 cassait totalement l'aspect visuel du plateau, car les CSS originels étaient codés en "dur" pour 16 cases.
**La solution :** Nous avons refactorisé le CSS en abandonnant la taille fixe et en utilisant `display: grid`. Dans le système central, la taille de la matrice est envoyée au DOM via la modification d'une variable globale : `document.documentElement.style.setProperty('--grid-row-cells', size)`. Ainsi, tout le plateau HTML/CSS se recalcule mathématiquement tout seul.

### 3. La communication entre le Jeu (Frontend) et le Backend (Cookies)
**Le problème :** Lors de l'envoi du score final au serveur pour l'insérer dans le Leaderboard, Firefox bloquait systématiquement l'envoi des Cookies de sécurité liés au "Jeton d'authentification" à cause des redoutables politiques de sécurité `SameSite` du navigateur sur `fetch`.
**La solution :** Nous avons dû configurer conjointement le paramètre `credentials: 'include'` sur le Fetch API du jeu 2048, et relâcher la politique `sameSite` du serveur (passage de *Strict* à *Lax*) pour permettre aux connexions locales de fonctionner de manière fluide.

---

## 🧠 Justification des choix : Pourquoi 2048 ?

La consigne initiale permettait de réaliser le jeu de notre choix. Si nous avons opté pour recréer 2048 plutôt qu'un jeu d'action ou un RPG textuel, c'est pour trois raisons fondamentales liées au cadre de l'apprentissage :

1. **La pertinence avec DOM & CSS :** 2048 est fondamentalement un jeu d'interface. Déplacer dynamiquement ces tuiles, modifier leurs apparences selon leur nombre (couleur de fond, typographie) est un excellent exercice pour nous améliorer en **Manipulation du DOM**, ce qui est le cœur de cet apprentissage (au lieu de s'enfermer dans un élément `<canvas>`).
2. **L'Algorithmique matricielle :** C'est un défi algorithmique très stimulant. Gérer un tableau multidimensionnel, inverser ou transposer la matrice selon la touche pressée force à coder proprement.
3. **Adapté au côté "Plateforme Compétitive" :** Vu que ce projet s'intégrait dans la "Miage Platform" qui possède un Leaderboard global, développer 2048 faisait infiniment plus de sens. C'est un jeu purement orienté "**Score**". Un nombre final est directement obtenu en fin de partie, ce qui le rendait parfait pour communiquer avec notre API de statistiques MongoDB développée en parallèle.