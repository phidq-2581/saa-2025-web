import { test, expect } from "./support/authenticated-fixture";
import {
  openComposeDialog,
  getDialogFields,
  getAddlinkDialog,
  getPickerLocators,
  pickFirstHashtags,
  PNG_1PX,
} from "./support/compose-helpers";

/** Phase 03 RED: Viết Kudo compose modal (15 tests, 5 groups). */

test.describe("Kudos compose modal (Phase 03, RED test)", () => {
  test.beforeEach(async ({ page }) => {
    page.setViewportSize({ width: 1280, height: 800 });
  });

  test("G1-01: FAB opens compose dialog (TC ID-3)", async ({
    authenticatedPage: page,
  }) => {
    const dialog = await openComposeDialog(page);
    await expect(dialog).toBeVisible();
  });

  test("G1-02: Dialog fields in order: recipient, editor, hashtag, image, anonymous, footer", async ({
    authenticatedPage: page,
  }) => {
    const dialog = await openComposeDialog(page);
    const fields = getDialogFields(dialog);

    await expect(fields.recipient).toBeVisible();
    await expect(fields.editor).toBeVisible();
    await expect(fields.hashtag).toBeVisible();
    await expect(fields.imageGrid).toBeVisible();
    await expect(fields.anonCheckbox).toBeVisible();
    await expect(fields.submit).toBeVisible();
  });

  test("G2-01: Gửi disabled (TC ID-48)", async ({
    authenticatedPage: page,
  }) => {
    const dialog = await openComposeDialog(page);
    const { submit } = getDialogFields(dialog);
    await expect(submit).toBeDisabled();
  });

  test("G2-02: Hủy closes dialog (TC ID-45)", async ({
    authenticatedPage: page,
  }) => {
    const dialog = await openComposeDialog(page);
    const { cancel } = getDialogFields(dialog);
    await cancel.click();
    await expect(dialog).not.toBeVisible();
  });

  test("G2-03: Gửi enabled when recipient+content+hashtag valid (TC ID-49, DEC-001)", async ({
    authenticatedPage: page,
  }) => {
    const dialog = await openComposeDialog(page);
    const { submit, recipient, editor, hashtagChips } = getDialogFields(dialog);
    const { recipientOptions } = getPickerLocators(page);

    await expect(submit).toBeDisabled();
    await recipient.fill("Nguyễn");
    await recipientOptions.first().click();
    await editor.click();
    await page.keyboard.type("Cảm ơn bạn");
    await pickFirstHashtags(page, dialog, 1);
    await expect(hashtagChips).toHaveCount(1);
    await expect(submit).toBeEnabled();
  });

  test("G3-01: 5 tags max — 6th disabled + 'Tối đa 5 hashtag' (TC ID-16/17/53)", async ({
    authenticatedPage: page,
  }) => {
    const dialog = await openComposeDialog(page);
    const { hashtagChips, hashtagError } = getDialogFields(dialog);

    const options = await pickFirstHashtags(page, dialog, 5);
    await expect(hashtagChips).toHaveCount(5);
    await expect(options.nth(5)).toBeDisabled();
    await expect(hashtagError).toContainText("Tối đa 5 hashtag");
  });

  test("G3-02: pick 1 chip then remove it (TC ID-34/36)", async ({ authenticatedPage: page }) => {
    const dialog = await openComposeDialog(page);
    const { hashtagChips } = getDialogFields(dialog);

    await pickFirstHashtags(page, dialog, 1);
    await expect(hashtagChips).toHaveCount(1);
    await hashtagChips
      .first()
      .locator('[data-testid="kudos-compose-hashtag-chip-remove"]')
      .click();
    await expect(hashtagChips).toHaveCount(0);
  });

  test("G4-01: Blank text rejected (TC 3912184e)", async ({ authenticatedPage: page }) => {
    const dialog = await openComposeDialog(page);
    const { toolbarLink } = getDialogFields(dialog);
    await toolbarLink.click();
    const addlink = getAddlinkDialog(page);
    await addlink.textInput.fill("");
    await addlink.linkInput.fill("https://example.com");
    await expect(addlink.save).toBeDisabled();
  });

  test("G4-02: Text >100 chars rejected (TC 7d85997d)", async ({ authenticatedPage: page }) => {
    const dialog = await openComposeDialog(page);
    const { toolbarLink } = getDialogFields(dialog);
    await toolbarLink.click();
    const addlink = getAddlinkDialog(page);
    await addlink.textInput.fill("a".repeat(101));
    await addlink.linkInput.fill("https://example.com");
    await expect(addlink.save).toBeDisabled();
  });

  test("G4-03: Invalid link rejected (TC 97dc4028/aad5791a)", async ({ authenticatedPage: page }) => {
    const dialog = await openComposeDialog(page);
    const { toolbarLink } = getDialogFields(dialog);
    await toolbarLink.click();
    const addlink = getAddlinkDialog(page);
    await addlink.textInput.fill("Text");
    await addlink.linkInput.fill("ftp:");
    await expect(addlink.save).toBeDisabled();
  });

  test("G4-04: Addlink closes on Esc/Hủy (TC 48467d34)", async ({ authenticatedPage: page }) => {
    const dialog = await openComposeDialog(page);
    const { toolbarLink } = getDialogFields(dialog);
    await toolbarLink.click();
    const addlink = getAddlinkDialog(page);
    await page.keyboard.press("Escape");
    await expect(addlink.dialog).not.toBeVisible();
    await toolbarLink.click();
    await addlink.cancel.click();
    await expect(addlink.dialog).not.toBeVisible();
  });

  test("G5-01: Anon checkbox shows name field (TC ID-41/43)", async ({ authenticatedPage: page }) => {
    const dialog = await openComposeDialog(page);
    const { anonCheckbox, anonName } = getDialogFields(dialog);
    await expect(anonName).not.toBeVisible();
    await anonCheckbox.check();
    await expect(anonName).toBeVisible();
  });

  test("G5-02: Unchecking clears name field (TC ID-42/44)", async ({ authenticatedPage: page }) => {
    const dialog = await openComposeDialog(page);
    const { anonCheckbox, anonName } = getDialogFields(dialog);
    await anonCheckbox.check();
    await expect(anonName).toBeVisible();
    await anonName.fill("Test Name");
    await anonCheckbox.uncheck();
    await expect(anonName).not.toBeVisible();
    await anonCheckbox.check();
    await expect(anonName).toHaveValue("");
  });

  test("G5-03: Toolbar applies real marks to selection (TC ID-27/28/30/32)", async ({
    authenticatedPage: page,
  }) => {
    const dialog = await openComposeDialog(page);
    const { editor, toolbarBold, toolbarItalic, toolbarList, toolbarQuote } =
      getDialogFields(dialog);
    await editor.click();
    await page.keyboard.type("Test");
    await page.keyboard.press("ControlOrMeta+a");
    await toolbarBold.click();
    await expect(editor.locator("strong")).toHaveText("Test");
    await toolbarItalic.click();
    await expect(editor.locator("em")).toHaveText("Test");
    await toolbarList.click();
    await expect(editor.locator("ol li")).toBeVisible();
    await toolbarQuote.click();
    await expect(editor.locator("blockquote")).toBeVisible();
  });

  test("G5-04: @ opens mention list (TC ID-12/13)", async ({ authenticatedPage: page }) => {
    const dialog = await openComposeDialog(page);
    const { editor } = getDialogFields(dialog);
    await editor.click();
    await page.keyboard.type("@");
    await expect(getPickerLocators(page).mentionListPortal).toBeVisible();
  });

  test("G5-05: .pdf rejected with error; add hides at 5 images (TC ID-19/20/23/54/55)", async ({
    authenticatedPage: page,
  }) => {
    const dialog = await openComposeDialog(page);
    const { imageAdd, imageInput, imageThumbs, imageError } = getDialogFields(dialog);

    await expect(imageAdd).toBeVisible();
    await imageInput.setInputFiles({
      name: "doc.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4"),
    });
    await expect(imageError).toContainText("Định dạng file không hợp lệ");

    await imageInput.setInputFiles(
      [0, 1, 2, 3, 4].map((i) => ({
        name: `pic-${i}.png`,
        mimeType: "image/png",
        buffer: PNG_1PX,
      })),
    );
    await expect(imageThumbs).toHaveCount(5);
    await expect(imageAdd).not.toBeVisible();
  });
});
