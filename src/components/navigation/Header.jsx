import { useState } from 'react'
import useToggle from '@/hooks/useToggle'
import { NAV_LINKS } from '@/utils/navigation'

const Header = () => {
  const [isOpen, toggleOpen] = useToggle(false)
  const [activeLink, setActiveLink] = useState(NAV_LINKS[0].href)

  return (
    <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold tracking-tight text-brand">
          Co-Hire Share EV
        </span>
        <button
          type="button"
          className="md:hidden rounded-md border border-slate-700 px-3 py-2 text-sm font-medium hover:border-brand hover:text-brand transition-colors"
          onClick={toggleOpen}
        >
          Menu
        </button>
        <ul className="hidden gap-6 text-sm font-medium text-slate-300 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <button
                type="button"
                className={`transition-colors hover:text-brand ${
                  activeLink === link.href ? 'text-brand' : ''
                }`}
                onClick={() => setActiveLink(link.href)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {isOpen && (
        <div className="border-t border-slate-800 bg-slate-900 px-6 py-4 md:hidden">
          <ul className="space-y-2 text-sm font-medium text-slate-200">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <button
                  type="button"
                  className={`w-full text-left rounded-md px-3 py-2 hover:bg-slate-800 hover:text-brand ${
                    activeLink === link.href ? 'bg-slate-800 text-brand' : ''
                  }`}
                  onClick={() => {
                    setActiveLink(link.href)
                    toggleOpen()
                  }}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

export default Header

