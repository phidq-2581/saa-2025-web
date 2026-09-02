import { useTranslations } from "next-intl";

/**
 * A_KV Kudos (2940:13437, "Bìa" > Frame 487 > A_KV Kudos): the /kudos hero
 * banner -- title text + "KUDOS" wordmark stacked over a full-bleed
 * keyvisual image. The background asset itself lives on a DIFFERENT node
 * (`Keyvisual` 2940:13432, a root-level sibling of `Bìa` positioned
 * absolute 0,0 1440x512 -- MM_MEDIA_KV Background is
 * `I2940:13432;2167:5140` > `I2940:13432;2167:5141`) rather than nested
 * under this frame, but per the phase-04 section assignment this component
 * owns rendering it since visually it is this banner's backdrop (the KV
 * title sits at y184 inside the keyvisual's 0-512 span). Downloaded to
 * `/public/kudos-board/kv-background.png` (not `/public/kudos/` -- that
 * path is reserved for the future `/kudos/[id]` dynamic route, per phase
 * brief).
 *
 * DESIGN GAP: node 2940:13439's live `character` field reads "Hệ thống ghi
 * nhận VÀ cảm ơn", not "...LỜI cảm ơn" as the phase brief/RED
 * contract/messages/vi/kudos.json all specify. The translation key
 * (`banner.title`) is the approved, RED-test-verified source of truth
 * (clarifications.md), so it's used verbatim here rather than the node's
 * current `character` text -- flagging the Figma/spec drift for the
 * record, not silently picking one.
 */
export function KvBanner() {
  const t = useTranslations("kudos");
  return (
    // mm:2940:13437
    <section className="relative w-full min-h-[512px] overflow-hidden">
      {/* mm:I2940:13432;2167:5141 */}
      <img
        src="/kudos-board/kv-background.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="relative z-[1] mx-auto flex w-full max-w-[1152px] flex-col gap-[10px] px-4 pt-[184px]">
        {/* mm:2940:13439 */}
        <p
          data-testid="kudos-board-banner-title"
          className="font-body text-[36px] font-bold leading-[44px] text-gold"
        >
          {t("banner.title")}
        </p>
        {/* mm:2940:13440 */}
        <KudosLogo aria-hidden="true" className="h-[104px] w-[593px] max-w-full" />
      </div>
    </section>
  );
}

/** MM_MEDIA_Kudos logo (2940:13440) -- multi-color wordmark + asterisk
 * mark, kept as its original palette per code-rules 2a (not a mono icon,
 * no `currentColor` swap). Inlined rather than `<img>` so gradient
 * defs render crisply and CSS can still size it responsively. */
function KudosLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="593" height="106" viewBox="0 0 593 106" fill="none" {...props}>
      <path d="M107.249 103.605V5.75905H118.291V64.1873L174.483 5.75905H188.741L146.807 48.5319L190.558 103.605H176.72L139.119 56.2198L118.291 77.3267V103.605H107.249ZM226.636 105.143C202.454 105.143 185.959 90.3263 185.959 62.6498V5.75905H197.002V61.9509C197.002 83.1975 208.045 94.9391 226.915 94.9391C244.947 94.9391 256.409 84.0362 256.409 62.6498V5.75905H267.452V61.8111C267.452 90.4661 251.097 105.143 226.636 105.143ZM275.39 103.605V5.75905H309.356C340.108 5.75905 361.355 26.8659 361.355 54.4027V54.6823C361.355 82.219 340.108 103.605 309.356 103.605H275.39ZM286.432 93.4015H309.356C334.097 93.4015 349.893 76.7676 349.893 54.9618V54.6823C349.893 33.0163 334.097 15.963 309.356 15.963H286.432V93.4015ZM411.987 105.283C382.214 105.283 362.225 81.9395 362.225 54.9618V54.6823C362.225 27.7046 382.493 4.08168 412.266 4.08168C442.04 4.08168 462.028 27.425 462.028 54.4027V54.6823C462.028 81.6599 441.76 105.283 411.987 105.283ZM412.266 95.0789C434.631 95.0789 450.566 77.1869 450.566 54.9618V54.6823C450.566 32.4571 434.352 14.2857 411.987 14.2857C389.622 14.2857 373.687 32.1776 373.687 54.4027V54.6823C373.687 76.9074 389.902 95.0789 412.266 95.0789ZM500.01 105.003C484.355 105.003 471.775 99.9712 460.033 89.3478L466.882 81.2406C477.086 90.6059 486.871 95.0789 500.43 95.0789C513.709 95.0789 522.236 88.0898 522.236 78.445V78.1654C522.236 69.0797 517.343 64.0476 496.795 59.5746C474.291 54.6823 463.947 47.4137 463.947 31.3389V31.0593C463.947 15.8233 477.506 4.36124 496.097 4.36124C510.494 4.36124 520.418 8.41488 530.483 16.3824L524.053 24.909C514.967 17.5006 505.881 14.2857 495.817 14.2857C482.957 14.2857 474.99 21.1349 474.99 30.0809V30.3604C474.99 39.586 479.882 44.8976 501.548 49.3706C523.354 54.2629 533.418 62.0906 533.418 77.0472V77.3267C533.418 94.1004 519.44 105.003 500.01 105.003Z" fill="#DBD1C1"/>
      <path d="M31.5534 35.6991L66.3419 46.4839C69.8595 47.6624 72.9116 51.4871 70.0923 55.6454C68.23 58.7808 54.3405 71.7893 54.3405 71.7893C54.2629 72.0339 9.46467 57.7357 9.46467 57.7357C5.8177 56.5349 3.69677 53.2661 4.88656 49.4636C6.07635 45.6611 27.3374 34.2537 31.5534 35.6768V35.6991Z" fill="#B72927"/>
      <path d="M31.5808 35.6795L66.3692 46.4643C69.8869 47.6429 72.9389 51.4676 70.1196 55.6259C68.2574 58.7613 54.3678 71.7697 54.3678 71.7697C54.2902 72.0144 9.49202 57.7161 9.49202 57.7161C5.84505 56.5153 3.72411 53.2465 4.91391 49.4441C6.1037 45.6416 27.3648 34.2341 31.5808 35.6573V35.6795Z" fill="url(#kudos-logo-a)" style={{ mixBlendMode: "multiply" }}/>
      <path d="M31.5534 35.6795L66.3419 46.4643C69.8595 47.6429 72.9116 51.4676 70.0923 55.6259C68.23 58.7613 54.3405 71.7697 54.3405 71.7697C54.2629 72.0144 9.46467 57.7161 9.46467 57.7161C5.8177 56.5153 3.69677 53.2465 4.88656 49.4441C6.07635 45.6416 27.3374 34.2341 31.5534 35.6573V35.6795Z" fill="url(#kudos-logo-b)" style={{ mixBlendMode: "multiply" }}/>
      <path d="M76.0771 34.0336C77.3445 33.0329 95.8897 18.2899 119.737 0.545018C120.048 0.300414 119.737 -0.122084 119.349 0.0335729C108.357 4.85895 86.2679 9.3063 86.2679 9.3063L40.9524 16.5555C25.511 19.2684 24.0884 21.492 17.8549 30.1199L16.1996 32.3658C16.122 32.477 13.4837 36.5685 5 49.2212C7.5865 45.3743 10.5093 45.063 27.8905 42.2612C31.2013 41.6608 39.0901 40.1042 44.0303 39.2369C50.8846 38.0362 74.2407 34.3449 75.896 34.078C75.9736 34.078 75.9995 34.0558 76.0512 34.0113L76.0771 34.0336Z" fill="#E73928"/>
      <path d="M17.7434 66.7438L0 94.1617L34.8402 87.0904C50.2558 84.3108 51.6783 82.0872 57.8859 73.4371L59.5413 71.1689C59.5413 71.1689 61.5329 68.545 70.0942 55.6699C67.6629 59.4946 58.1187 59.4279 47.8244 61.3403C44.5137 61.9629 17.7693 66.7438 17.7693 66.7438H17.7434Z" fill="#E73928"/>
      <defs>
        <linearGradient id="kudos-logo-a" x1="48.6258" y1="74.327" x2="35.9834" y2="38.8586" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="0.32" stopColor="#FDFCFD"/>
          <stop offset="0.47" stopColor="#F9F5F6"/>
          <stop offset="0.57" stopColor="#F2E9EA"/>
          <stop offset="0.66" stopColor="#E8D7DA"/>
          <stop offset="0.74" stopColor="#DABFC4"/>
          <stop offset="0.81" stopColor="#CAA3AA"/>
          <stop offset="0.87" stopColor="#B6818B"/>
          <stop offset="0.93" stopColor="#A05966"/>
          <stop offset="0.98" stopColor="#872D3E"/>
          <stop offset="1" stopColor="#7E1E30"/>
        </linearGradient>
        <linearGradient id="kudos-logo-b" x1="40.3734" y1="56.0484" x2="50.1984" y2="76.9172" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="0.22" stopColor="#FCFCFC"/>
          <stop offset="0.35" stopColor="#F3F3F3"/>
          <stop offset="0.47" stopColor="#E5E5E5"/>
          <stop offset="0.57" stopColor="#D0D0D0"/>
          <stop offset="0.66" stopColor="#B5B5B5"/>
          <stop offset="0.75" stopColor="#959595"/>
          <stop offset="0.83" stopColor="#6D6D6D"/>
          <stop offset="0.91" stopColor="#404040"/>
          <stop offset="0.98" stopColor="#0E0E0E"/>
          <stop offset="1"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
