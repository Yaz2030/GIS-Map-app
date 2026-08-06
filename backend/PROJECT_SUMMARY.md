# Project Summary — Email Verification, Admin Backend, Final Cleanup

This document summarizes three phases of work completed on `mapbackend`: email verification, admin backend completion, and a final response/error/CORS review. It's meant as a reference to come back to — it does not re-run or re-verify anything; all testing already happened during implementation.

---

## Phase 1 — Email Verification

**Model (`model/User.java`)** — new fields:
- `emailVerified` (boolean, defaults false)
- `emailVerificationToken` (hidden from all JSON responses via `@JsonProperty(WRITE_ONLY)`)
- `emailVerificationTokenExpiry`
- `lastVerificationEmailSentAt`
- `lastPasswordResetEmailSentAt`

**New/changed backend logic (`service/UserService.java`):**
- `registerUser` now generates a 24-hour verification token, saves it, and emails a verification link (reusing `MailService`, same mechanism as password reset). It also force-sets `emailVerified=false` regardless of what the client sent, closing a mass-assignment gap.
- `loginUser` blocks unverified accounts with a 403 (`EmailNotVerifiedException`), checked **after** the password match so a wrong-password guess can't be used to probe verification status.
- New `verifyEmail(token)` — validates and consumes the token, sets `emailVerified=true`. Reused `InvalidCredentialsException` (401) for invalid/expired tokens, matching the existing reset-password pattern.
- New `resendVerificationEmail(email)` and the existing `forgotPassword(email)` both got a **silent 1-minute throttle**: if called again within 60 seconds, no new email is sent, but the response is identical either way. This was a deliberate choice — a distinct "too many requests" error would leak whether an account exists/its verification status through response differences, undermining the enumeration protection `forgot-password` already had.

**New endpoints (`controller/UserController.java`):**
- `POST /api/users/verify-email` — `{ "token" }`
- `POST /api/users/resend-verification` — `{ "email" }`
- Both added to `SecurityConfig`'s `permitAll` list (unauthenticated by design, since an unverified user has no token to authenticate with).

**Migration:** the one pre-existing account (the admin, `Yaz.alhmmami@gmail.com`) was migrated to `emailVerified=true` via a one-off disposable runner so the new login block didn't lock it out. No other data was touched.

---

## Phase 2 — Admin Backend

**`service/UserService.java`:**
- `getAllUsers()` (previously returned an unpaginated `List`) replaced with `getAllUsers(Pageable pageable)` returning `Page<UserProfileResponse>` — standard Spring Data pagination, no new dependency (already transitively available via `spring-boot-starter-data-mongodb`).
- New `deleteUserByAdmin(targetUserId, requestingAdminId)` — deletes a user and their locations, but throws `UnauthorizedAccessException` (403) if the admin tries to delete their own account.

**`controller/AdminController.java`:**
- `GET /api/admin/users` — now accepts `?page=&size=&sort=`
- `GET /api/admin/users/{id}` — 200 with profile, or 404
- `DELETE /api/admin/users/{id}` — 200, 404 if not found, 403 on self-delete

No role-change endpoint was added (explicitly out of scope — single fixed admin account, no near-term need). All three routes are already covered by the existing `/api/admin/**` → `ROLE_ADMIN` rule in `SecurityConfig`; no security config changes were needed for this phase.

---

## Phase 3 — Response, Error, and CORS Review

**Stopped leaking `User` objects:**
- New `dto/RegisterRequest.java` and `dto/LoginRequest.java` replace binding the raw `User` entity as a request body. `RegisterRequest` carries the same `@StrongPassword` rule `User.password` already had; `LoginRequest.password` is `@NotBlank` only (per the earlier, explicit decision to never apply strength rules to the login password).
- `POST /api/users/register` now returns `UserProfileResponse` instead of the full `User` (this also closes the mass-assignment door completely — the request DTO only exposes `name`/`email`/`password`).
- `PUT /api/users/me/password` now returns a plain success string instead of the full `User` object (which previously would have leaked `resetPasswordToken`, `emailVerified`, timestamps, etc. — everything except `password`/`emailVerificationToken`, which were already write-only).

**Unified error shape (`exception/GlobalExceptionHandler.java`, new `exception/ErrorResponse.java`):**
- Every error response — validation failures, all domain exceptions, and now also Spring Security's own 401/403 — returns the same JSON shape:
  ```json
  { "status": 401, "message": "...", "errors": null }
  ```
  `errors` is populated only for field-validation failures (`{"field": "message"}`), otherwise `null`, but the key is always present.
- `IllegalArgumentException` (raised for "Passwords do not match" in both change-password and reset-password) is now caught and mapped to 400 — previously unhandled, meaning it fell through to a generic 500.
- `SecurityConfig`'s `authenticationEntryPoint` (401, no token) and a newly added `accessDeniedHandler` (403, wrong role) now emit the same JSON shape by hand-writing the literal string (no new dependency — Jackson's `ObjectMapper` isn't available at compile scope in this project's `spring-boot-starter-webmvc` setup, and the content here is fully static so no escaping risk).

**CORS:** there was **no CORS configuration at all** before this phase — not "insecurely open," but literally absent, meaning a browser-based frontend could not have called this API cross-origin in the first place. Added a `CorsConfigurationSource` in `SecurityConfig`, scoped to `app.frontend.url` (currently `http://localhost:5173`) via the same property already used for verification/reset-password links. **To allow the real frontend later, just change `app.frontend.url`** (or set `APP_FRONTEND_URL`/`SPRING_...` env var in prod) — nothing else needs editing, since CORS and both email links all read from that one property.

**HTTP status codes** — reviewed for consistency, left as-is where already coherent:
| Status | Used for |
|---|---|
| 400 | Bad input: validation failures, duplicate email, password mismatch |
| 401 | Credential failures: wrong login password, wrong current-password, invalid/expired reset or verification token, no token at all |
| 403 | Authorization/state denials: wrong role, ownership violation, admin self-delete, unverified email |
| 404 | Resource not found: location, admin get/delete-by-id |

The "invalid/expired token → 401" choice is pre-existing (was already the case for password-reset tokens before any of this work started); it was kept for consistency rather than changed to 400/410, since it wasn't broken, just not textbook-RFC-pure.

---

## Explicitly out of scope / left alone

- `SecurityConfig` still permits `/api/users/test-email`, a route that doesn't exist in any controller — harmless dead config, pre-existing, not touched.
- `UnauthorizedAccessException` correctly maps to 403 but its name reads like a 401 — cosmetic only; renaming would touch existing call sites (`LocationService`, etc.) for no functional benefit.
- A CORS-disallowed origin gets Spring's own built-in `"Invalid CORS request"` plain-text 403 (from the CORS filter, before any of this project's error handling runs), not the unified JSON shape. This is Spring Security internal behavior; browsers act on response headers here, not body content, so it was left as-is.
- No refresh tokens, Swagger, advanced logging, or i18n were added — explicitly deferred per the original instructions.

## Language note

The task described the project's existing error messages as Arabic; on inspection every existing message (`GlobalExceptionHandler`, `User`, `ChangePasswordRequest`, etc.) was actually already in English. All new messages added across the three phases were kept in English to match the actual codebase rather than introduce a mixed-language API.

---

## Postman test checklist

Base URL: whatever host/port you run the app on.

**Auth / registration**
1. `POST /api/users/register` — `{"name","email","password"}` → 200, body has `id/name/email/role` only
2. Register the same email again → 400 "Email Already Exists"
3. `POST /api/users/login` before verifying → 403 "Please verify your email before logging in"
4. `POST /api/users/verify-email` — `{"token"}` from the emailed link → 200
5. Re-verify with the same (consumed) token → 401 "Invalid verification token"
6. `POST /api/users/login` after verifying → 200, JWT string
7. `POST /api/users/resend-verification` — `{"email"}` twice within a minute → identical generic message both times
8. `POST /api/users/forgot-password` — `{"email"}` twice within a minute → identical generic message both times; only the first actually sends

**Self-service** (`Authorization: Bearer <token>`)
9. `GET /api/users/me`
10. `PUT /api/users/me/name`
11. `PUT /api/users/me/password` with mismatched `confirmPassword` → 400 unified shape
12. `PUT /api/users/me/password` with matching passwords → 200 "Password changed successfully"
13. `DELETE /api/users/me` — `{"password"}`

**Admin** (admin's token)
14. `GET /api/admin/users?page=0&size=5` → paginated shape
15. `GET /api/admin/users/{id}` → 200; bogus id → 404
16. `DELETE /api/admin/users/{id}` on another user → 200; repeat → 404
17. `DELETE /api/admin/users/{ownAdminId}` → 403 "You cannot delete your own account"
18. Same admin routes with a regular `USER` token → 403 unified shape

**Cross-cutting**
19. Any protected endpoint with no token → 401 `{"status":401,"message":"Unauthorized","errors":null}`
20. A request with `Origin: http://localhost:5173` succeeds; a different origin is blocked by the browser's CORS enforcement (server responds with `403 Invalid CORS request` if hit directly, e.g. via curl).
