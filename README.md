# SaaS Kit Starter

Starter SaaS multitenant con Next.js 14, TypeScript, MongoDB y RBAC.

## Qué incluye

- Panel dual:
  - `admin` (`/admin`): usuarios globales, planes, logs, perfil.
  - `cliente` (`/dashboard`): configuración de organización, perfil y plan.
- Autenticación:
  - Login con credenciales (NextAuth).
  - Registro público (`/register`).
  - Recuperación de contraseña (`/forgot-password`, `/reset-password`).
  - Flujo de invitaciones (`/invite/[token]`).
- RBAC organizacional:
  - Permisos de roles para usuarios, roles y logs.
- Auditoría:
  - Registro de acciones clave (auth, usuarios, roles, perfiles, suscripciones).
- Billing desacoplado por provider:
  - Contrato `BillingProvider`.
  - Webhooks genérico + por proveedor (`/api/webhooks/billing` y `/api/webhooks/billing/[provider]`).
  - Provider base `noop` listo para extender con Stripe/PayPal.
- Plantillas de email HTML table-friendly (compatibles con clientes de correo comunes).

## Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- MongoDB + Mongoose
- NextAuth
- Tailwind CSS

## Variables de entorno

1. Copia el ejemplo:

```bash
cp .env.example .env.local
```

2. Rellena valores reales en `.env.local`.

## Instalación

```bash
npm install
npm run dev
```

## Seed de desarrollo

Endpoint:

- `GET /api/seed`

Comportamiento:

- En `development`: abierto para acelerar pruebas.
- En otros entornos: requiere header `x-seed-secret` con valor `SEED_SECRET`.

Ejemplo en no-dev:

```bash
curl -H "x-seed-secret: TU_SEED_SECRET" https://tu-dominio.com/api/seed
```

## Datos seed por defecto

- Admin global: `admin@example.com` / `admin123`
- Customer admin: `customer@example.com` / `customer123`
- Organización demo: `Acme Inc.`
- Planes demo:
  - Free
  - Pro mensual (`20 EUR`) y anual (`180 EUR`, -25%)
  - Business mensual (`60 EUR`) y anual (`540 EUR`, -25%)

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## CI

Hay workflow en `.github/workflows/ci.yml` que ejecuta:

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Extender pasarelas de pago

Carpeta objetivo:

- `lib/billing/providers/`

Pasos:

1. Crear provider (`stripe.ts`, `paypal.ts`, etc.) implementando `BillingProvider`.
2. Registrarlo en `lib/billing/factory.ts`.
3. Mapear webhooks al formato `NormalizedBillingEvent`.

No necesitas tocar controladores ni acciones si respetas el contrato.

## Licencia

MIT
