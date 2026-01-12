# 💻 Cubicle - Réseau Social de Partage de Snippets de Code

[![GitHub](https://img.shields.io/github/last-commit/Elyes5/DDA_SADDEM_Elyes_PROJET_INFO3?color=green)](https://github.com/Elyes5/DDA_SADDEM_Elyes_PROJET_INFO3.git)

## 1. Contexte du Projet

Ce projet, **Cubicle**, est une application web dont l'objectif est de fournir une **API RESTful** pour un réseau social spécialisé dans le **partage et la revue de petits blocs de code (snippets)**.

L'application vise à formaliser les échanges entre développeurs en permettant de poster des snippets, de les classer par **sujet d'expertise (topic)**, de les commenter (revues par les pairs), de **liker** et de suivre les autres contributeurs.

---

## 2. Architecture Technique et Stack

L'application est conçue selon une architecture modulaire et conteneurisée.

- **Backend/API RESTful** : Développé en **Python/Flask**.
- **Frontend** : **React** avec **Vite** (TypeScript).
- **Base de Données** : **MySQL** (relationnelle).
- **ORM** : Utilisation d'**SQLAlchemy** via **Flask-SQLAlchemy**.
- **Conteneurisation & Orchestration** : **Docker**, **Kubernetes (K8s)** sur **Infomaniak**.
- **Hébergement Frontend** : **Netlify**.
- **Hébergement Backend** : **Infomaniak**.

---

## 3. Accès en Production

L'application est déployée et accessible via les adresses suivantes :

- **Frontend (Application Web)** : [https://cubicleapp.tech/](https://cubicleapp.tech/)
- **Backend (API Documentation/Endpoint)** : [http://api.cubicleapp.tech/](http://api.cubicleapp.tech/)

---

## 4. Développement Local

> **⚠️ Configuration Requise : Fichiers `.env`**
> Le projet nécessite des variables d'environnement pour fonctionner. Ces fichiers contiennent des informations sensibles (crédentials BDD, clés secrètes, URLs) et sont **ignorés par Git** pour des raisons de sécurité.
>
> Avant de lancer le projet, assurez-vous de créer :
> * Un fichier **`.env` côté Backend** (accès Base de Données, Secret Key Flask).
> * Un fichier **`.env` côté Frontend** (URL de l'API).

### A. Backend (Docker Compose)

Pour lancer le backend et la base de données localement :

1.  **Cloner le dépôt :**
    ```bash
    git clone [https://github.com/Elyes5/DDA_SADDEM_Elyes_PROJET_INFO3.git](https://github.com/Elyes5/DDA_SADDEM_Elyes_PROJET_INFO3.git)
    cd cubicle
    ```

2.  **Lancer les services :**
    ```bash
    docker-compose up --build -d
    ```
    *(Démarre le serveur Flask sur le port 5000 et MySQL).*

3.  **Vérification :**
    L'API est accessible sur : `http://localhost:5000/api/`.

### B. Frontend (Vite)

Le frontend utilise **Vite** pour un environnement de développement rapide. Des outils de qualité de code (**ESLint**, **Prettier**) sont intégrés pour assurer la cohérence et éviter les erreurs de typage (règles strictes sur le `any`, variables inutilisées, etc.).

1.  **Installation des dépendances :**
    ```bash
    cd frontend
    npm install
    ```

2.  **Lancer le serveur de développement :**
    ```bash
    npm run dev
    ```
    *Le frontend est accessible sur le port 5173.*

3.  **Commandes utiles pour la qualité du code :**
    - **Formater le code** (Prettier) : `npm run format`
    - **Vérifier le code** (Linting) : `npm run lint`

---

## 5. Déploiement et CI/CD

Le projet intègre un pipeline **CI/CD** complet automatisant le déploiement du backend vers un cluster Kubernetes hébergé chez **Infomaniak** et du frontend sur **Netlify**.

### Pipeline Backend (GitHub Actions)
À chaque `push` sur la branche `master` impactant le dossier `cubicle-be` ou la configuration K8s :
1.  **Build** : L'image Docker du backend est construite.
2.  **Registry** : L'image est poussée sur le **GitHub Container Registry (GHCR)**.
3.  **Deploy** : Une action configure `kubectl` et applique les manifestes sur le cluster Infomaniak. L'image du déploiement est mise à jour dynamiquement pour déclencher un *rolling update*.

### Infrastructure Kubernetes
Le déploiement sur Infomaniak repose sur une configuration robuste :
- **Deployment** : Gère les réplicas du backend avec gestion des secrets (certificats DB, variables d'environnement) montés via `volumeMounts` et `envFrom`.
- **Service** : Expose le backend en interne (ClusterIP).
- **Ingress (Nginx)** : Gère le routage HTTP, force la redirection SSL, et configure explicitement les en-têtes **CORS** pour autoriser les requêtes venant uniquement de `https://cubicleapp.tech` (Frontend).

---

## 6. Modélisation des Données et Relations

Le schéma de base de données est structuré pour répondre aux exigences de la SAE concernant les trois types de relations obligatoires.

| Entités                                        | Type de Relation | Explication                                                                                            | Contrainte SAE   |
| :--------------------------------------------- | :--------------- | :----------------------------------------------------------------------------------------------------- | :--------------- |
| **Snippet** $\leftrightarrow$ **Review** | **One-to-Many** | Un snippet reçoit plusieurs revues/commentaires.                                                       | **One-to-Many** |
| **User** $\leftrightarrow$ **User** (Follower) | **Many-to-Many** | Un utilisateur suit plusieurs personnes, et est suivi par plusieurs (relation récursive).              | **Many-to-Many** |
| **Snippet** $\leftrightarrow$ **Topic** | **Many-to-Many** | Un snippet peut être associé à plusieurs sujets d'expertise.                                           | **Many-to-Many** |
| **User** $\leftrightarrow$ **Snippet** (Likes) | **Many-to-Many** | Un utilisateur peut liker plusieurs snippets, et un snippet peut être liké par plusieurs utilisateurs. | **Many-to-Many** |

Voici le diagramme résultant:

<div align="center">
  <img src="diagram.png" alt="Diagram" width="1000" height="1000">
</div>

---

## 7. Exemples de Routes API REST (Interface et Démonstration)

L'API utilise les verbes HTTP standards (GET, POST, PUT, DELETE). Voici les routes actuellement implémentées dans le backend (basées sur les contrôleurs Flask).

### 1. Gestion des Utilisateurs (`/api/users`)

| Méthode HTTP | Route (URL)                       | Description                                                  | Démonstration    |
| :----------- | :-------------------------------- | :----------------------------------------------------------- | :--------------- |
| `GET`        | `/api/users/{user_id}`            | Récupère le profil complet d'un utilisateur.                 | CRUD de base     |
| `GET`        | `/api/users/{user_id}/followers`  | Liste les abonnés (followers) d'un utilisateur.              | **Many-to-Many** |
| `GET`        | `/api/users/{user_id}/following`  | Liste les abonnements (following) d'un utilisateur.          | **Many-to-Many** |
| `POST`       | `/api/users/{user_id}/follow`     | Permet à l'utilisateur connecté de suivre `user_id`.         | **Many-to-Many** |
| `POST`       | `/api/users/{user_id}/unfollow`   | Permet à l'utilisateur connecté de ne plus suivre `user_id`. | **Many-to-Many** |

### 2. Gestion des Snippets (`/api/snippets`)

| Méthode HTTP | Route (URL)                        | Description                                          | Démonstration           |
| :----------- | :--------------------------------- | :--------------------------------------------------- | :---------------------- |
| `GET`        | `/api/snippets/`                   | Récupère la liste des snippets publics.              | CRUD de base            |
| `POST`       | `/api/snippets/`                   | Crée et publie un nouveau snippet.                   | CRUD de base            |
| `GET`        | `/api/snippets/{snippet_id}`       | Récupère un snippet spécifique par son ID.           | CRUD de base            |
| `PUT`        | `/api/snippets/{snippet_id}`       | Met à jour un snippet existant.                      | CRUD de base            |
| `DELETE`     | `/api/snippets/{snippet_id}`       | Supprime un snippet.                                 | CRUD de base            |
| `GET`        | `/api/snippets/topic/{topic_id}`   | Récupère les snippets filtrés par un sujet (Topic).  | Requête filtrée         |
| `GET`        | `/api/snippets/user/{user_id}`     | Récupère tous les snippets créés par un utilisateur. | Requête filtrée         |
| `POST`       | `/api/snippets/{snippet_id}/like` | Ajoute un "like" au snippet.                         | **Many-to-Many (Like)** |
| `POST`       | `/api/snippets/{snippet_id}/unlike` | Retire le "like" du snippet.                         | **Many-to-Many (Like)** |

### 3. Gestion des Revues / Commentaires (`/api/reviews`)

| Méthode HTTP | Route (URL)                         | Description                                          | Démonstration   |
| :----------- | :---------------------------------- | :--------------------------------------------------- | :-------------- |
| `POST`       | `/api/reviews/snippet/{snippet_id}` | Ajoute ou met à jour une revue (note + commentaire). | **One-to-Many** |
| `DELETE`     | `/api/reviews/snippet/{snippet_id}` | Supprime une revue laissée par l'utilisateur.        | **One-to-Many** |

### 4. Gestion des Sujets (Topics) (`/api/topics`)

| Méthode HTTP | Route (URL)              | Description                                 | Démonstration |
| :----------- | :----------------------- | :------------------------------------------ | :------------ |
| `GET`        | `/api/topics/`           | Liste tous les sujets disponibles.          | CRUD de base  |
| `GET`        | `/api/topics/{topic_id}` | Récupère les détails d'un sujet spécifique. | CRUD de base  |
| `POST`       | `/api/topics/`           | Crée un nouveau sujet d'expertise.          | CRUD de base  |