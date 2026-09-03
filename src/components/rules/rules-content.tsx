import { useTranslations } from "next-intl";
import { RulesTierList } from "./rules-tier-list";
import { RulesBadgeGrid } from "./rules-badge-grid";

const HEADING = "font-body text-[22px] leading-7 font-bold text-gold";
const PARAGRAPH = "text-justify font-body text-base leading-6 font-bold tracking-[0.5px] text-white";

/**
 * A_Nội dung thể lệ (3204:6053): a 473px column, `gap: 24` under the
 * 45px/700/52px gold title (3204:6055). Everything below the title sits in
 * one `gap: 16` stack (3204:6076 and its "Người nhận" child 3204:6131 both
 * use 16, so flattening them is pixel-identical): 22px/700/28px gold
 * headings, justified 16px/700/24px 0.5px paragraphs, the four Hero tiers,
 * the 6-badge grid, and the 24px/700/32px "KUDOS QUỐC DÂN" heading. All copy
 * is the canvas `character` text (messages/{vi,en}/rules.json). Two paragraphs
 * end on an empty line in the canvas (3204:6078, 3204:6091); CSS drops a
 * trailing line break, so their boxes are pinned to the canvas heights instead.
 */
export function RulesContent() {
  const t = useTranslations("rules");
  return (
    // mm:3204:6053
    <div className="flex w-full max-w-[473px] flex-col gap-6">
      {/* mm:3204:6055 */}
      <h2 id="rules-panel-title" className="font-body text-[45px] leading-[52px] font-bold text-gold">
        {t("title")}
      </h2>
      {/* mm:3204:6076 */}
      <div className="flex flex-col gap-4">
        {/* mm:3204:6132 */}
        <h3 className={HEADING}>{t("receiver.heading")}</h3>
        {/* mm:3204:6133 */}
        <p className={PARAGRAPH}>{t("receiver.intro")}</p>
        <RulesTierList />
        {/* mm:3204:6077 */}
        {/* 59px box in the canvas (two 28px lines + 3px) */}
        <h3 className={`${HEADING} min-h-[59px]`}>{t("sender.heading")}</h3>
        {/* mm:3204:6078 */}
        {/* 120px box: four text lines plus the empty line the canvas ends on */}
        <p className={`${PARAGRAPH} min-h-[120px]`}>{t("sender.intro")}</p>
        <RulesBadgeGrid />
        {/* mm:3204:6089 */}
        <p className={PARAGRAPH}>{t("sender.collectNote")}</p>
        {/* mm:3204:6090 */}
        <h3 className="font-body text-2xl leading-8 font-bold text-gold">{t("national.heading")}</h3>
        {/* mm:3204:6091 */}
        {/* 96px box: three text lines plus the canvas's trailing empty line */}
        <p className={`${PARAGRAPH} min-h-[96px]`}>{t("national.body")}</p>
      </div>
    </div>
  );
}
