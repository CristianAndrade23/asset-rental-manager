# Backlog — Asset Rental Manager (P1)

Domain: a company that rents out equipment (machines, generators, scaffolding…) needs to know
which assets it owns, where each one is, and how much it earns.

## Domain model

| Entity | Main fields | Rules |
|---|---|---|
| **Asset** | code (unique), name, category, serial number, daily rate, status, acquisition date | Starts `AVAILABLE`. `RENTED` only through a contract. `RETIRED` is final. A rented asset cannot be deleted. |
| **Customer** | name, document (CPF/CNPJ), email, phone, address | Document is unique and validated. A customer with an open contract cannot be deleted. |
| **Rental contract** | number, customer, items (asset + daily rate), start date, expected return, actual return, status | Opening a contract marks assets as `RENTED`; closing it computes the total and releases the assets. Daily rate is copied to the item (price history). |
| **Maintenance** | asset, type (preventive/corrective), opened at, closed at, cost, notes | Opening puts the asset in `MAINTENANCE`; closing releases it. Not allowed while rented. |

## Milestones

### M1 — Assets ✅ (current slice)
- [x] REST CRUD + status change (`/api/assets`), Problem Details errors, OpenAPI
- [x] Flyway migration, optimistic locking (`@Version`)
- [x] Domain unit tests + API integration tests with Testcontainers
- [x] Angular list page: signal store, debounced search, filters, pagination, create/edit form
- [ ] Sync filters with the URL query params (`effect` + router)

### M2 — Customers
- [ ] Customer CRUD with CPF/CNPJ validation (backend + frontend)
- [ ] Reusable form field components (`input()` / `model()`)

### M3 — Rental contracts
- [ ] Open contract with multiple assets (transactional, locks assets)
- [ ] Return assets and compute the amount due (daily rate × days, late fee)
- [ ] Contract list and detail screens

### M4 — Maintenance
- [ ] Open/close maintenance orders and asset history timeline

### M5 — Dashboard & delivery
- [ ] Occupancy rate, revenue per month, assets per status (`computed` heavy screen)
- [ ] Seed data for the demo
- [ ] Deploy (API + DB + frontend) and demo link in the README
- [ ] README with screenshots/GIF and architecture diagram
