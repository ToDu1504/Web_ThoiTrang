# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

FashionShop — e-commerce website (Vietnamese fashion shop). Spring Boot REST API backend + React SPA frontend, decided against the originally-planned Thymeleaf server-side rendering (see README.md section 9 for why). Full design/roadmap lives in `README.md`. Repo layout: `backend/` (Spring Boot, Maven) and `frontend/` (Vite/React) are separate sibling folders under the repo root.

## Commands

### Backend (Spring Boot, `backend/` directory)

```bash
cd backend
./mvnw.cmd compile              # compile
./mvnw.cmd spring-boot:run       # run dev server on :8080
./mvnw.cmd test                  # run tests
./mvnw.cmd clean compile         # clean rebuild — use when compile errors look wrong/stale (Maven's incremental compiler is unreliable in this project, see Gotchas)
```

VNPay sandbox credentials are read from env vars (not committed): `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`. Without them, payment URL generation still works but signatures won't validate against a real VNPay account.

### Frontend (`frontend/` directory)

```bash
cd frontend
npm run dev       # dev server — MUST run on :5174 (backend's vnpay.return-url is hardcoded to it): npm run dev -- --port 5174 --strictPort
npm run build     # tsc -b && vite build
npm run lint       # oxlint
npx tsc -b --noEmit  # type-check only
```

### Local infrastructure (Windows, via Laragon)

MySQL and Redis are not services — start them manually before running the backend:

```bash
# MySQL (datadir/port come from my.ini; default Laragon: root user, no password)
"C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe" --defaults-file="C:\laragon\bin\mysql\mysql-8.4.3-winx64\my.ini"

# Redis
"C:\laragon\bin\redis\redis-x64-5.0.14.1\redis-server.exe" "C:\laragon\bin\redis\redis-x64-5.0.14.1\redis.windows.conf"
```

Database `fashionshop_db` must exist (`CREATE DATABASE fashionshop_db CHARACTER SET utf8mb4`); Hibernate `ddl-auto=update` handles schema from there. Roles (`ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_CUSTOMER`) are auto-seeded on startup by `DataSeeder`.

## Architecture

### Backend layering

Standard layered Spring Boot: `controller` (REST, JSON via `ApiResponse<T>` wrapper) → `service`/`service.impl` → `repository` (Spring Data JPA) → `entity`. `dto/request` and `dto/response` are separate from entities; controllers never expose entities directly. Admin-only endpoints live under `controller/admin` and are gated at the security-filter level by path (`/api/admin/**`), with a few individually more-restricted actions (e.g. user role assignment) gated additionally by `@PreAuthorize("hasRole('ADMIN')")` — `@EnableMethodSecurity` is on for this.

Auth is stateless JWT (access + refresh token, `security/JwtTokenProvider` + `security/JwtAuthFilter`). The JWT principal is a custom `UserPrincipal(id, email)`, not just a username string, so `SecurityUtils.getCurrentUser()`/`requireCurrentUserId()` can resolve the current user id without a DB round-trip.

The cart supports both guests and logged-in users through the same endpoints: guests are identified by an `X-Session-Id` header (client-generated UUID), members by the JWT. `CartServiceImpl.resolveOrCreateCart` picks whichever is present, preferring the authenticated user.

Checkout (`OrderServiceImpl.checkout`) is the one place with real concurrency concerns: it takes a pessimistic write lock per variant (`ProductVariantRepository.findByIdForUpdate`) before decrementing stock, and does the same for voucher redemption (`VoucherRepository.findByCodeForUpdate` + `usedCount` bump) — both inside the same `@Transactional` method, so a race between two checkouts can't oversell stock or over-redeem a limited voucher.

VNPay integration (`service/VnPayService` + `impl/VnPayServiceImpl`) builds/signs the payment URL and independently re-verifies signatures on the return/IPN callbacks (`controller/PaymentController`) — treat the IPN endpoint as the source of truth for `payment_status`, the return endpoint is user-facing only.

### Redis caching — read this before touching `RedisConfig` or anything cache-related

This project pins to a very new Spring Boot (4.1.0 / Spring Framework 7.0.8) where **Jackson 3 lives under the `tools.jackson.*` package**, not the classic `com.fasterxml.jackson.*`. The old namespace is present on the classpath *only* as a runtime-scoped transitive dependency of `jjwt-jackson`, so code that `import`s `com.fasterxml.jackson.databind.*` may compile via Maven's incremental compiler (unreliable — always trust `mvn clean compile`) but fails to link at actual runtime. If you need Jackson types in your own code, use `tools.jackson.databind.*`, and for Redis serialization use `GenericJacksonJsonRedisSerializer` (not the deprecated `GenericJackson2JsonRedisSerializer`, which is the Jackson-2-era class).

`@Configuration` classes with `@Bean` methods that both proxy (default `proxyBeanMethods = true`) and reference certain classes over-eagerly hit a separate, still-not-fully-understood classloading failure in this environment — the workaround already applied is `@Configuration(proxyBeanMethods = false)` on `SecurityConfig` and `RedisConfig`. Keep new `@Configuration` classes with cross-bean-method calls on that pattern (inject the dependency as a `@Bean` method parameter instead of calling another `@Bean` method directly) unless you've confirmed the plain form works.

Redis persists to `dump.rdb` in the repo root (`CONFIG GET dir` → project root) and reloads it on every `redis-server` restart. If you ever change the cache value serialization format (entity/DTO shape, serializer config), old cached entries from before the change will fail to deserialize and every cached endpoint (`/api/categories`, `/api/brands`, `/api/products/{slug}`) will 500 until you `FLUSHALL`. `dump.rdb` is gitignored but persists locally across sessions — if product/category/brand endpoints start throwing `SerializationException` after a restart, flush Redis first before debugging anything else.

Caches: `categories`/`brands` (TTL 1h, evicted wholesale on any admin mutation), `products` keyed by slug (TTL 5m, evicted wholesale on any product/image mutation) — see `@Cacheable`/`@CacheEvict` in `CategoryServiceImpl`/`BrandServiceImpl`/`ProductServiceImpl`.

### Frontend

Vite + React 19 + TypeScript, TailwindCSS v4 (CSS-based config via `@tailwindcss/vite`, no `tailwind.config.js`). `src/types/` mirrors backend DTOs by hand — when a backend request/response DTO changes shape, update the matching type here too, nothing enforces this automatically.

All API calls go through the single `src/api/client.ts` Axios instance: its request interceptor attaches the JWT if logged in, otherwise attaches `X-Session-Id` for cart requests; its response interceptor transparently refreshes the access token on a 401 and retries the original request once, logging out and redirecting to `/login` only if the refresh itself fails. Don't create a second axios instance — new API modules under `src/api/` should import and reuse this client.

Routing (`src/App.tsx`) has two protected trees: `ProtectedRoute` (any authenticated user — checkout, orders, wishlist) and `ProtectedRoute requireAnyRole={['ROLE_ADMIN','ROLE_STAFF']}` wrapping the whole `/admin/*` tree. The admin user-role-assignment UI additionally checks for `ROLE_ADMIN` client-side (`Users.tsx`) to match the backend's stricter `@PreAuthorize`, but the backend is the actual enforcement point.

VNPay's browser return redirect goes to the frontend (`vnpay.return-url` backend property → `http://localhost:5174/payment/vnpay-return`), not the backend directly — `PaymentResultPage` forwards the exact query string it receives to `GET /api/payments/vnpay/return` to trigger verification and display the result. This is why the frontend dev server must run on the fixed port 5174.