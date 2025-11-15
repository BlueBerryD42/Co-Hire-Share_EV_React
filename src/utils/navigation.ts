export type NavLink = {
  label: string
  href: string
  type: 'anchor' | 'route'
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Overview', href: '/#overview', type: 'anchor' },
  { label: 'Benefits', href: '/#benefits', type: 'anchor' },
  { label: 'Pricing', href: '/#pricing', type: 'anchor' },
  { label: 'Contact', href: '/#contact', type: 'anchor' },
  { label: 'Booking Suite', href: '/booking', type: 'route' },
  { label: 'Group Suite', href: '/groups', type: 'route' },
]

