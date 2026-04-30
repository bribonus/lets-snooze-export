# Azure Deployment Setup

## Architecture

| Component    | Azure service                      | Notes                       |
| ------------ | ---------------------------------- | --------------------------- |
| Landing page | Azure Static Web Apps              | Free tier, global CDN       |
| API server   | Azure App Service (Linux, Node 22) | B1 or higher                |
| Database     | Azure Database for PostgreSQL      | Flexible Server recommended |
| Mobile app   | App Store / Google Play            | Not hosted on Azure         |

The Static Web App routes `/api/*` to the App Service via the **linked backend** feature (configured in the Azure portal). All other routes serve `index.html` for client-side navigation.

---

## One-time Azure setup

### 1. Create Azure Static Web App

1. Azure Portal → Create resource → Static Web App
2. Plan: **Free**
3. Leave "Build Details" as **Other** (GitHub Actions handles the build)
4. Copy the **deployment token** — you'll need it for GitHub secrets

### 2. Create Azure App Service

1. Azure Portal → Create resource → Web App
2. Runtime: **Node 22 LTS**, OS: **Linux**
3. Plan: **B1** (Basic) or higher
4. Under **Configuration → Application settings**, add:

| Name           | Value                                   |
| -------------- | --------------------------------------- |
| `DATABASE_URL` | Your Azure PostgreSQL connection string |
| `NODE_ENV`     | `production`                            |
| `PORT`         | `8080`                                  |

5. Under **Configuration → General settings**, set startup command:
   ```
   node index.mjs
   ```
6. Download the **Publish Profile** (Overview → Get publish profile) — you'll need it for GitHub secrets

### 3. Link the backend (API proxy)

1. In your Static Web App → **APIs** → **Link**
2. Select your App Service
3. This proxies all `/api/*` requests from the SWA to the App Service automatically

---

## GitHub secrets required

Go to your GitHub repo → **Settings → Secrets and variables → Actions** and add:

| Secret name                         | Where to find it                                         |
| ----------------------------------- | -------------------------------------------------------- |
| `AZURE_STATIC_WEB_APPS_API_TOKEN`   | Static Web App → Manage deployment token                 |
| `AZURE_APP_SERVICE_NAME`            | Your App Service name (e.g. `lets-snooze-api`)           |
| `AZURE_APP_SERVICE_PUBLISH_PROFILE` | App Service → Get publish profile (paste the entire XML) |

---

## How deployments trigger

Both workflows run automatically on push to `main`, scoped to relevant paths:

- `artifacts/landing/**` or `lib/**` → deploys landing page
- `artifacts/api-server/**` or `lib/**` → deploys API server

Trigger either manually from **Actions → Run workflow** in GitHub.

---

## Database migration

After provisioning the Azure PostgreSQL database, run the schema push once from your local machine:

```bash
DATABASE_URL="<your-azure-postgres-url>" pnpm --filter @workspace/db run push
```

brianne bonus
hi
