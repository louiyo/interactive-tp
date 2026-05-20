# TP7 — Prompting Collaboratif

Application web pour l'exercice TP7 : prompting collaboratif en 3 étapes.

## Lancement local (dev)

```bash
npm install
npm run dev
```

→ Ouvrir : http://localhost:3000  
→ Admin : http://localhost:3000/admin (mot de passe : `adminadmin`)

## Lancement local (production, avec Docker)

```bash
docker build -t interactive-tp .
docker run -p 3000:3000 -v tp7-data:/data interactive-tp
```

→ Les données SQLite sont persistées dans le volume `tp7-data`.

## Déploiement via GitHub Actions

1. **Pousser ce dépôt sur GitHub** (repo public ou privé)
2. Le workflow `.github/workflows/deploy.yml` se déclenche automatiquement à chaque push sur `main`
3. L'image Docker est publiée sur GitHub Container Registry (`ghcr.io`)
4. **Sur votre serveur** (VPS, machine de formation) :

```bash
# Première fois
docker login ghcr.io -u VOTRE_USERNAME
docker pull ghcr.io/VOTRE_USERNAME/interactive-tp:latest
docker run -d -p 3000:3000 -v tp7-data:/data --name tp7 ghcr.io/VOTRE_USERNAME/interactive-tp:latest

# Mise à jour
docker pull ghcr.io/VOTRE_USERNAME/interactive-tp:latest
docker stop tp7 && docker rm tp7
docker run -d -p 3000:3000 -v tp7-data:/data --name tp7 ghcr.io/VOTRE_USERNAME/interactive-tp:latest
```

> **Astuce :** si vous n'avez pas de serveur, utilisez [Railway](https://railway.app) ou [Render](https://render.com) — ils déploient directement depuis une image Docker avec volume persistant (free tier suffisant pour une session).

## Changer le mot de passe admin

Le mot de passe par défaut est `admin123`. Pour le changer avant une session :

```bash
# Avec sqlite3 installé
sqlite3 data/tp7.db "UPDATE app_state SET value='NOUVEAU_MOT_DE_PASSE' WHERE key='admin_password';"```

Ou via une variable d'environnement en ajoutant dans `src/lib/db.ts` la lecture de `process.env.ADMIN_PASSWORD`.

## Déroulement d'une session

| Moment | Action formateur | Action participant |
|--------|------------------|--------------------|
| Début | Partager l'URL | Aller sur l'URL, saisir son prénom, remplir le besoin |
| Après étape 1 | Cliquer **Tirage 1** dans `/admin` | L'app débloque l'étape 2 automatiquement |
| Après étape 2 | Cliquer **Tirage 2** dans `/admin` | L'app débloque l'étape 3 automatiquement |
| Fin | Cliquer **Réinitialiser** pour la prochaine session | — |

## Réinitialiser entre deux sessions

Cliquer **Réinitialiser la session** dans le tableau de bord `/admin`.  
Toutes les données sont effacées et l'étape revient à 1.
