# Installation

This file contains installation instructions both for [production](#production) and [development](#development).

## Production

There are a few ways to run Ilmomasiina in production:

- [Docker as Azure Web App](#azure) (used by Tietokilta)
- [Docker without Azure](#docker-manual) (same setup, should work)
- [Docker Compose](#docker-compose) (currently untested)
- [Without Docker](#running-without-docker) (not recommended)

Other prerequisites:

- You'll need to bring your own [email service](#email-sending).
- When running outside Azure and without Docker Compose, you'll need a separate [database](#database-setup).
- When running outside Azure, you may also need to setup [reverse proxying](#reverse-proxy).

### Generating secrets

You'll need to generate at least two secrets for Ilmomasiina, `NEW_EDIT_TOKEN_SECRET` and `FEATHERS_AUTH_SECRET`.

These need to be **different** secure random strings with enough entropy. You can use a password generator and
generate passwords with at least 32 characters, or e.g. run `openssl rand -hex 32` to generate them.

### Database setup

You'll need a MySQL/MariaDB or PostgreSQL database, and a user with full privileges to the DB.

The app will automatically create the database schema upon startup.

#### Ubuntu/Debian MariaDB installation

If you intend to run your own database, you can follow these instructions to install one on a Ubuntu or Debian system.

1. Install MariaDB with `sudo apt install default-mysql-server`
2. MariaDB should start automatically. Run `sudo systemctl start mariadb` if necessary.
3. Run `sudo mysql_secure_installation` and follow instructions (defaults are generally fine).
4. Open a MariaDB terminal with `sudo mysql -u root -p` (use the root password set in previous step).
5. Create a new user for Ilmomasiina:
   `CREATE USER 'ilmo_user'@'localhost' IDENTIFIED BY '<add a password here>';`
6. Create the `ilmomasiina` database: `CREATE DATABASE ilmomasiina;`
7. Grant permissions on the new database:
   `GRANT ALL PRIVILEGES ON ilmomasiina.* TO 'ilmo_user'@'localhost';`
8. Exit with `exit`. Try signing in with your new user: `mysql -u ilmo_user -p`
   (don't use `mysql -u ilmo_user -p password`)

### Email sending

Ilmomasiina needs a way to send emails, both for signup confirmation and user passwords.

Mailgun and SMTP providers are currently supported. With minor changes, sending mail could
be also done via Sendgrid or other services. Ilmomasiina uses Nodemailer - PRs welcome.

#### Mailgun

[Mailgun](https://www.mailgun.com/) is relatively cheap and can be enabled via env variables.

- `MAILGUN_API_KEY` = Mailgun API key (created under *Domain settings* &rarr; *Sending API keys*)
- `MAILGUN_DOMAIN` = Authorized sending domain in Mailgun
- `MAILGUN_HOST` = `api.eu.mailgun.net` or `api.mailgun.net` depending on region

#### SMTP

You can configure SMTP servers via env variables.

- `SMTP_HOST` = SMTP server
- `SMTP_PORT` = SMTP port, typically 25, 465 or 587
- `SMTP_USER` = SMTP username
- `SMTP_PASSWORD` = SMTP password
- `SMTP_TLS` = typically `true` if using TLS (port 465), `false` otherwise
    - Requiring STARTTLS is not currently supported - PRs welcome

**Note:** Using your own mail server gets you labelled as spam easily and should be avoided in production. User-facing email providers like Google might also not want you sending automatic email via them.

### Azure

Tietokilta uses Azure to run Ilmomasiina. Azure gives credits for free to non-profits which should be enough for this.

Azure recently reduced free credits to $2000, which is barely enough to run a production-grade App Service (P1v2/P0v3).
B-tier App Service Plans have been tried and at least B1 doesn't seem to handle load well.

1. Create an *Azure Database for PostgreSQL Flexible Server* (resource category *Databases*).
    - *Basics* step: ([screenshot](./screenshots/db-basics.png))
        - *Server name:* Choose freely.
        - *Region:* Choose freely, but probably Europe.
        - *PostgreSQL version:* 15
        - *Workload type:* Development
        - *Compute + storage:* Choosing Development should pick you a B-tier SKU. We're not entirely sure if these have enough performance in practice.
        - *Authentication method:* PostgreSQL authentication only
        - *Admin username:* Choose freely.
        - *Admin password:* Choose freely & save for later.
    - *Networking* step:
        - *Connectivity method:* Public
        - Check *Allow public access from any Azure service within Azure to this server*
    - *Security* and *Tags* can be skipped
2. From the *Databases* page, create a database on that server.
    - The name can be chosen freely.
3. **Recommended:** Create a user on the server and grant access to the database.
    - You can technically also use the PostgreSQL admin user if you don't use the database for anything else.
    - This requires connecting to the database manually:
        1. From the *Networking* page, under *Firewall rules*, add a rule for *current client IP address* and save.
        2. From the *Connect* tab, copy the `psql` command:
           ```shell
           psql -h {postgres-server-name}.postgres.database.azure.com -p 5432 -U {admin_user_name} {db_name}
           ```
4. Create an *Azure Web App* (resource category *Web*).
    - *Basics* step: ([screenshot](./screenshots/web-app-basics.png))
        - *Web App name:* Choose freely, will appear in your URLs as `https://{your-app-name}.azurewebsites.net/`.
        - *Publish:* Docker Container
        - *Operating System:* Linux
        - *Region:* Choose freely, but probably same as your database.
        - *Linux Plan:* Reuse an existing one or create a new one.
        - *Pricing plan:* B2 has been tested and isn't very performant. You may want to go for P1v2/P0v3 if your budget allows.
    - *Database* step can be skipped
    - *Docker* step: ([screenshot](./screenshots/web-app-docker.png))
        - *Options:* Single Container
        - *Image Source:* Private Registry
        - *Server URL:* `https://ghcr.io`
        - *Image and tag:*
          - `tietokilta/ilmomasiina:latest` to use  or pin to a certain version, or use your own modified image
    - *Networking* step:
        - *Enable public access:* On
    - *Monitoring* and *Tags* can be skipped
5. Read [.env.example](../.env.example). Set relevant variables as *Application settings* on the *Configuration* page. You'll need at least:
    - `PORT` and `WEBSITES_PORT` must match (you can set both to 3000)
    - `DB_DIALECT` = `postgres`
    - `DB_HOST` = Domain name of your PostgreSQL server (from *Connect* page)
    - `DB_USER` = username of PostgreSQL user
    - `DB_PASSWORD` = password of PostgreSQL user
    - `DB_DATABASE` = name of PostgreSQL database
    - `DB_SSL` = `true` (required with Azure's default config)
    - `ADMIN_REGISTRATION_ALLOWED` = `true` for initial setup (see [_Creating the first admin user_](#creating-the-first-admin-user))
    - `NEW_EDIT_TOKEN_SECRET` = secure random string (see [_Generating secrets_](#generating-secrets))
    - `FEATHERS_AUTH_SECRET` = secure random string (see [_Generating secrets_](#generating-secrets))
    - `MAIL_FROM` = "From" email for system messages
    - `MAILGUN_*` **or** `SMTP_*` for email credentials (see [_Email sending_](#email-sending))
    - `BASE_URL` = `https://{your-app-name}.azurewebsites.net/`
    - `BRANDING_MAIL_FOOTER_TEXT` and `BRANDING_MAIL_FOOTER_LINK` (may be empty)
6. Access the app at `https://{your-app-name}.azurewebsites.net/`.
    - If something is broken, check the *Log stream* page or read logs via `https://{your-app-name}.scm.azurewebsites.net/`.
7. On first run, follow the instructions in [_Creating the first admin user_](#creating-the-first-admin-user).

### Docker Compose

You can use Docker Compose to run both a database and production container locally.
**Currently, we don't actively test this configuration.**

1. Create a `.env` file at the root of this repository. You can copy [.env.example](../.env.example) to begin and read the instructions within.
2. Modify `args` in `docker-compose.prod.yml` for frontend customization.
3. Run `docker-compose -f docker-compose.prod.yml up` manually or e.g. via `systemd`.
4. Access the app at <http://localhost:8000>.
5. On first run, follow the instructions in [_Creating the first admin user_](#creating-the-first-admin-user).

### Docker (manual)

If you already have a database, you can run a plain Docker container locally.

1. Create a `.env` file at the root of this repository. You can copy [.env.example](../.env.example) to begin and read the instructions within.
2. Build your image:
    ```
    docker build \
      --build-arg BRANDING_HEADER_TITLE_TEXT='Tietokillan ilmomasiina' \
      --build-arg BRANDING_FOOTER_GDPR_TEXT='Tietosuoja' \
      --build-arg BRANDING_FOOTER_GDPR_LINK='https://example.com' \
      --build-arg BRANDING_FOOTER_HOME_TEXT='Kotisivu' \
      --build-arg BRANDING_FOOTER_HOME_LINK='https://example.com' \
      -t ilmomasiina
    ```
3. Run manually or with e.g. `systemd`:
    ```
    docker run -it --rm --init --env-file=.env -p 3000:3000 ilmomasiina
    ```
   You might have to add stuff here to e.g. allow database connections.
4. Access the app at <http://localhost:3000>.
5. On first run, follow the instructions in [_Creating the first admin user_](#creating-the-first-admin-user).

### Running without Docker

You can also set up a production deployment without Docker. **This method is not recommended.**

1. Install a suitable Node version (e.g. using nvm).
2. Run `npm install -g pnpm@7` to install pnpm. Then run `pnpm install --frozen-lockfile` to setup cross-dependencies
   between packages and install other dependencies.
3. Create a `.env` file at the root of this repository. You can copy [.env.example](../.env.example) to begin and read the instructions within.
4. Run `npm run clean` followed by `npm run build`.
5. Use e.g. `systemd` or `pm2` (`npm install -g pm2`) to run the server process:
    ```
    node packages/ilmomasiina-backend/dist/bin/server.js
    ```
6. Access the app at <http://localhost:3000>.
7. On first run, follow the instructions in [_Creating the first admin user_](#creating-the-first-admin-user).

### Reverse proxy

If you want to serve ilmomasiina from a subdirectory of your website, you need to set up reverse proxying.

This will also require changing the `PATH_PREFIX` env variable when building the frontend or container.

The examples assume `/ilmo/` is the subdirectory and `PORT` is 3000 - adjust accordingly if needed.

The examples use the backend server to serve the frontend files, which is less efficient than using
a proper web server to serve them.

#### Apache + `mod_proxy`

This approach requires access to Apache config.

```apache
# proxy https://your.website/ilmo/whatever to http://127.0.0.1:3000/whatever
<Location "/ilmo/">
  ProxyPass "http://127.0.0.1:3000/"
</Location>
```

#### Apache + `mod_rewrite`

This approach works both in `.htaccess` (with suitable `AllowOverride`s) or Apache config.
In Apache config, you may need to change the rules slightly.

It can use either the backend server or Apache to also serve the frontend files.
If Apache is to be used, the built frontend must be placed in the folder. **(untested)**

```apache
RewriteEngine On

# redirect https://your.website/ilmo to https://your.website/ilmo/
RewriteBase /
RewriteRule ^ilmo$ ilmo/ [NC,R=301,L]

# always proxy https://your.website/ilmo/ to http://127.0.0.1:3000/
RewriteRule ^ilmo/(.*)$ http://127.0.0.1:3000/$1 [P,L]

# proxy https://your.website/ilmo/whatever to http://127.0.0.1:3000/whatever,
# but only if the file doesn't exist in the webroot
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ilmo/(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

### Creating the first admin user

By default, only logged-in admin users can create new admin users using the `/admin` endpoint.
To create the first user on a new system, admin registration needs to be allowed.

Allow admin registration temporarily by adding the env variable `ADMIN_REGISTRATION_ALLOWED=true`.

Now, create a new user with POST request to `/api/users`. For example, using `curl`:
```
curl 'http://localhost:3000/api/users' \
    -H 'Content-Type: application/json' \
    --data '{ "email": "user@tietokilta.fi", "password": "password123" }'
```

**Important**: After creating the first user, disallow admin user creation by removing the env variable and restarting
Ilmomasiina.

## Development

In development, we recommend running *without* Docker. It's easier to use in most cases,
but you'll need to set up your own database.

There's also a [Docker Compose setup](#docker-compose-1). It has drawbacks, but it handles
database creation automatically.

### Running without Docker

1. Install a suitable Node version (e.g. using nvm).
2. Install a database.
    - See [_Database setup_](#database-setup) for instructions on setting up MySQL.
    - You can also use Docker for a database.
    - SQLite may also work, but is currently untested.
3. Create a `.env` file at the root of this repository. You can copy [.env.example](../.env.example) to begin and read the instructions within.
4. Run `npm install -g pnpm@7` to install pnpm. Then run `pnpm install --frozen-lockfile` to setup cross-dependencies
   between packages and install other dependencies.
5. Run `npm start` or `pnpm start`. This will start the frontend and backend dev servers in parallel.
    - If you want cleaner output, you can run `npm start` separately in `packages/ilmomasiina-frontend` and
      `packages/ilmomasiina-backend`.
    - Alternatively, you can use `pnpm run --filter=@tietokilta/ilmomasiina-frontend start`
      (and similar for the backend).
6. Access the app at <http://localhost:3000>.
7. On first run, follow the instructions in [_Creating the first admin user_](#creating-the-first-admin-user).

Currently Prettier is not used in the project, so here is a recommended `.vscode/settings.json` config:

```json
// .vscode/settings.json
{
  "[typescript]": {
    "editor.defaultFormatter": "vscode.typescript-language-features"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "vscode.typescript-language-features"
  }
}
```
### Docker Compose

The entire development setup can also be run within Docker using Docker Compose. The
[docker-compose dev setup](../docker-compose.yml) is located at the root of this repository, and contains a
pre-configured PostgreSQL server, so an external database server is not required.

1. Create a `.env` file at the root of this repository. You can copy [.env.example](../.env.example) to begin and read the instructions within.
2. Go to the repository root and run `docker-compose up`. This builds the dev container and starts the frontend and
   backend servers in parallel.
3. Access the app at <http://localhost:3000>.
4. On first run, follow the instructions in [_Creating the first admin user_](#creating-the-first-admin-user).

Due to how the dev Docker is set up, you will still need to rebuild the development image if you change the
dependencies, package.json or ESLint configs. You'll also need Node.js and pnpm installed locally to do that.
