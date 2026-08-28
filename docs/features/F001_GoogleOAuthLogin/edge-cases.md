---
status: draft
authored_by: takumi
created: 2026-08-28
lang: en
---

| Scenario | What Happens | User-Facing Message |
|----------|--------------|-----------------------|
| Non-`@sun-asterisk.com` Google account signs in | Server rejects immediately after the OAuth code exchange and signs the session back out | "Đăng nhập không thành công. Vui lòng thử lại." |
| Visitor cancels the Google consent screen or Google returns an OAuth error | Callback receives no usable code; visitor is returned to the Login screen with the same generic error | "Đăng nhập không thành công. Vui lòng thử lại." |
| OAuth code exchange fails (expired/invalid flow-state — e.g. the sign-in action was called from a Server Component instead of a Server Action, so the verifier cookie never wrote) | Callback route redirects back to the Login screen with an error | "Đăng nhập không thành công. Vui lòng thử lại." |
| Already-authenticated Sunner opens the Login screen directly | Immediate redirect to the Homepage; the login form never renders | "None — silent redirect" |
| Unauthenticated visitor requests a private screen directly | Redirect to the Login screen; original destination preserved and restored after a successful sign-in | "None — silent redirect" (no copy for this message exists in the raw MoMorph spec; TBD (draft) if a banner is wanted, see Gaps for Clarification) |
| Local dev redirect-origin mismatch (`supabase/config.toml:149`'s `additional_redirect_urls` lists `https://127.0.0.1:3000` while the dev server is `http://localhost:3000`) | Supabase rejects the redirect outright if the app ever resolves its origin to the mismatched entry; visitor never reaches the callback | "Đăng nhập không thành công. Vui lòng thử lại." |
