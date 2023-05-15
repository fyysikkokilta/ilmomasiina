# Hacking Ilmomasiina

This document presents a few ways you might want to use Ilmomasiina outside our pre-packaged image.

## Embedding

To embed events on your site, there are a few options:

### Route components

The simplest option is to import ready-made route components from `ilmomasiina-components`.

In order to allow style customization, styles are not imported by our TS files. You'll need to `@use` either
`_all.scss` or individual component styles manually. You can
[override variables](https://sass-lang.com/documentation/at-rules/use#reassigning-variables) from `_definitions.scss`
before that.

In addition, you'll want to import suitable (or all) parts of Bootstrap 4's SCSS. This works best if you have a
Bootstrap 4 based app, or if you import Bootstrap nested inside your own wrapper CSS class.

The exported route components ()`Events`, `SingleEvent`, `EditSignup`) are already wrapped in `<I18nProvider>`,
which is an `I18nextProvider` with the exported `i18n` object.
You can call `changeLanguage` on the latter to set the language.

### State hooks

You can import the state hooks from `ilmomasiina-components` and write your own React frontend. This will free you from
using Bootstrap at all.

### API models

You can also go fully custom and only import the API models from `ilmomasiina-models` (see [API](#api)).

## App customization

**If you only wish to change colors and texts,** you might want to avoid forking our repo. Instead, write a
GitHub Action that clones this repo (as a submodule or directly), replaces `_definitions.scss` through a modified
`Dockerfile`, and builds your own Docker image. This makes your update process trivial when this repo is updated.

If you fork the repository and don't modify `ilmomasiina-models`,
your modified backend or frontend should be compatible with the current unmodified versions.
Don't forget to submit a PR if your code might be useful to others!

## API

To build a new API client, import `ilmomasiina-models` and use your fetch library of choice. `dist/services` has
type definitions for the API, while `dist/models` is intended for backend use.

## Importing test data from live deployment

On a host with PostgreSQL with at least the same version as the live deployment and the local database running via Docker compose, run:

```sh
$ ssh -L 5433:ilmomasiina.your_domain.com:5432
$ docker-compose up db  # Backend must not be running
$ docker-compose exec db dropdb -U ilmomasiina ilmomasiina
$ docker-compose exec db createdb -U ilmomasiina -T template0 ilmomasiina
$ pg_dump 'postgresql://DB_USER:DB_PASSWORD@localhost:5433/DB_NAME' | sudo docker-compose exec -i db psql -U ilmomasiina -d ilmomasiina
```
