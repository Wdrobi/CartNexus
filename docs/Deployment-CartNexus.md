# CartNexus — Deployment Information

**Version:** 1.0  
**Last updated:** 2026-04-21  

This document describes how to build, configure, and run **CartNexus** in a production-like environment. Adjust hostnames, paths, and credentials for your own server or cloud provider.

---

## 1. Architecture (deployment view)

| Layer | What you run | Notes |
|--------|----------------|--------|
| **Client** | Static files from `frontend/dist` (Vite build) | Served by Nginx, S3+CloudFront, Vercel, etc. |
| **API** | Node.js process: `node src/server.js` (or `npm start`) | Binds to `PORT` (default **5000**). |
| **Database** | MySQL 8+ (`cartnexus`) | Same host as API or managed MySQL (RDS, Cloud SQL). |
| **Files** | Directory `backend/uploads/` | Avatars, catalog covers, uploads — must persist across deploys. |
| **Realtime** | HTTP Upgrade on `/ws/admin` | Same origin as API or proxied WebSocket path. |

---

## 2. Prerequisites

- **Node.js** LTS (matching local dev).
- **MySQL** 8+ with `utf8mb4`.
- Reverse proxy (**Nginx**, Caddy, Traefik, or cloud LB) for **HTTPS** in production.
- Domain + TLS certificate (Let’s Encrypt or provider-managed).

---

## 3. Database preparation

1. Create database (or use existing):

   ```sql
   CREATE DATABASE cartnexus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Apply canonical schema for a **fresh** database:

   ```bash
   mysql -u USER -p cartnexus < backend/db/schema.sql
   ```

3. For an **existing** database that predates newer features, run only the relevant files under `backend/db/migration_*.sql` and track changes in `backend/db/db-changelog.txt`.

4. Seed data is optional (`backend/db/seed.sql` if present).

---

## 4. Backend (API)

### 4.1 Environment variables

Copy `backend/.env.example` to `backend/.env` on the server and set:

| Variable | Description |
|----------|-------------|
| `PORT` | Listen port (e.g. **5000** internally; public 443 handled by proxy). |
| `NODE_ENV` | `production` |
| `MYSQL_HOST` | DB host |
| `MYSQL_PORT` | Usually **3306** |
| `MYSQL_USER` | DB user |
| `MYSQL_PASSWORD` | Strong password |
| `MYSQL_DATABASE` | e.g. `cartnexus` |
| `JWT_SECRET` | Long random string — **never commit**; rotate invalidates existing tokens |

### 4.2 Install and start

```bash
cd backend
npm ci --omit=dev   # or npm ci if you need devDependencies on server
npm start
```

### 4.3 Process manager (recommended)

Use **PM2**, **systemd**, or your platform’s worker so the API restarts on crash and boots on reboot.

**PM2 example:**

```bash
cd /path/to/CartNexus/backend
pm2 start src/server.js --name cartnexus-api
pm2 save
pm2 startup
```

### 4.4 Health checks

- `GET /api/health` — API up.
- `GET /api/health/db` — DB connectivity (uses app pool).

Point load balancers or uptime monitors at these paths over HTTPS.

---

## 5. Frontend (SPA)

### 5.1 Build

```bash
cd frontend
npm ci
npm run build
```

Output: **`frontend/dist/`** — static assets only.

### 5.2 API URL in production

- **Same host:** If Nginx serves both SPA and proxies `/api` to Node, you often **omit** `VITE_API_URL` so the browser calls `/api/...` on the same origin.
- **Split hosting:** If the SPA is on `https://shop.example.com` and API on `https://api.example.com`, set at **build time**:

  ```env
  VITE_API_URL=https://api.example.com
  ```

  Rebuild after changing `VITE_API_URL`.

Optional storefront fallbacks (`VITE_WHATSAPP_*`, `VITE_SOCIAL_*`, etc.) are documented in `frontend/.env.example`.

### 5.3 Preview build locally

```bash
cd frontend
npm run preview
```

---

## 6. Reverse proxy (Nginx sketch)

Example: TLS on `www.example.com`, API on same machine port 5000, SPA files under `/var/www/cartnexus`.

```nginx
server {
    listen 443 ssl http2;
    server_name www.example.com;

    # ssl_certificate ... ssl_certificate_key ...

    root /var/www/cartnexus;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5000;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- **`/ws/`** — Admin WebSocket (`/ws/admin` on the Node server). Match your `server.js` mount.
- **`/uploads/`** — Static files served by Express from `backend/uploads`; proxying keeps one public origin.

---

## 7. WebSocket (admin dashboard)

The server attaches WebSocket at **`/ws/admin`** (see `backend/src/server.js`). Clients must use **`wss://`** when the site is on HTTPS. Ensure the proxy passes **Upgrade** headers (see `location /ws/` above).

---

## 8. File uploads & persistence

- Uploaded images live under **`backend/uploads/`** (avatars, catalog covers, etc.).
- **Backup** this directory with the database.
- On container/Kubernetes deployments, mount a **persistent volume** at that path.

---

## 9. Security checklist (production)

- [ ] `JWT_SECRET` strong and unique per environment  
- [ ] `.env` not in git; restrict file permissions on server  
- [ ] HTTPS only; redirect HTTP → HTTPS  
- [ ] MySQL user has **least privilege** (not root)  
- [ ] Firewall: only 80/443 public; DB port not exposed to internet unless required  
- [ ] Regular **DB backups** and tested restore  
- [ ] Optional: rate limiting / WAF in front of API  

---

## 10. Smoke test after deploy

With API running:

```bash
cd backend
npm run test:smoke
```

Configure the script’s base URL / token if required (see `backend/scripts/smoke-api.mjs`).

Manually verify: home loads, `/api/products` returns JSON, login, admin route, checkout flow on staging.

---

## 11. Rollback strategy

- **Frontend:** redeploy previous `dist` artifact from CI or backup.  
- **Backend:** redeploy previous container/image or git tag; run down migrations only if you use explicit migration tooling.  
- **Database:** restore from snapshot before bad migration; avoid destructive SQL without backup.

---

## 12. Related files in this repo

| Topic | Path |
|--------|------|
| DB schema | `backend/db/schema.sql` |
| Change log | `backend/db/db-changelog.txt` |
| Backend env template | `backend/.env.example` |
| Frontend env template | `frontend/.env.example` |
| Vite proxy (dev) | `frontend/vite.config.js` |

---

*Update this document when deployment topology (Docker, K8s, PaaS) is finalized.*
