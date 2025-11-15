export type NavLink = {
  label: string;
  href: string;
  type?: "anchor" | "route";
};

export const NAV_LINKS: NavLink[] = [
  { label: "Overview", href: "#overview" },
  { label: "Benefits", href: "#benefits" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];
