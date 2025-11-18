export type NavLink = {
  label: string;
  href: string;
  type?: "anchor" | "route";
};

export const NAV_LINKS: NavLink[] = [
  { label: 'Overview', href: '#overview', type: 'anchor' },
  { label: 'Benefits', href: '#benefits', type: 'anchor' },
  { label: 'Pricing', href: '#pricing', type: 'anchor' },
  { label: 'Contact', href: '#contact', type: 'anchor' },
  { label: 'Vehicles', href: '/vehicles', type: 'route' },
  { label: 'Booking Suite', href: '/booking/calendar', type: 'route' },
  { label: 'Groups', href: '/groups', type: 'route' },
]
