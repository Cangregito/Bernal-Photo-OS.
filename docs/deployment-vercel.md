# Despliegue en Vercel y CI/CD

Este proyecto usa GitHub Actions para validar calidad y desplegar en Vercel con dos estrategias:

- Preview: cada Pull Request (solo si no viene de fork).
- Production: cada push a `main`.

El pipeline está en `.github/workflows/ci.yml`.

## 1. Secrets requeridos en GitHub

Configura estos secretos en `Settings > Secrets and variables > Actions`:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 2. Variables requeridas en Vercel

Configura las variables en Vercel para cada entorno (`Development`, `Preview`, `Production`).

### Variables públicas

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

### Variables privadas

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_TEST_EMAIL` (solo mientras no se verifique dominio en Resend)
- `N8N_WEBHOOK_SECRET`

## 3. Flujo del pipeline

1. `quality`: lint, type-check, build y unit tests.
2. `e2e`: pruebas Playwright contra servidor Next en puerto `3001`.
3. `deploy_preview`: PR deploy a Vercel Preview (artifact con URL).
4. `deploy_production`: push a `main` deploy a Vercel Production (artifact con URL).

## 4. Recomendaciones de branch protection

Configurar reglas en GitHub para `main` y `develop`:

- Requerir checks exitosos: `Lint, Types, Build and Unit Tests` y `Playwright E2E`.
- Bloquear merge con checks pendientes/fallidos.
- Requerir rama actualizada antes de merge.

## 5. Rotación de secretos

Si llaves sensibles fueron compartidas o expuestas fuera del entorno local:

1. Rotar llaves en Supabase y Resend.
2. Actualizar valores en Vercel.
3. Actualizar variables locales de desarrollo.

## 6. Verificación rápida

Checklist para validar setup:

- PR a `develop` o `main` dispara `quality`, `e2e` y `deploy_preview`.
- Push a `main` dispara `deploy_production`.
- Artifact `vercel-preview-url` contiene URL de preview.
- Artifact `vercel-production-url` contiene URL productiva.
