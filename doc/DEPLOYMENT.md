# Deploying the e-commerce app for free

Three pieces, each on a free tier:

| Piece | Free host (pick one) | What's in the repo for it |
|---|---|---|
| MySQL database | Aiven for MySQL (free plan), TiDB Cloud Serverless (MySQL-compatible) | nothing extra; the app connects with `DB_URL` |
| Spring Boot backend | Render (Web Service, Docker) — or Koyeb / Railway | `Dockerfile`, `.dockerignore`, `application-prod.properties` |
| React frontend | Vercel or Netlify | `frontend/vercel.json`, `frontend/public/_redirects` |

Free tiers change often; check each provider's current limits before you start.

---

## 1. Database

1. Create a free MySQL service and note its host, port, user and password.
2. The app does **not** auto-create tables (`spring.jpa.hibernate.ddl-auto` is not set), so copy the schema from your local database:

   ```bash
   mysqldump -u root -p --no-data ecommerce_db > schema.sql
   mysql -h <host> -P <port> -u <user> -p <database> < schema.sql
   ```

   Roles (`ROLE_USER`, `ROLE_SELLER`, `ROLE_ADMIN`) are inserted automatically when the backend starts.
3. Your JDBC URL looks like `jdbc:mysql://<host>:<port>/<database>?sslMode=REQUIRED`.

## 2. Backend on Render

1. Push the repo to GitHub.
2. Render → **New → Web Service** → pick the repo. Render detects the `Dockerfile`.
3. Add these **environment variables**:

   | Variable | Value |
   |---|---|
   | `DB_URL` | the JDBC URL from step 1 |
   | `DB_USERNAME` / `DB_PASSWORD` | database credentials |
   | `JWT_SECRET` | a new random Base64 string, at least 64 bytes (e.g. `openssl rand -base64 64`) |
   | `CORS_ALLOWED_ORIGINS` | your frontend URL, e.g. `https://elyra.vercel.app` (comma-separate several) |
   | `STRIPE_SECRET_KEY` | `sk_test_...` from the Stripe dashboard (optional) |
   | `STRIPE_CURRENCY` | `inr` (default) |

   Render sets `PORT` itself; `server.port=${PORT:5000}` picks it up. The Dockerfile starts the app with the `prod` profile.
4. After deploy, check `https://<your-service>.onrender.com/api/public/categories` returns JSON.

**Why the `prod` profile matters:** the frontend (`*.vercel.app`) and backend (`*.onrender.com`) are on different sites. Browsers only send a cookie cross-site when it is `Secure` and `SameSite=None`, so `application-prod.properties` sets exactly that. Without it, login appears to work but every later request is anonymous.

## 3. Frontend on Vercel

1. Vercel → **Add New → Project** → pick the repo, set **Root Directory** to `frontend`.
2. Framework preset: Vite (build `npm run build`, output `dist`).
3. Environment variables:

   | Variable | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://<your-service>.onrender.com/api` |
   | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (optional; hides card payment when empty) |

4. `vercel.json` rewrites every path to `index.html`, so refreshing `/seller/orders` doesn't 404. On Netlify, `public/_redirects` does the same.

## 4. Stripe (test mode)

1. Create a Stripe account and stay in **Test mode**. Keys are under *Developers → API keys*.
2. Put the secret key (`sk_test_...`) on the backend and the publishable key (`pk_test_...`) on the frontend. Never put the secret key in the frontend.
3. Pay with card `4242 4242 4242 4242`, any future expiry, any CVC.

How the payment is protected:

- The backend creates the PaymentIntent and computes the amount from the cart in the database (`POST /api/order/stripe-client-secret`).
- The browser confirms the card with Stripe.js and sends only the PaymentIntent id when placing the order.
- `OrderServiceImpl` asks Stripe for that PaymentIntent and checks: status `succeeded`, amount equals the cart total, it belongs to this user, and it hasn't already been used for another order.

## 5. Things to know on free tiers

- **Cold starts:** free Render services sleep after inactivity; the first request can take ~30–60 s.
- **Uploaded images are not persistent:** they're written to the container's `images/` folder, which is wiped on every redeploy/restart. For a real deployment move uploads to S3 or Cloudinary.
- **Secrets:** the property files have no real passwords; `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` and `STRIPE_SECRET_KEY` must come from environment variables. Keep it that way, since the repository is public.
- **First admin:** sign up normally, then grant the role once in the database:

  ```sql
  INSERT INTO user_role (user_id, role_id)
  SELECT u.user_id, r.role_id FROM users u, roles r
  WHERE u.username = 'your-username' AND r.role_name = 'ROLE_ADMIN';
  ```

  After that, admins grant seller/admin access from **Admin → Users**.

## Running everything locally

```bash
# backend (port 5000)
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql

# frontend (port 5173)
cd frontend
cp .env.example .env      # then fill in VITE_STRIPE_PUBLISHABLE_KEY if you have one
npm install
npm run dev
```

Set `STRIPE_SECRET_KEY` in the backend's environment to enable card payments locally.
