import { NAV_LINKS } from "@/utils/navigation";

const Footer = () => {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-neutral-600 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} Co-Hire Share EV. All rights reserved.</p>
        <div className="flex gap-4">
          <a
            className="hover:text-accent-blue transition-colors"
            href="mailto:contact@cohireshare.ev"
          >
            contact@cohireshare.ev
          </a>
          <a
            className="hover:text-accent-blue transition-colors"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
