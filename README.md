# VenueVista — EventPro Ticketing & Venue Management

Event ticketing and venue management with seating charts, ticket sales and sales analytics.
**Stack:** Java 17 · Spring Boot 3 (Security + JWT, JPA) · Angular 17 (standalone, signals) · Oracle DB

## Features
| Area | What it does |
|---|---|
| Auth & roles | Register / sign in (JWT). Roles: ADMIN, ORGANIZER, CUSTOMER with guarded routes and API rules |
| Discover events | Search by title/venue/city, category filter, seats-left meter, sold-out / cancelled states |
| Seating chart | Interactive seat map per event, tiered pricing (Standard / Premium / VIP), aisle gap, keyboard + screen-reader labels |
| Ticket sales | Pick up to 8 seats, atomic checkout with row-level locking (no double selling), booking code |
| My tickets | Ticket-stub view with tier-coloured seats and barcode-style code |
| Venue management | Define rows × seats per venue with live seating preview; remove unused venues |
| Event management | Create events (seats auto-generated from venue layout and priced by tier), cancel events |
| Sales analytics | Revenue, seat fill %, average order, 14-day revenue trend, tier mix donut, top events |

## 1. Database (Oracle or local H2)
For Oracle, create a local environment file from the example and set the database account and a private JWT signing secret:
```bash
cp .env.example .env
```
Edit `.env` with your own values. It is ignored by Git. The backend loads it when started from the project root or `backend` directory. Keep the same Oracle username and password you enter in the setup script.

```sql
-- as SYSTEM, in your PDB (e.g. XEPDB1)  → database/01_create_user.sql
-- The script securely prompts for the new account password.
```
Tables are created automatically by Hibernate on first run. Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` in `.env` for your Oracle installation.

For a local demo without Oracle, use the `local` Spring profile. It starts an in-memory H2 database in Oracle compatibility mode and reseeds demo data each time the backend starts.

## 2. Backend
```bash
cd backend && mvn spring-boot:run      # Oracle, http://localhost:8081
# or, without Oracle:
mvn spring-boot:run -Dspring-boot.run.profiles=local
```
On first start demo data is seeded (3 venues, 6 events, 2 weeks of sales).

## 3. Frontend
```bash
cd frontend && npm install && npm start   # http://localhost:4200
```

## Demo accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@venuevista.com | Admin@123 |
| Organiser | organizer@venuevista.com | Organizer@123 |
| Customer | customer@venuevista.com | Customer@123 |

## API overview
`POST /api/auth/register|login` · `GET /api/events?q=&category=` · `GET /api/events/{id}/seats` · `POST /api/events` · `DELETE /api/events/{id}` (cancel) ·
`GET|POST /api/venues` · `DELETE /api/venues/{id}` · `POST /api/orders` · `GET /api/orders/mine` · `GET /api/analytics/summary`

## Before production
Set a unique `JWT_SECRET`, DB credentials, and CORS origin in `.env`; set `ddl-auto: validate` with managed migrations; add payment-gateway integration at the order step. Never commit `.env` or paste real credentials into source files.
