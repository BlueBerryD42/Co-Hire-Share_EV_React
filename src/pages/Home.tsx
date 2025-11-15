import heroImage from '@/assets/react.svg'

const Home = () => {
  return (
    <section id="overview" className="mx-auto flex max-w-6xl flex-col gap-10">
      <div className="space-y-6">
        <p className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs uppercase tracking-wide text-slate-400">
          EV Fleet Sharing Platform
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
          Seamless coordination for electric vehicle co-ownership.
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          Manage schedules, optimize utilization, and keep every stakeholder in sync. Co-Hire
          Share EV gives teams visibility into reservations, billing, maintenance, and usage
          analytics from a single dashboard.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-dark"
            href="#contact"
          >
            Request a demo
          </a>
          <a
            className="rounded-md border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-brand hover:text-brand"
            href="#benefits"
          >
            Explore features
          </a>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <article
          id="benefits"
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40"
        >
          <h2 className="text-2xl font-semibold text-slate-100">Why teams choose us</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>Real-time vehicle availability with intelligent conflict detection.</li>
            <li>Automated billing, reporting, and maintenance notifications.</li>
            <li>Role-based access controls for owners, drivers, and partners.</li>
            <li>API-ready foundation for integrating telematics and ERP tools.</li>
          </ul>
        </article>
        <article
          id="pricing"
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40"
        >
          <h2 className="text-2xl font-semibold text-slate-100">Transparent pricing</h2>
          <p className="mt-4 text-sm text-slate-300">
            Choose the plan that fits your fleet size. Start with essentials, expand to advanced
            analytics and partner portals as you grow. Custom enterprise deployments available.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase text-slate-400">
            <span className="rounded-full border border-slate-800 px-3 py-1">
              Usage-based billing
            </span>
            <span className="rounded-full border border-slate-800 px-3 py-1">
              Shared maintenance
            </span>
            <span className="rounded-full border border-slate-800 px-3 py-1">Dedicated support</span>
          </div>
        </article>
      </div>
      <div
        id="contact"
        className="flex flex-col gap-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-slate-300 lg:flex-row lg:items-center"
      >
        <img
          src={heroImage}
          alt="Platform dashboard preview"
          className="h-24 w-24 flex-shrink-0 rounded-full border border-slate-800 bg-slate-900 p-4"
        />
        <div className="flex-1 space-y-3">
          <h3 className="text-xl font-semibold text-slate-100">Let’s build together</h3>
          <p>
            Share your goals and we’ll co-design a solution tailored to your stakeholders and
            fleet operations.
          </p>
        </div>
        <a
          className="inline-flex items-center gap-2 rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand/10"
          href="mailto:contact@cohireshare.ev"
        >
          contact@cohireshare.ev
        </a>
      </div>
    </section>
  )
}

export default Home

