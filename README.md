# Onies Inventory System

Inventory and production-costing application with a React frontend and Laravel API.

## Project structure

- `src/` — React dashboard and inventory workflows
- `backend/` — Laravel API, authentication, authorization, models, and database migrations
- `backend/database/migrations/` — authoritative database schema and upgrades

The frontend runs with Vite on port `5173` and proxies `/api` requests to Laravel on port `8000`.

## Requirements

- PHP 8.3 or later and Composer
- Node.js and npm
- MySQL

## First-time setup

1. Create a MySQL database and configure `backend/.env` with its connection details:

   ```powershell
   cd backend
   Copy-Item .env.example .env
   ```

2. Install backend dependencies, generate the Laravel application key, and run migrations:

   ```powershell
   composer install
   php artisan key:generate
   php artisan migrate
   ```

3. In a second terminal at the repository root, install frontend dependencies:

   ```powershell
   npm install
   ```

The first account registered through the app becomes the administrator. Register it after starting both servers.

## Run locally

Start the Laravel API from `backend/`:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Start the frontend from the repository root in another terminal:

```powershell
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Access levels

- **Admin** — inventory viewing, editing, importing, and deletion; user management
- **Manager** — inventory viewing, editing, importing, and deletion
- **Staff** — read-only inventory access

## Database changes

Use Laravel migrations to create or upgrade the schema:

```powershell
cd backend
php artisan migrate
```

Avoid `migrate:fresh` on a database containing inventory data; it drops existing tables. The old SQL bootstrap has been removed because it dropped tables before recreating them.

## Production frontend build

From the repository root:

```powershell
npm run build
```

The generated frontend files are written to `dist/`.
