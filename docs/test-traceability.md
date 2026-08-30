# Test Traceability

Phase 07 creates this file with only the EN-copy-gap log below. The full
spec/test-case ↔ implementation traceability table is Phase 08's own
deliverable.

## EN copy gaps (Phase 07)

Per the EN copy rule (clarifications.md, phase-07 Requirements): every
`messages/en/*.json` key is either (a) already-English design copy, copied
through unchanged, (b) a genuine Vietnamese string with a MoMorph
`list_file_localizations` English translation, used verbatim, or (c) a
Vietnamese string with **no** confirmed English source, mirrored as
`[VN] <original Vietnamese text>` — never hand-translated.

**Tooling constraint this session:** the implementer session that authored
these catalogs had no MoMorph MCP tool available (`list_file_localizations`
was not in its exposed tool set). Only the 9 translations and 2 confirmed
absences the orchestrator had already queried and passed in the task prompt
were used as case (b)/known-absent; every other Vietnamese string below is
case (c) — not because MoMorph lacks a translation, but because this session
could not query it. Phase 08 (or any session with MCP access) should query
every path below via `list_file_localizations` before finalizing.

### Confirmed via MoMorph (used verbatim)

| Vietnamese | English | Used at |
|---|---|---|
| Bản quyền thuộc về Sun* © 2025 | Copyright © Sun* 2025 | `common.footer.copyright`, `login.footerCopyright` |
| Chi tiết | Details | `home.awards.detailLink`, `awards.kudos.detailLabel` |
| Địa điểm: | Venue: | `home.eventInfo.placeLabel` |
| Giá trị giải thưởng: | Prize value: | `awards.card.prizeLabel` |
| Hệ thống giải thưởng | Awards System | `home.awards.heading` |
| Phong trào ghi nhận | Recognition Movement | `home.kudos.label`, `awards.kudos.eyebrow` |
| Số lượng giải thưởng: | Number of awards: | `awards.card.quantityLabel` |
| Thời gian: | Time: | `home.eventInfo.timeLabel` |
| Tiêu chuẩn chung | General standards | `common.footer.generalStandards` |

### `messages/en/login.json` — 3 gaps

- `heroSubtitle` — confirmed absent from Figma EN text (orchestrator query)
- `heroTagline` — confirmed absent from Figma EN text (orchestrator query)
- `errorMessage` — not queried this session (tooling constraint)

### `messages/en/home.json` — 13 gaps

- `eventInfo.place`, `eventInfo.livestreamNote`
- `rootFurther.paragraph1`, `rootFurther.quoteTranslation`, `rootFurther.paragraph2`
- `awards.subDescription`
- `awards.cards.{top-talent,top-project,top-project-leader,best-manager,signature-2025-creator,mvp}.description` (6 keys)
- `kudos.description`

### `messages/en/awards.json` — 30 gaps

- `sectionTitle.heading`, `nav.ariaLabel`, `card.orConnector`
- `cardContent.*.description` (6 keys, one per award category)
- `cardContent.*.quantityUnit` (6 keys)
- `cardContent.*.prizes[].amount` (7 keys — `signature-2025-creator` has 2 prizes)
- `cardContent.*.prizes[].qualifier` (5 keys — `best-manager`/`mvp` have a single `null` qualifier each, not a gap)
- `kudos.description`
- `meta.title`, `meta.description`

### Body copy wiring — resolved in Phase 07b

All 13 body components read the catalogues via next-intl since Phase 07b
(2026-08-30). Each converts to `useTranslations` (they stay non-async Server
Components — see `docs/system-architecture.md` § Content scaffolds); unit
tests render through `src/test-utils/render-with-intl.tsx`'s `renderWithIntl()`
(real `NextIntlClientProvider` + the real catalogues); `e2e/locale-body-copy.spec.ts`
covers the Homepage and Award System routes end to end.

### Resolved by orchestrator MoMorph query (2026-08-28 23:40)
`list_file_localizations` returned EN entries for these keys; applied verbatim to `messages/en/*.json` (supersedes the gap lists above for these keys).

| Key | English (MoMorph) |
|---|---|
| `home.awards.cards.top-talent.description` | Honoring top individuals across all aspects |
| `home.awards.cards.top-project.description` | Honoring top projects across all aspects, especially those with outstanding revenue |
| `home.awards.cards.top-project-leader.description` | Honoring inspiring managers who lead innovative project breakthroughs |
| `home.awards.cards.best-manager.description` | Honoring managers with strong management skills leading their teams |
| `home.awards.cards.signature-2025-creator.description` | Honoring managers with strong management skills leading their teams |
| `home.awards.cards.mvp.description` | Honoring managers with strong management skills leading their teams |
| `awards.sectionTitle.heading` | SAA 2025 Award System |
| `awards.card.orConnector` | Or |
| `awards.cardContent.top-talent.description` | Top Talent Award recognizing individuals who excel comprehensively – those who constantly … |
| `awards.cardContent.top-talent.quantityUnit` | Individual |
| `awards.cardContent.top-talent.prizes[0].amount` | 7,000,000 VND |
| `awards.cardContent.top-talent.prizes[0].qualifier` | per prize |
| `awards.cardContent.top-project.description` | Top Project Award honoring excellent project teams with business results exceeding expecta… |
| `awards.cardContent.top-project.quantityUnit` | Team |
| `awards.cardContent.top-project.prizes[0].amount` | 15,000,000 VND |
| `awards.cardContent.top-project.prizes[0].qualifier` | per prize |
| `awards.cardContent.top-project-leader.description` | Top Project Leader Award honoring excellent project managers – those who possess strong ma… |
| `awards.cardContent.top-project-leader.quantityUnit` | Individual |
| `awards.cardContent.top-project-leader.prizes[0].amount` | 7,000,000 VND |
| `awards.cardContent.top-project-leader.prizes[0].qualifier` | per prize |
| `awards.cardContent.best-manager.description` | Best Manager Award honoring outstanding leaders who lead their teams to achieve results be… |
| `awards.cardContent.best-manager.quantityUnit` | Individual |
| `awards.cardContent.best-manager.prizes[0].amount` | 10,000,000 VND |
| `awards.cardContent.signature-2025-creator.quantityUnit` | Individual or Team |
| `awards.cardContent.signature-2025-creator.prizes[0].amount` | 5,000,000 VND |
| `awards.cardContent.signature-2025-creator.prizes[0].qualifier` | for individual award |
| `awards.cardContent.signature-2025-creator.prizes[1].amount` | 8,000,000 VND |
| `awards.cardContent.signature-2025-creator.prizes[1].qualifier` | for team award |
| `awards.cardContent.mvp.quantityUnit` | Individual |
| `awards.cardContent.mvp.prizes[0].amount` | 15,000,000 VND |
| `awards.meta.title` | SAA 2025 Award System |

### Genuine gaps remaining (15 keys — no Figma EN source; EN catalogue falls back to the Vietnamese text at runtime, reviewer H2: the former `[VN] ` marker leaked to English-locale visitors)
- `login.heroSubtitle`
- `login.heroTagline`
- `login.errorMessage`
- `home.eventInfo.place`
- `home.eventInfo.livestreamNote`
- `home.rootFurther.paragraph1`
- `home.rootFurther.quoteTranslation`
- `home.rootFurther.paragraph2`
- `home.awards.subDescription`
- `home.kudos.description`
- `awards.nav.ariaLabel`
- `awards.cardContent.signature-2025-creator.description`
- `awards.cardContent.mvp.description`
- `awards.kudos.description`
- `awards.meta.description`

### Removed hand-written EN copy (2026-08-30, Phase 07b review)
- `common.auth.loginError` — EN value "Sign-in failed. Please try again." had no MoMorph source (authored in Phase 03 before the EN copy rule) and no consumer; removed from `messages/vi/common.json` and `messages/en/common.json`. The login failure notice reads `login.errorMessage` (Vietnamese in both locales — no Figma EN source).
