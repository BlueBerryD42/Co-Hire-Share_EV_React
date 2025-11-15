import { NAV_LINKS } from "@/utils/navigation";

const Footer = () => {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 text-sm text-neutral-500 md:flex-row md:justify-between">
        <div className="space-y-3">
          <p className="text-lg font-semibold text-neutral-900">
            Co-Hire Share EV
          </p>
          <p className="max-w-sm">
            Warm, transparent tooling for EV co-ownership groups. Built with
            Vietnamese fleets in mind.
          </p>
          <div className="flex flex-col gap-1 text-neutral-600">
            <a
              href="mailto:contact@cohireshare.ev"
              className="hover:text-neutral-900"
            >
              contact@cohireshare.ev
            </a>
            <a href="tel:+84901234567" className="hover:text-neutral-900">
              +84 90 123 4567
            </a>
          </div>
        </div>
        <div className="grid gap-6 text-neutral-600 sm:grid-cols-2 md:gap-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Navigate
            </p>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-neutral-900">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Resources
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="#how-it-works" className="hover:text-neutral-900">
                  How it works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-neutral-900">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-neutral-900">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-4 text-xs text-neutral-500 md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} Co-Hire Share EV. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-neutral-900">
              Terms
            </a>
            <a href="/privacy" className="hover:text-neutral-900">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
