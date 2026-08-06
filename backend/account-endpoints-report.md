# Account Endpoints Report — Update Name, Change Password, Change Email, Delete Account

This is a read-only audit of the current state of four self-service account operations, based on a direct read of `UserController.java`, `UserService.java`, and the relevant DTOs. No code was created or modified as part of this report.

---

## 1. Update username — EXISTS

| | |
|---|---|
| Endpoint | `PUT /api/users/me/name` |
| Method | `PUT` (not `PATCH`) |
| Auth | Requires a valid JWT; scoped to the caller via `authentication.getName()` — cannot target another user's id |
| Request body | `UpdateNameRequest { name: string }` |
| Validation | `name` — `@NotBlank` only. No length limit, no character restriction |
| Behavior | Loads the user by id, sets the new name, saves, returns the updated `UserProfileResponse` (id/name/email/role) |
| On missing user | `404 Not Found` (checked in `UserController`, not an exception) |

## 2. Change password — EXISTS, old password IS verified

| | |
|---|---|
| Endpoint | `PUT /api/users/me/password` |
| Method | `PUT` |
| Auth | Requires a valid JWT; scoped to caller |
| Request body | `ChangePasswordRequest { currentPassword, newPassword, confirmPassword }` |
| Validation | `currentPassword` — `@NotBlank` only (no strength check, intentionally).<br>`newPassword` — `@NotBlank` + `@StrongPassword` (≥8 chars, ≥1 uppercase, ≥1 lowercase, ≥1 special char from `@ # $ % ! & *`).<br>`confirmPassword` — `@NotBlank` only. |
| Old-password check | Yes — `BCryptPasswordEncoder.matches(currentPassword, storedHash)`. If it doesn't match: throws `InvalidCredentialsException("error.currentPassword.incorrect")` → **401** |
| Match check | If `newPassword != confirmPassword`: throws `IllegalArgumentException("error.password.mismatch")` → **400** |
| On missing user | `404 Not Found` |

## 3. Change email — DOES NOT EXIST

No endpoint, no DTO, no service method for this exists anywhere in the codebase. Confirmed by grepping every `setEmail(...)` call in `src/`: the only call sites are (a) during **registration**, when building a brand-new `User` object, and (b) inside **read-only response mapping** (copying the existing email into `UserProfileResponse`). There is no code path where an authenticated user can submit a new email and have it written to their existing account.

Consequently, the follow-up question of whether changing the email re-triggers verification or updates it directly without re-verifying does not apply — there is no such flow to describe either way. This is a plain statement of absence, not a proposal for how it should work.

## 4. Delete account (self-delete) — EXISTS, password IS required

| | |
|---|---|
| Endpoint | `DELETE /api/users/me` |
| Method | `DELETE` |
| Auth | Requires a valid JWT; scoped to caller via `authentication.getName()` — this is the self-delete path, distinct from the separate admin-delete endpoint (`DELETE /api/admin/users/{id}`, which takes a path variable and has a self-delete *guard* instead of a password check) |
| Request body | `DeleteAccountRequest { password: string }` |
| Validation | `password` — `@NotBlank` only |
| Password check | Yes — `BCryptPasswordEncoder.matches(password, storedHash)`. If it doesn't match: throws `InvalidCredentialsException("error.account.incorrectPassword")` → **401** |
| Side effect | Also deletes all of that user's `Location` documents (`locationRepository.deleteByUserId`) before deleting the `User` record itself |
| On missing user | `404 Not Found` |
