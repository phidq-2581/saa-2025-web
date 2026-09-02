---
status: implemented
authored_by: takumi
created: 2026-08-31
promoted: 2026-09-02
lang: en
---

| Scenario | What Happens | User-Facing Message | Source |
|---|---|---|---|
| Submit with recipient empty | Red border + inline error on the recipient field; form not submitted | "Không được để trống" (`compose.recipient.requiredError`) | TC ID-7, ID-50; design-gap copy, see `## Copy gaps` |
| Submit to yourself | Client-side rejects before the network call; server independently rejects the same way | "Không thể gửi Kudos cho chính mình." (`compose.selfKudosError`) | Group-3 checkpoint decision, 2026-09-02 |
| Submit with content empty | Red border + inline error under the editor; form not submitted | "Không được để trống" | TC ID-11, ID-51 |
| Submit with 0 hashtags | Red border + inline error on hashtag field; form not submitted | "Không được để trống" | TC ID-14, ID-52 |
| Submit with all required fields empty | All three errors show at once; form not submitted | per-field messages above | TC ID-56 |
| Attempt to add a 6th hashtag | Blocked; row disabled + inline notice | "Tối đa 5 hashtag" | TC ID-17, ID-53 |
| Attempt to add a 6th image | "+ Image" button already hidden at 5; no picker opens | — | TC ID-20, ID-54 |
| Upload a non-image file (.pdf, .mp4, .txt) | File rejected before upload starts | "Định dạng file không hợp lệ" | TC ID-23, ID-24, ID-55 |
| Recipient search with only special characters (`@ # $`) | Autocomplete falls back to the full recipient list rather than a dead-end empty dropdown (small pool, "browse everyone" recovery) | — | TC ID-9 |
| Recipient search with leading/trailing spaces | Input trimmed before matching | — | TC ID-10 |
| Add link sub-dialog: Text field blank or whitespace-only | Save blocked, inline error | Required-field error (`compose.addlink.textRequiredError`) | addlink-box TC `3912184e`, `adb699ca` |
| Add link sub-dialog: Text > 100 chars | Save blocked, inline error | Max-length error (same key as required — no distinct copy) | addlink-box TC `7d85997d` |
| Add link sub-dialog: Link blank, < 5 chars, or not http/https | Save blocked, inline error | `compose.addlink.linkInvalidError` | addlink-box TC `97dc4028`, `db2ca333`, `aad5791a` |
| Add link sub-dialog: Esc / Hủy | Closes without saving, editor selection unchanged | — | addlink-box TC `48467d34` |
| Toggle anonymous on then off | Display-name field appears then disappears; its value is discarded on hide (`AnonymousToggle` fires `onDisplayNameChange("")` on uncheck) | — | TC ID-41–ID-44 |
| Check anonymous, submit with no display name | Blocked server-side (`missing-anonymous-display-name` draft-validation reason) | (surfaces as the generic submit error — no dedicated inline copy) | `validate-draft.ts` |
| Cancel with data already entered | Modal closes, nothing is persisted | — | TC ID-45 |
| Network/storage failure during image upload | Upload stops at the first failure, names its index, never calls `createKudos`; a kudos the user cancels never orphans a partial set of objects | "Tải ảnh lên thất bại. Vui lòng thử lại." (`compose.uploadError`) | `submit-kudos.ts` |
| Unauthenticated visitor tries to reach the modal | Redirected to `/login` (same guard as every other private route, per F001 BR-002) | — | TC ID-1 |
| Content payload outside the TipTap allow-list (hostile client, direct API call) | Server rejects with `invalid-draft` before any DB write, regardless of what the client-side editor would ever produce | — | `validate-content.ts` (`BR-008`) |
| Image path carrying a foreign sender prefix (hostile client) | Server rejects with `invalid-image-path` — verified against the caller's own `{sender}/{kudos}/` storage scope | — | `storage-path.ts` |

## Copy gaps

Three strings in this feature have no design source (no `specs.csv` row, no verbatim
`get_node().character` match). Per the C2.4–C2.6 precedent from round 1, each ships as a
minimal Vietnamese copy decision rather than an invented English string, logged here and in
`docs/test-traceability.md` § Copy gaps (round 2):

1. **Recipient-required error** — `compose.recipient.requiredError`: "Không được để trống",
   reused from the content/hashtag required-field copy for consistency (inferred from the same
   form's other required-field rows, TC ID-11/ID-51/ID-52 — not invented from nothing).
2. **Anonymous display-name field's own validation** — required when `is_anonymous = true`
   (`missing-anonymous-display-name`); no max-length rule exists in spec or code.
3. **Addlink text/link required-field copy** — reuses the same `"Không được để trống"` /
   `linkInvalidError` pattern; no distinct max-length message exists for the 100-char text cap
   (the same required-field string covers both cases in the shipped catalogue).
