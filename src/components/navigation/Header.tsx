import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useToggle from '@/hooks/useToggle'
import { type NavLink, NAV_LINKS } from '@/utils/navigation'

const DEFAULT_ANCHOR = '/#overview'

const Header = () => {
  const [isOpen, toggleOpen] = useToggle(false)
  const [activeAnchor, setActiveAnchor] = useState(DEFAULT_ANCHOR)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === '/' && typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash) {
        setActiveAnchor(`/${hash}`)
      } else {
        setActiveAnchor(DEFAULT_ANCHOR)
      }
    }
  }, [location])

  const scrollToAnchor = (href: string) => {
    if (typeof document === 'undefined') return
    const targetId = href.split('#')[1]
    if (!targetId) return
    const target = document.getElementById(targetId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleAnchorClick = (href: string) => {
    setActiveAnchor(href)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => scrollToAnchor(href), 150)
    } else {
      scrollToAnchor(href)
    }
    if (isOpen) toggleOpen()
  }

  const handleRouteClick = () => {
    if (isOpen) toggleOpen()
  }

  const isActive = (link: NavLink) => {
    if (link.type === 'route') {
      return location.pathname.startsWith(link.href)
    }
    return location.pathname === '/' && activeAnchor === link.href
  }

  return (
    <header className="border-b border-neutral-200 bg-neutral-50/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-neutral-800 hover:text-primary transition-colors">
          Co-Hire Share EV
        </Link>
        <button
          type="button"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 md:hidden"
          onClick={toggleOpen}
        >
          Menu
        </button>
        <ul className="hidden gap-6 text-sm font-medium text-neutral-600 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              {link.type === 'route' ? (
                <Link
                  to={link.href}
                  className={`transition-colors hover:text-neutral-900 ${
                    isActive(link) ? 'text-neutral-900 font-semibold' : ''
                  }`}
                  onClick={handleRouteClick}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  type="button"
                  className={`transition-colors hover:text-neutral-900 ${
                    isActive(link) ? 'text-neutral-900 font-semibold' : ''
                  }`}
                  onClick={() => handleAnchorClick(link.href)}
                >
                  {link.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
      {isOpen && (
        <div className="border-t border-neutral-200 bg-neutral-100 px-6 py-4 md:hidden">
          <ul className="space-y-2 text-sm font-medium text-neutral-700">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                {link.type === 'route' ? (
                  <Link
                    to={link.href}
                    className={`block w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-neutral-200 hover:text-neutral-900 ${
                      isActive(link) ? 'bg-neutral-200 text-neutral-900 font-semibold' : ''
                    }`}
                    onClick={handleRouteClick}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={`block w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-neutral-200 hover:text-neutral-900 ${
                      isActive(link) ? 'bg-neutral-200 text-neutral-900 font-semibold' : ''
                    }`}
                    onClick={() => handleAnchorClick(link.href)}
                  >
                    {link.label}
                  </button>
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
