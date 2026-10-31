# Onies Inventory System

This project includes:

- MySQL schema and seed data in `schema.sql`
- PHP PDO API service in `api/`
- React + Tailwind dashboard in `src/`

## Database

Create a local MySQL database and copy the example settings:

```bash
cp .env.example .env
```

Then update `.env` with your MySQL credentials:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=slipper_inventory
DB_USER=root
DB_PASS=your_mysql_password
```

Import the SQL file into MySQL:

```bash
mysql -u root -p < schema.sql
```

The PHP API automatically loads values from `.env`, so you do not need to export them manually in the shell.

## PHP API

Serve the API locally with PHP's built-in server:

```bash
cd api
php -S 127.0.0.1:8000 index.php
```

Then use routes such as:

- `GET /api/raw-materials`
- `POST /api/raw-materials`
- `GET /api/finished-goods`
- `POST /api/finished-goods`
- `GET /api/bom-costing`
- `GET /api/financials/cogm-cogs`

## Frontend

Install dependencies and start the dashboard:

```bash
npm install
npm run dev
```

The UI is served by Vite on `http://localhost:5173`.
