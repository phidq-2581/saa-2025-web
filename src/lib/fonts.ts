import { Montserrat, Montserrat_Alternates } from "next/font/google";
import localFont from "next/font/local";

// Font families traced via MoMorph MCP `list_frame_styles("i87tDx10uM")`:
// - Header/footer nav links, dropdown items, FAB labels -> fontFamily "Montserrat" (weight 700)
// - Footer copyright line -> fontFamily "Montserrat Alternates" (weight 700)
// - Countdown digits (186:2617) -> fontFamily "Digital Numbers" 49.152px / 400. That face
//   has no distributable source; clarifications.md (2026-09-03) substitutes the OFL-1.1
//   7-segment "DSEG7 Classic" from the `dseg` package at the same size/weight.
export const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const montserratAlternates = Montserrat_Alternates({
  variable: "--font-montserrat-alternates",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
});

export const dseg7Classic = localFont({
  src: "../../node_modules/dseg/fonts/DSEG7-Classic/DSEG7Classic-Regular.woff2",
  variable: "--font-dseg7",
  weight: "400",
  display: "swap",
});
