---
title: CasiDio 
author:  
- JOSSERAND Jordan
- LOIOIDICE Lukas
- NOGUEIRA Clement
--- 

**Lien du site :** [CasiDio](https://casidio.osc-fr1.scalingo.io/frontend/)

**Lien de la doc technique :** [Swagger CasiDio](https://casidio.osc-fr1.scalingo.io/doc/)

**Identifiants de connexion :**

* Utilisateur : 
  * Identifiant : jordan@josserand.com
  * Mot de passe : Ab*123-!
* Admin : 
  * Identifiant : a@a.com
  * Mot de passe : Ab*123-!

## Cahier des charges

Ici vous décrivez les fonctionnalités souhaitées et celles effectivement mises en oeuvre. Avec un diagramme UML des cas d'usage et des maquettes des vues souhaitées et des captures d'écran de ce qui a été réalisé.

### Cas d'usage

```plantuml
@startuml

:Utilisateurs connectés: as User
:Utilisateurs non connectées: as UserNotConnected
:Administarateurs: as Admin

package Application {
  
  "Connexion" as (Login)
  "Gestion compte" as (AccountManagement)
  "Gestion utilisateurs" as (AccountAdminManagement)
  "Gestion crédits" as (CreditManagement)
  "Création compte" as (CreateAccount)
  "Connexion" as (Login)
  "Modifier des comptes" as (UpdateAccountAdmin)
  "Jouer jeux" as (PlayGames)
  "Afficher tableau de bord" as (DashBoard)
  "Afficher tableau de bord admin" as (DashBoardAdmin)
  
  User <|-- Admin
  UserNotConnected --> (Login)
  UserNotConnected --> (CreateAccount)
  User -> (AccountManagement)
  User -> (CreditManagement)
  User --> (PlayGames)
  User --> (DashBoard)
  Admin --> (DashBoardAdmin)
  Admin --> (AccountAdminManagement)
  
  (CreateAccount) <-- (Login) #line.dashed : <<i>>
  
  (Login) <-- (DashBoard) #line.dashed : <<i>>
  (Login) <-- (PlayGames) #line.dashed : <<i>>
  (Login) <-- (DashBoardAdmin) #line.dashed : <<i>>
  
  (Login) <-- (AccountManagement) #line.dashed : <<i>>
  (AccountManagement) <-- (Modification compte) #line.dashed : <<e>>
  (AccountManagement) <-- (Supprimer compte) #line.dashed : <<e>>
  
  (Login) <-- (CreditManagement) #line.dashed : <<i>>
  (CreditManagement) <-- (Ajouter crédits) #line.dashed : <<e>>
  (CreditManagement) <-- (Retirer crédits) #line.dashed : <<e>>
  
  (Login) <--  (AccountAdminManagement) #line.dashed : <<i>>
  (AccountAdminManagement) <-- (Créer des comptes) #line.dashed : <<e>>
  (AccountAdminManagement) <-- (UpdateAccountAdmin) #line.dashed : <<e>>
  (AccountAdminManagement) <-- (Supprimer des comptes) #line.dashed : <<e>>

}

@enduml
```

### Maquettes

A modifier/compléter...

```plantuml
@startsalt
<style>
header {
  TextAlignement right
  BackGroundColor gray
  FontColor white
}
</style>
header {- Alice@aol.fr | [Se déconnecter] }
{
{^Mes groupes
**Ceux dont je suis membre**
* Ensimag
* Grenoble INP
* <b>Club gaming
----
**Ceux que j'administre**
* Club Gaming
* Running
"<i>nom du nouveau groupe" 
 [Créer]
}|
{^"Discussion sur le groupe <b>Club Gaming"
{SI
  [Salut , ca va? ] | Charlie
  [Super, et toi?] | Asimov
  [On se fait un truc] | Asimov
  [Une idée? ] | Charlie
  . | [Hello, oui]
  ----|----
}
{+ "Une partie de LOL après?" | [Envoyer ] }
}
}
@endsalt
```

### Captures d'écran

A compléter

### API mise en place

**User :**

|Endpoint | GET  | POST | PUT  | DELETE  |
|---|---|---|---|---|
| /login  | *  | Obtention du token utilisateur/**email**,**password**  | *  | * |
| /register  | *  | Crée un utilisateur/**email**,**password**,**firstName**,**lastName**,**address**,**birthDate**  | * | * |
| /api/users  | (**TOKEN**,**ADMIN**)Lister tous les utilisateurs  | *  |  * |  * |
| /api/user | (**TOKEN**)Récupération des informations de l'utilisateur | * | (**TOKEN**)Modification des informations de l'utilisateur/**password**,**firstName**,**lastName**,**address**,**birthDate** | (**TOKEN**)Suppression de l'utilisateur courant|
| /api/users/{id}| * | * | (**TOKEN**, **ADMIN**)Mettre à jour les informations de l'utilisateur/**email**,**password**,**firstName**,**lastName**,**address**,**birthDate**,**isAdmin** | (**TOKEN**, **ADMIN**) Suppression de l'utilisateur/

**Game :**
|Endpoint | GET  | POST | PUT  | DELETE  |
|---|---|---|---|---|
| /games  | Obtention de tout les jeux actuellement disponibles | * | *  | * |
| /api/game  | * | (**TOKEN**, **ADMIN**)Ajouter un nouveau jeu/**name, picturePath, description** | *  | * |
| /api/game/{id}  | * | * | (**TOKEN**, **ADMIN**)Modifier le jeu *id*/**name, picturePath, description** | (**TOKEN**, **ADMIN**)Supprimer le jeu *id* |

**History :**
|Endpoint | GET  | POST | PUT  | DELETE  |
|---|---|---|---|---|
| /api/globalHistory  | (**TOKEN**, **ADMIN**)Récupérer l'historique global | * | *  | * |
| /api/history  | (**TOKEN**)Récupérer l'historique de l'utilisateur connecté | * | *  | * |

**Game web socket :**
|Endpoint | parameters | description | return values |
|---|---|---|---|
|/gameSocket | game: *String*, Payload: *Object*, userToken: *String* | Lance une itération du jeu `game` pour l'utilisateur `userToken` avec les paramètres `Payload` propres au jeu | *Object* |

## Architecture du code

### FrontEnd

Indiquer ici l'organisation de votre code. Et les choix faits pour le frontend.

### Backend

#### Schéma de la base de donnée

```plantuml
class User{
  -id: Number
  -firstName: String
  -lastName: String
  -email: String
  -password: String
  -address: String
  -birthDate: Date
  -balance: Float
  -isAdmin: Boolean
}

class Games{
  -id: Number
  -name: String
  -page: String
  -description: String
}

class History{
 -id: Number;
 -profit: Float
 -gameDate: Date
}


History --> "1..1" User
History --> "1..1" Games
```

#### Architecture de votre code

Le backend s'appuie sur une architecture **Modèle Vue Contrôleur** (MVC) sans implémenter la vue, en effet le frontend s'occupant de ce point. Cette architecture est recommandée par [Express](https://expressjs.com/fr/) le **framework** utilisé pour le backend.

Le **modèle** accessible dans `src/models` sert d'interface entre le reste du code et [Sequelize](https://sequelize.org/) l'ORM utilisé qui fait l'interface entre notre modèle et une base de donnée physique.

Le **contrôleur** va définir dans `src/routes` les différents **endpoints REST** accessibles et leurs méthodes d'accès. Il va aussi définir les **handlers** de chaque route contenant toute la logique de l'application dans `src/controllers`.

Le **contrôleur** gère aussi des **web socket** accessibles dans `src/routes/gameWS` en plus des endpoints REST via la librairie [express-ws](https://github.com/HenningM/express-ws). En effet, la **logique des jeux** définis dans `src/controllers/gameWS` utilise la web socket car cela est important pour garder des jeux **stateless** et éviter que des utilisateurs malveillants contournent la sécurité définie.

### Gestion des rôles et droits

#### Backend

L'application ne demande pas de droits/rôles très complexes, la gestion de ces derniers est très simple.

Pour ce qui est des droits, il y a 3 types d'endpoints :
- **Endpoints simples** : tout le monde peut y accéder
- **Endpoints connecté** : il suffit d'être connecté pour y accéder
- **Endpoints admin** : il faut être connecté et administrateur de la plateforme pour y accéder

La vérification des droits pour les endpoints se fait via des middlewares.

La web socket est utilisable uniquement en étant **connectée**, cette dernière nécessite le token de l'utilisateur.

Un seul rôle est défini dans l'application : `isAdmin`, ce dernier permet d'accéder aux **endpoints admin**.

#### Frontend

## Test

### Backend

Pour les tests backend, chaque **endpoints REST** est testé via la librairie [jestjs](https://jestjs.io/fr/). Ces tests sont définis dans `src/__tests__/`.

Pour chaque **endpoints** on définit des tests valides/non valides pour obtenir la **couverture de code** la plus large possible. La couverture est disponible dans `coverage/lcov-report/index.html`.

Cependant on fonctionne différemment pour tester la **web socket**, en effet, express/express-ws ne prenant pas en charge nativement l'accès aux web socket depuis une instance du serveur. On va donc **mock une web socket** permettant de simuler une exécution et récupérer les valeurs de sortie. On ne teste cependant pas ici le code présent dans le routeur.

### Frontend

Décrivez les tests faits au niveau du backend, leur couverture.

## Intégration + déploiement (/3)

Pour l'intégration et le déploiement continu, nous utilisons la [pipeline gitlab](https://docs.gitlab.com/ee/ci/pipelines/).

Cette dernière contient cinq étapes :
- **test** : Lancement des tests backend et frontend.
- **lint** : Lancement de la vérification de code backend et frontend.
- **badges** : Création des badges pour les **tests frontend/backend**, la **couverture de code frontend/backend** et la **vérification de code frontend/backend**.
- **pages** : Mise en place du détail de la couverture de code [frontend](https://casidio-clement-nogueira-jordan-josserand-lukas--5cab9acc7267a7.pages.ensimag.fr/frontend/) et [backend](https://casidio-clement-nogueira-jordan-josserand-lukas--5cab9acc7267a7.pages.ensimag.fr/backend/) sur les pages statiques du dépôt git.
- **deploy** : Exposition de l'API et du frontend via [Scalingo](https://scalingo.com/fr) permettant le déploiement et l'hébergement de l'application disponible [ici](https://casidio.osc-fr1.scalingo.io/frontend/).

## Installation

### Pré-requis

Pour pouvoir développer l'application, il suffira d'installer [Node.js](https://nodejs.org/en/download/package-manager), ce dernier est censé contenir [NPM](https://www.npmjs.com/) permettant la gestion des modules.

Pour vérifier l'installation :

```powershell
node -v #v20.11.1
```
```powershell
npm -v #10.2.4
```

### Dépendances

Il faut dans un premier temps bien comprendre que nous avons deux modules nodes : `frontend/` et `backend/`. Chacuns d'eux contenant leurs propres dépendances et frameworks.

Pour obtenir le strict minimum avant de tester l'application il faut vous rendre dans le module voulus et installer les dépendances :
```shell
npm install
```
### Comandes

Une fois les dépendances installées, il sera possible d'exécuter les différents scripts pour développer l'application.

#### Frontend

-    **dev** : Lancement du serveur frontend en mode developpement.
-    **build** : Génération du code statique.
-    **buildProd** : Génération du code statique avec la définition des endpoints back pour le déploiement sur Scalingo.
-    **lint** : Lancement de la vérification de code.

#### Backend

Pour le backend, les commandes contenant le suffix `WIN` sont à simplement lancer sur Windows.

- **updatedb** : Supression de la base de données locales et génération d'une nouvelle avec les données présentes dans `src/util/updatedb.js`.
- **doc** : Génération de la documentation technique via l'outil [Swagger](https://swagger.io/).
- **start** : Lancement des scripts `doc` et `updatedb` puis lancement du serveur.
- **test** : Lancement du script `updatedb` puis lancement des tests sans parallélisme, ordonné dans `index.spec.js` et couverture de code.
- **startdev** : Lancement du script `doc` puis lancement du serveur.
- **lint** : Lancement de la vérification de code.
