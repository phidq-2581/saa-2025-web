import { Montserrat, Montserrat_Alternates } from "next/font/google";

// Font families traced via MoMorph MCP `list_frame_styles("i87tDx10uM")`:
// - Header/footer nav links, dropdown items, FAB labels -> fontFamily "Montserrat" (weight 700)
// - Footer copyright line -> fontFamily "Montserrat Alternates" (weight 700)
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
