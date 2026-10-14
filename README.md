# Asset Rental Manager

> 🇧🇷 [Versão em português abaixo](#-português)

Full-stack application to manage an equipment rental business: assets, customers, rental contracts
and maintenance. It is the first project of a portfolio track focused on **modern Angular (Signals)**
backed by a **Spring Boot** API.

## Tech stack

| Layer | Technologies |
|---|---|
| Backend | Java 25, Spring Boot 4.1, Spring Data JPA, Bean Validation, Flyway, PostgreSQL 18, springdoc-openapi |
| Frontend | Angular 22 (standalone, **zoneless**, OnPush), Signals, Reactive Forms, Vitest |
| Tests | JUnit 5, Testcontainers, MockMvc, Angular TestBed + HttpTestingController |
| Ops | Docker Compose, GitHub Actions |

## Highlights

- **Signals for state, RxJS for flow.** The list screen keeps filters and results in signals
  (`signal`, `computed`), while RxJS handles debounce and cancels stale requests (`switchMap`),
  bridged with `toObservable` / `toSignal`. See [`asset.store.ts`](frontend/src/app/features/assets/asset.store.ts).
- **Rich domain model.** Status transitions live in the `Asset` entity, not in controllers.
- **Consistent errors.** Every error follows RFC 9457 *Problem Details*, with per-field validation messages.
- **Real database in tests.** Integration tests run against PostgreSQL in a container.

## Running locally

Requirements: Java 25, Node 24+, Docker.

```bash
# 1. database
docker compose up -d db

# 2. API → http://localhost:8080  (Swagger UI: /swagger-ui.html)
cd backend && ./mvnw spring-boot:run

# 3. frontend → http://localhost:4200
cd frontend && npm install && npm start
```

Or everything in containers: `docker compose --profile full up --build` → http://localhost:4200

### Tests

```bash
cd backend && ./mvnw verify            # needs Docker running
cd frontend && npx ng test --watch=false
```

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/assets?status=&search=&page=&size=` | Paginated search |
| GET | `/api/assets/{id}` | Asset details |
| POST | `/api/assets` | Create asset |
| PUT | `/api/assets/{id}` | Update details |
| PATCH | `/api/assets/{id}/status` | Move to/from maintenance or retire |
| DELETE | `/api/assets/{id}` | Delete (not allowed while rented) |

## Roadmap

See [docs/BACKLOG.md](docs/BACKLOG.md).

---

## 🇧🇷 Português

Aplicação full-stack para gestão de uma locadora de equipamentos: ativos, clientes, contratos de
locação e manutenções. É o primeiro projeto de uma trilha de portfólio focada em **Angular moderno
(Signals)** com uma API **Spring Boot**.

**Destaques:** estado de tela com Signals e fluxo assíncrono com RxJS; regras de negócio no modelo de
domínio; erros padronizados (Problem Details); testes de integração com PostgreSQL real via
Testcontainers; CI no GitHub Actions.

**Como rodar:** veja a seção [Running locally](#running-locally) acima.
