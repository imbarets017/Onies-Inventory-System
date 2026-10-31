# Onies Inventory System

This project includes:

- MySQL schema and seed data in `schema.sql`
- React + Tailwind dashboard in `src/`
- Laravel API backend in `backend/`

## Database

The existing local MySQL database is already configured for the project:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=slipper_inventory
DB_USERNAME=root
DB_PASSWORD=oniesfootwear
```

If you need to re-seed the tables, import the SQL file into MySQL from the repo root:

```bash
$env:Path += ';C:\Program Files\MySQL\MySQL Server 8.4\bin;C:\Program Files\MySQL\MySQL Server 8.0\bin'
Get-Content .\schema.sql | mysql -uroot -p'oniesfootwear' slipper_inventory
```

## Laravel API

The Laravel backend was created in `backend/` and is configured to use the same MySQL database as the existing app.

Start the API:

```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

Available API routes:

- `GET /api/raw-materials`
- `POST /api/raw-materials`
- `GET /api/finished-goods`
- `POST /api/finished-goods`
- `GET /api/bom-costing`
- `POST /api/bom-costing`
- `GET /api/financials/cogm-cogs`

## Frontend

Install dependencies and start the dashboard:

```bash
npm install
npm run dev
```

The UI is served by Vite on `http://localhost:5173` and proxies `/api/*` requests to the Laravel backend at `http://127.0.0.1:8000`.
