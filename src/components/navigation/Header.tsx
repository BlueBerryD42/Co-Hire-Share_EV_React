import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useToggle from "@/hooks/useToggle";
import { type NavLink, NAV_LINKS } from "@/utils/navigation";

const DEFAULT_ANCHOR = "#overview";

const Header = () => {
  const [isOpen, toggleOpen] = useToggle(false);
  const [activeAnchor, setActiveAnchor] = useState(DEFAULT_ANCHOR);
  const location = useLocation();
  const navigate = useNavigate();

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
    if (location.pathname !== "/") {
      navigate("/");
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

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-neutral-50/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold tracking-tight text-neutral-900">
          Co-Hire Share EV
        </span>
        <div className="hidden items-center gap-4 md:flex">
          <NavLinks variant="desktop" />
          <a
            href="/login"
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-500 hover:text-neutral-900"
          >
            Log in
          </a>
          <a
            href="#contact"
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-50 shadow-sm transition hover:bg-neutral-800"
          >
            Request demo
          </a>
        </div>
        <button
          type="button"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 md:hidden"
          onClick={toggleOpen}
          aria-label="Toggle navigation"
        >
          Menu
        </button>
      </nav>
      {isOpen && (
        <div className="border-t border-neutral-200 bg-neutral-100 px-6 py-4 md:hidden">
          <NavLinks variant="mobile" />
          <a
            href="/login"
            className="mt-4 block rounded-full border border-neutral-300 px-4 py-2 text-center text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-500 hover:text-neutral-900"
          >
            Log in
          </a>
          <a
            href="#contact"
            className="mt-4 block rounded-full bg-neutral-900 px-4 py-2 text-center text-sm font-semibold text-neutral-50 shadow-sm transition hover:bg-neutral-800"
          >
            Request demo
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
