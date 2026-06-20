# Shopify CSV Product Import System

A production-grade system that accepts CSV file uploads containing Shopify product data, processes them asynchronously via Laravel queues, imports each product into a real Shopify store via GraphQL API, and tracks per-product import status in a React dashboard.

## Architecture

```
CSV Upload → React Frontend (:5173)
                  ↓ POST /api/uploads (multipart)
             Laravel API (:8000)
                  ↓ Dispatch Job
             Queue Worker (database queue)
                  ↓ GraphQL
             Shopify API (2024-10)
```

- **Backend**: Laravel 12, pure JSON API
- **Frontend**: React + Vite SPA, standalone project
- **Queue**: Database driver
- **Shopify API**: GraphQL only (API version 2024-10)

## Prerequisites

- PHP 8.2+
- Composer
- Node 18+
- MySQL 8+
- XAMPP (or standalone MySQL)

## Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database and Shopify credentials

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# The jobs table migration may need to run separately:
php artisan queue:table
php artisan migrate
```

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

## How to Run

You need **three terminals**:

```bash
# Terminal 1 — Laravel API server
cd backend && php artisan serve

# Terminal 2 — Queue worker (processes CSV + Shopify imports)
cd backend && php artisan queue:work --tries=3

# Terminal 3 — React dev server
cd frontend && npm run dev
```

Then open **http://localhost:5173** in your browser.

## Environment Variables

### backend/.env

| Variable | Description | Example |
|---|---|---|
| `DB_CONNECTION` | Database driver | `mysql` |
| `DB_HOST` | Database host | `127.0.0.1` |
| `DB_PORT` | Database port | `3306` |
| `DB_DATABASE` | Database name | `shopify_importer` |
| `DB_USERNAME` | Database user | `root` |
| `DB_PASSWORD` | Database password | |
| `QUEUE_CONNECTION` | Queue driver | `database` |
| `SHOPIFY_STORE_URL` | Shopify store URL | `https://store.myshopify.com` |
| `SHOPIFY_ACCESS_TOKEN` | Shopify access token | `shpat_...` |
| `SHOPIFY_COLLECTION_ID` | Shopify collection ID | `464337174767` |
| `SHOPIFY_API_VERSION` | API version | `2024-10` |
| `SHOPIFY_GRAPHQL_ENDPOINT` | GraphQL endpoint | `https://store.myshopify.com/admin/api/2024-10/graphql.json` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |

### frontend/.env

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | API base URL | `http://localhost:8000/api` |
| `VITE_APP_NAME` | Application name | `Shopify Importer` |

## How to Test

1. Start all three processes (see "How to Run" above)
2. Go to **http://localhost:5173/upload**
3. Drag a CSV file onto the drop zone (must have required columns — see sample below)
4. Click "Upload CSV"
5. You'll be redirected to the detail page showing live import progress
6. Go to **/dashboard** to see all uploads with real-time progress bars
7. Go to **/logs** to browse all log entries with JSON context viewer

### Sample CSV Format

Required columns: Handle, Title, Body HTML, Vendor, Product Type, Tags, Published, Variant SKU, Variant Price, Variant Compare At Price, Variant Requires Shipping, Variant Taxable, Variant Inventory Tracker, Variant Inventory Qty, Variant Inventory Policy, Variant Fulfillment Service, Variant Weight, Variant Weight Unit, Image Src, Image Position, Image Alt Text

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/uploads` | Upload CSV file (multipart) |
| `GET` | `/api/uploads` | List uploads (paginated) |
| `GET` | `/api/uploads/{id}` | Get upload details |
| `GET` | `/api/uploads/{id}/status` | Lightweight status poll |
| `GET` | `/api/uploads/{id}/products` | List products for upload |
| `GET` | `/api/logs` | List all logs (paginated) |
| `GET` | `/api/uploads/{id}/logs` | List logs for upload |
| `GET` | `/health` | Health check |

## Design Decisions

- **Separate backend/frontend**: The Laravel API and React SPA are completely separate projects, communicating only over HTTP. This allows independent deployment.
- **GraphQL only**: Shopify REST API is deprecated. All Shopify interactions use GraphQL with the 2024-10 API version.
- **Upsert logic**: Products are looked up by handle. If found, they're updated. If not found, they're created. This prevents duplicates.
- **Database queue**: Simple to set up with no external dependencies. Can be upgraded to Redis for higher throughput.
- **CSV stored with UUID names**: Prevents path traversal attacks and filename conflicts.
- **API Resources**: All JSON responses use Laravel API Resources, ensuring consistent output and hiding internal fields.

## Known Limitations / Future Improvements

- No authentication on API endpoints
- CSV file size limited to 10 MB
- Image upload uses Shopify's `originalSource` URL — images must be publicly accessible
- No job batching — for very large CSVs, batch in chunks of 50
