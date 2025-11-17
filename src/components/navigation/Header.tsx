import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useToggle from '@/hooks/useToggle'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { type NavLink, NAV_LINKS } from '@/utils/navigation'

const DEFAULT_ANCHOR = "#overview";

const Header = () => {
  const [isOpen, toggleOpen] = useToggle(false)
  const [activeAnchor, setActiveAnchor] = useState(DEFAULT_ANCHOR)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (location.pathname === "/" && typeof window !== "undefined") {
      const hash = window.location.hash || DEFAULT_ANCHOR;
      setActiveAnchor(hash);
    }
  }, [location]);

  const scrollToAnchor = (href: string) => {
    if (typeof document === "undefined") return;
    const targetId = href.replace("#", "");
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAnchorClick = (href: string) => {
    setActiveAnchor(href);
    if (location.pathname !== "/app") {
      navigate("/app");
      setTimeout(() => scrollToAnchor(href), 150);
    } else {
      scrollToAnchor(href);
    }
    if (isOpen) toggleOpen();
  };

  const handleRouteClick = () => {
    if (isOpen) toggleOpen();
  };

  const isActive = (link: NavLink) => {
    if (link.type === "route") {
      return location.pathname.startsWith(link.href);
    }
    return location.pathname === "/" && activeAnchor === link.href;
  };

  const NavLinks = ({ variant }: { variant: "desktop" | "mobile" }) => (
    <ul
      className={
        variant === "desktop"
          ? "hidden items-center gap-6 text-sm font-medium text-neutral-600 md:flex"
          : "space-y-2 text-sm font-medium text-neutral-700"
      }
    >
      {NAV_LINKS.map((link) => {
        const baseClass =
          "transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 rounded-md";
        if (link.type === "route") {
          return (
            <li key={link.href}>
              <Link
                to={link.href}
                className={`${baseClass} ${
                  isActive(link) ? "text-neutral-900" : ""
                } ${
                  variant === "mobile"
                    ? "block px-3 py-2 hover:bg-neutral-200"
                    : "px-1 py-0.5"
                }`}
                onClick={handleRouteClick}
              >
                {link.label}
              </Link>
            </li>
          );
        }
        return (
          <li key={link.href}>
            <button
              type="button"
              className={`${baseClass} ${
                isActive(link) ? "text-neutral-900" : ""
              } ${
                variant === "mobile"
                  ? "block w-full px-3 py-2 text-left hover:bg-neutral-200"
                  : "px-1 py-0.5"
              }`}
              onClick={() => handleAnchorClick(link.href)}
            >
              {link.label}
            </button>
          </li>
        );
      })}
    </ul>
  );

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/')
  }

  return (
    <header className="border-b border-neutral-200 bg-neutral-50/80 backdrop-blur w-full">
      <nav className="w-full flex items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-neutral-800 hover:text-accent-blue transition-colors flex-shrink-0">
          <img src="/CoEV_logo.svg" alt="CoEV Logo" className="h-8 w-8 flex-shrink-0" />
          <span className="whitespace-nowrap">Co-Hire Share EV</span>
        </Link>

        <button
          type="button"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 md:hidden flex-shrink-0"
          onClick={toggleOpen}
          aria-label="Toggle navigation"
        >
          Menu
        </button>

        <div className="hidden md:flex items-center gap-4 lg:gap-6 flex-1 justify-center min-w-0">
          <ul className="flex gap-4 lg:gap-6 text-sm font-medium text-neutral-600 items-center">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="whitespace-nowrap">
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
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-neutral-700 whitespace-nowrap">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-100 whitespace-nowrap"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:text-neutral-900 whitespace-nowrap"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-neutral-50 transition-all whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--accent-blue)',
                  boxShadow: '0 2px 8px rgba(122, 154, 175, 0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6a8a9f'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-blue)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
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

          {/* Mobile Auth Buttons */}
          <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-neutral-700">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block w-full rounded-lg border border-neutral-300 px-4 py-2 text-center text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-200"
                  onClick={handleRouteClick}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full rounded-lg px-4 py-2 text-center text-sm font-semibold text-neutral-50 transition-all"
                  style={{
                    backgroundColor: 'var(--accent-blue)',
                    boxShadow: '0 2px 8px rgba(122, 154, 175, 0.25)',
                  }}
                  onClick={handleRouteClick}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
