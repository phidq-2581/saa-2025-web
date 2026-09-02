import { type Page, expect } from "@playwright/test";

/**
 * Helpers for Kudos compose modal E2E tests (Phase 03).
 * Tester-owned file for DRY composition flow and dialog interaction.
 */

/**
 * Opens the Viết KUDOS compose dialog via FAB navigation.
 * Handles: navigate to /, expand FAB menu, click Viết KUDOS button.
 * Returns the dialog locator ready for assertions.
 */
export async function openComposeDialog(page: Page) {
  await page.goto("/");

  const fabToggle = page.locator('[data-testid="fab-toggle"]');
  await fabToggle.click();

  const writeKudosButton = page.locator('[data-testid="fab-menu"]').locator('button:has-text("Viết KUDOS")');
  await writeKudosButton.click();

  const dialog = page.locator('[data-testid="kudos-compose-dialog"]');
  await expect(dialog).toBeVisible();
  return dialog;
}

/**
 * Extracts commonly used dialog field locators.
 * Returns object with named locators for each field.
 */
export function getDialogFields(dialog: ReturnType<Page["locator"]>) {
  return {
    recipient: dialog.locator('[data-testid="kudos-compose-recipient-input"]'),
    editor: dialog.locator('[data-testid="kudos-compose-editor"]'),
    hashtag: dialog.locator('[data-testid="kudos-compose-hashtag-picker"]'),
    hashtagChips: dialog.locator('[data-testid="kudos-compose-hashtag-chip"]'),
    hashtagError: dialog.locator('[data-testid="kudos-compose-hashtag-error"]'),
    hashtagAdd: dialog.locator('[data-testid="kudos-compose-hashtag-add"]'),
    imageGrid: dialog.locator('[data-testid="kudos-compose-image-grid"]'),
    imageAdd: dialog.locator('[data-testid="kudos-compose-image-add"]'),
    imageInput: dialog.locator('[data-testid="kudos-compose-image-input"]'),
    imageThumbs: dialog.locator('[data-testid="kudos-compose-image-thumb"]'),
    imageError: dialog.locator('[data-testid="kudos-compose-image-error"]'),
    anonCheckbox: dialog.locator('[data-testid="kudos-compose-anonymous-checkbox"]'),
    anonName: dialog.locator('[data-testid="kudos-compose-anonymous-name"]'),
    submit: dialog.locator('[data-testid="kudos-compose-submit"]'),
    cancel: dialog.locator('[data-testid="kudos-compose-cancel"]'),
    toolbarBold: dialog.locator('[data-testid="kudos-compose-toolbar-bold"]'),
    toolbarItalic: dialog.locator('[data-testid="kudos-compose-toolbar-italic"]'),
    toolbarStrike: dialog.locator('[data-testid="kudos-compose-toolbar-strike"]'),
    toolbarList: dialog.locator('[data-testid="kudos-compose-toolbar-ordered-list"]'),
    toolbarLink: dialog.locator('[data-testid="kudos-compose-toolbar-link"]'),
    toolbarQuote: dialog.locator('[data-testid="kudos-compose-toolbar-blockquote"]'),
    mentionList: dialog.locator('[data-testid="kudos-compose-mention-list"]'),
  };
}

/** 1x1 transparent PNG for image-upload tests. */
export const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

/** Opens the hashtag picker and clicks the first `n` option rows. */
export async function pickFirstHashtags(
  page: Page,
  dialog: ReturnType<Page["locator"]>,
  n: number,
) {
  await dialog.locator('[data-testid="kudos-compose-hashtag-add"]').click();
  const options = page.locator('[data-testid="kudos-compose-hashtag-option"]');
  for (let i = 0; i < n; i++) {
    await options.nth(i).click();
  }
  return options;
}

/**
 * Locators for elements that may render in a portal OUTSIDE the dialog DOM
 * (floating-ui/TipTap suggestion popups) — always resolved at page level.
 */
export function getPickerLocators(page: Page) {
  return {
    recipientOptions: page.locator('[data-testid="kudos-compose-recipient-option"]'),
    hashtagOptions: page.locator('[data-testid="kudos-compose-hashtag-option"]'),
    mentionListPortal: page.locator('[data-testid="kudos-compose-mention-list"]'),
  };
}

/**
 * Gets the nested addlink dialog and its fields.
 */
export function getAddlinkDialog(page: Page) {
  const dialog = page.locator('[data-testid="addlink-dialog"]');
  return {
    dialog,
    textInput: dialog.locator('[data-testid="addlink-text-input"]'),
    linkInput: dialog.locator('[data-testid="addlink-link-input"]'),
    save: dialog.locator('[data-testid="addlink-save"]'),
    cancel: dialog.locator('[data-testid="addlink-cancel"]'),
  };
}
