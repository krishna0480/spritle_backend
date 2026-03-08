# Spritle Portal — Backend (NestJS)

REST API for the Spritle Portal — handles authentication, Freshdesk integration, HubSpot OAuth, and webhook logging.

---

## 🔗 Live API

```
https://spritle-backend-fpp4.onrender.com
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| NestJS | Backend framework |
| MongoDB + Mongoose | Database |
| JWT + Passport | Authentication |
| bcryptjs | Password hashing |
| ConfigModule | Environment variables |

---

## 📁 Project Structure

```
src/
  auth/               ← Signup, Login, JWT strategy
  freshdesk/          ← Freshdesk API integration
  hubspot/            ← HubSpot OAuth integration
  webhook/            ← Webhook receiver and logs
  app.module.ts
  main.ts
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally
- npm

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/spritle-backend.git
cd spritle-backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.sample .env
# Fill in your values (see below)

# 4. Start development server
npm run start:dev
```

Backend runs at: `http://localhost:3001`

---

## 🔐 Environment Variables

Create a `.env` file in the root:

```env
# MongoDB
DB_URI=mongodb://localhost:27017/spritle

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=1d

# Freshdesk
FRESHDESK_API_KEY=your_freshdesk_api_key
FRESHDESK_DOMAIN=yourcompany

# HubSpot OAuth
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
HUBSPOT_REDIRECT_URI=http://localhost:3000/hubspot/callback
```

### `.env.sample`
# ─── Database ─────────────────────────────────────────────────────────────────
DB_URI=mongodb://localhost:27017/spritle

# ─── JWT ──────────────────────────────────────────────────────────────────────
JWT_SECRET=my_super_secret_jwt_key_change_this
JWT_EXPIRE=1d

# ─── Freshdesk ────────────────────────────────────────────────────────────────
# API key from: Freshdesk → Profile Picture → Profile Settings
# Domain: only the subdomain e.g. "acme" not "acme.freshdesk.com"
FRESHDESK_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FRESHDESK_DOMAIN=acme

# ─── HubSpot OAuth ────────────────────────────────────────────────────────────
# From: developers.hubspot.com → Apps → Your App → Auth tab
# Required scopes: crm.objects.contacts.read, crm.objects.contacts.write, oauth
HUBSPOT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HUBSPOT_CLIENT_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HUBSPOT_REDIRECT_URI=http://localhost:3000/hubspot/callback

# ─── App ──────────────────────────────────────────────────────────────────────
# Local:      http://localhost:3001
# Production: https://spritle-backend-fpp4.onrender.com
PORT=3001

---

## 🔑 API Credentials Setup

### Freshdesk API Key

1. Log in to `https://yourcompany.freshdesk.com`
2. Click **Profile Picture** (top right) → **Profile Settings**
3. Copy the **API Key** from the right side panel
4. Add to `.env`:

```env
FRESHDESK_API_KEY=your_api_key
FRESHDESK_DOMAIN=yourcompany   # only the subdomain, not .freshdesk.com
```

### HubSpot OAuth

1. Go to **https://developers.hubspot.com** → log in
2. Click **Apps** → **Create app** → name it `Spritle Portal`
3. Go to **Auth** tab → copy **Client ID** and **Client Secret**
4. Under **Redirect URLs** add:
   - `http://localhost:3000/hubspot/callback`
5. Under **Scopes** add:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `oauth`
6. Save and add to `.env`:

```env
HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret
HUBSPOT_REDIRECT_URI=http://localhost:3000/hubspot/callback
```

---

## 📡 API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login, returns JWT |
| POST | `/auth/refresh` | ✅ Refresh token | Refresh access token |
| GET | `/auth/logout` | ✅ JWT | Logout |

### Freshdesk

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/freshdesk/connect` | ✅ JWT | Save Freshdesk credentials |
| GET | `/freshdesk/status` | ✅ JWT | Check connection status |
| GET | `/freshdesk/tickets` | ✅ JWT | List all tickets |
| GET | `/freshdesk/tickets/:id` | ✅ JWT | Get single ticket |
| GET | `/freshdesk/tickets/:id/conversations` | ✅ JWT | Get conversations |

### HubSpot

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/hubspot/connect` | ✅ JWT | Get OAuth auth URL |
| GET | `/hubspot/callback?code=` | ❌ | OAuth callback |
| GET | `/hubspot/contact?email=` | ✅ JWT | Search contact by email |

### Webhooks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/webhook/freshdesk` | ❌ Public | Receive Freshdesk events |
| GET | `/webhook/logs?limit=100` | ✅ JWT | Get webhook logs |

---

## 🪝 Webhook Configuration (Freshdesk)

### Ticket Creation Rule

1. Go to Freshdesk → **Admin** ⚙️ → **Workflows** → **Automations**
2. Click **Ticket Creation** tab → **Create from Scratch**
3. Rule Name: `Spritle Portal Webhook`
4. Condition: `In Tickets → if Status → is → Open`
5. Action: **Trigger Webhook**

```
Request Type:  POST
URL:           https://spritle-backend-fpp4.onrender.com/webhook/freshdesk
Encoding:      JSON
Content:       Advanced
```

Payload:

```json
{
  "event": "ticket_created",
  "ticket_id": "{{ticket.id}}",
  "subject": "{{ticket.subject}}",
  "status": "{{ticket.status}}",
  "priority": "{{ticket.priority}}",
  "requester_name": "{{ticket.contact.name}}",
  "requester_email": "{{ticket.contact.email}}",
  "created_at": "{{ticket.created_at}}"
}
```

6. Click **Save and enable**

### Ticket Update Rule

1. Click **Ticket Updates** tab → **Create from Scratch**
2. Rule Name: `Spritle Portal Webhook Updates`
3. Event: **Status is changed**
4. Action: **Trigger Webhook** with same URL

Payload:

```json
{
  "event": "ticket_updated",
  "ticket_id": "{{ticket.id}}",
  "subject": "{{ticket.subject}}",
  "status": "{{ticket.status}}",
  "priority": "{{ticket.priority}}",
  "requester_name": "{{ticket.contact.name}}",
  "requester_email": "{{ticket.contact.email}}",
  "updated_at": "{{ticket.updated_at}}"
}
```

5. Click **Save and enable**

---

## 🚀 Deployment (Render)

1. Push code to GitHub
2. Go to **https://render.com** → **New Web Service**
3. Connect your GitHub repo
4. Fill in:

```
Build Command: npm install && npm run build
Start Command: npm run start:prod
```

5. Add all environment variables (see `.env.sample`)
6. Update `HUBSPOT_REDIRECT_URI` to your Vercel frontend URL
7. Click **Deploy**

---

## 📝 Scripts

```bash
npm run start:dev     # Development with hot reload
npm run build         # Build for production
npm run start:prod    # Start production build
npm run lint          # Lint code
```