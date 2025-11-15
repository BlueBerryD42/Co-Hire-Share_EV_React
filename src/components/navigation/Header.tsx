import { Link, useLocation } from 'react-router-dom'
import useToggle from '@/hooks/useToggle'
import { NAV_LINKS } from '@/utils/navigation'

const Header = () => {
  const [isOpen, toggleOpen] = useToggle(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-primary hover:text-accent-blue transition-colors">
          Co-Hire Share EV
        </Link>
        <button
          type="button"
          className="md:hidden rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:border-primary hover:text-primary transition-colors"
          onClick={toggleOpen}
        >
          Menu
        </button>
        <ul className="hidden gap-6 text-sm font-medium text-neutral-700 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              {link.href.startsWith('#') ? (
                <a
                  href={link.href}
                  className={`transition-colors hover:text-primary ${
                    location.hash === link.href ? 'text-primary' : ''
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  to={link.href}
                  className={`transition-colors hover:text-primary ${
                    location.pathname === link.href ? 'text-primary font-semibold' : ''
                  }`}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      {isOpen && (
        <div className="border-t border-neutral-200 bg-white px-6 py-4 md:hidden">
          <ul className="space-y-2 text-sm font-medium text-neutral-700">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                {link.href.startsWith('#') ? (
                  <a
                    href={link.href}
                    className={`block w-full text-left rounded-md px-3 py-2 hover:bg-neutral-100 hover:text-primary ${
                      location.hash === link.href ? 'bg-neutral-100 text-primary' : ''
                    }`}
                    onClick={toggleOpen}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className={`block w-full text-left rounded-md px-3 py-2 hover:bg-neutral-100 hover:text-primary ${
                      location.pathname === link.href ? 'bg-neutral-100 text-primary font-semibold' : ''
                    }`}
                    onClick={toggleOpen}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

export default Header
