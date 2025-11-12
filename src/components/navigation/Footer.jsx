const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} Co-Hire Share EV. All rights reserved.</p>
        <div className="flex gap-4">
          <a
            className="hover:text-brand transition-colors"
            href="mailto:contact@cohireshare.ev"
          >
            contact@cohireshare.ev
          </a>
          <a
            className="hover:text-brand transition-colors"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer

