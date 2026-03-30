# Installation de Ebadge
----------------------------
## Prérequis:
- [Git](https://git-scm.com/downloads)

Front-End :
- [PHP8.2](https://www.php.net/downloads)
- [Node.js](https://www.php.net/downloads)

Back-End : 
- [Serveur MySQL local](https://dev.mysql.com/downloads/mysql/)
- [Node.js](https://nodejs.org/en/download/)

------------------------------------------------------------------
#### [Avant tout, il faut cloner le dépôt Git sur notre machine.](https://github.com/Cours-Alexandre-Ouellet/projet-ebadge)
-------------------------------------------------------------------
## Installation locale du Front-End (**REACT**)

#### 1. Installer les dépendances depuis le *Node Package Manager*  
```bash
npm update
npm install
```
#### 2. Copier le fichier **.env.example** dans son dossier et le renommer **.env**

#### 3. Configurer les variables d'environnement dans **.env**
- L'api se trouve habituellement sur : **localhost:8000/api**
- Les ressources se trouvent habituellement sur : **?**
  
#### Pour démarrer le site  :

```bash
npm start
```
Le Front-End est maintenant accessible sur le port **3000**

-----------------------------------------------------------------

## Installation du Back-End (**LARAVEL**)

#### 1.  Copier le fichier **.env.example** dans son dossier et le renommer **.env**

#### 2. Configurer les variables d'environnement dans le fichier **.env**
Fournir les informations de la base de données **MySQL** locale (nom de la base de donnée, nom d'utilisateur et son mot de passe) aux variables d'environnement en lien.

#### 3. Créer une base de données locale **MySQL** avec le nom de la base de données indiqué (dans le fichier **.env**)

#### 4. Activer les extensions de **PHP**
Pour cela :
- Ouvrir le fichier **php.ini**
- Rendre la ligne exécutable *extension_dir* exécutable
- Rendre exécutables les lignes des extensions suivantes:
    - openssl
    - sodium
    - fileinfo
    - curl
    - zip
    - pdo_mysql
    - mysqli
    - mbstring

#### 5. Installer les dépendances pour **LARAVEL**
```bash
composer update
composer install
```

#### 6. Générer la clé d’application (**APP_KEY**) dans le fichier **.env**
```bash
php artisan key:generate
```

#### 7. Créer les tables de la base de données spécifiées dans le répertoire **database/migrations**, puis les remplir avec les données initiales définies dans **DatabaseSeeder**
```bash
php artisan migrate --seed
```

#### 8. Créer un lien symbolique entre public/storage et storage/app/public
- Pour rendre accessibles les fichiers téléversés (images, PDF, etc.) via le navigateur
```bash
php artisan storage:link
```

#### 9. Installer **Laravel Passport** pour gérer l’authentification API dans le but de générer des clés de chiffrement pour les **cyberjetons API**
```bash
php artisan passport:install
```

#### Si des problèmes survients : 
```bash
 php artisan cache:clear # Pour vider le cache
 php artisan config:clear # Effacer les configurations
 php artisan clear-compiled # Effacer la dernière compilation
```

#### Pour lançer le Back-End : 
```bash
php artisan serve
```
-----------------------------------------------------------------

## Exécution des tests unitaires (**LARAVEL**)
```bash
php artisan test
```
------------------------------------------------------------
## Déploiement

#### 1. Compiler l'application **REACT**
```bash
npm run build
```

#### 2. Ajuster le **.env** avec les infomations de la base de données distantes

#### 3. Exécuter les migrations
```bash
php artisan migrate
```
#### 4. Envoyer le web.config, build/ et api/ (au complet) au serveur FTP
