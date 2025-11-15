const heroStats = [
  { label: "Groups co-managing fleets", value: "280+" },
  { label: "Vehicles actively shared", value: "1,900" },
  { label: "Avg. cost saved per group", value: "22%" },
] as const;

const featureCards = [
  {
    title: "360º visibility",
    description:
      "Track bookings, shared costs, maintenance and documents from one calm dashboard.",
  },
  {
    title: "Fair usage intelligence",
    description:
      "AI helps distribute bookings evenly and highlights members who need gentle nudges.",
  },
  {
    title: "Built for Vietnam",
    description:
      "Supports local payment gateways, Vietnamese localization, and EV brands popular in-market.",
  },
] as const;

const howItWorks = [
  {
    step: "01",
    title: "Create or join a co-ownership group",
    body: "Invite co-owners, upload legal docs, configure cost-sharing rules, and set ownership percentages.",
  },
  {
    step: "02",
    title: "Automate scheduling & upkeep",
    body: "Smart booking calendar, digital checklists, and predictive maintenance keep vehicles in rotation.",
  },
  {
    step: "03",
    title: "Stay in sync on finances",
    body: "Real-time shared fund balance, transparent expenses, e-contracts, and monthly statements.",
  },
] as const;

const testimonials = [
  {
    quote:
      "“Co-Hire Share EV gives us a real business cockpit. No more spreadsheets, no more messaging chaos. Everything is structured, auditable, and friendly for our members.”",
    author: "Nguyễn Hữu Dương · Ho Chi Minh City",
    role: "Fleet operations lead, EV Guild 12",
  },
  {
    quote:
      "“We scaled from one shared car to eight across Hanoi districts. The platform kept usage fair, fees transparent, and compliance painless.”",
    author: "Linh & Partners",
    role: "Community EV cooperative",
  },
] as const;

const Home = () => {
  return (
    <main className="bg-neutral-50 text-neutral-700">
      <section
        id="overview"
        className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center"
      >
        <div className="flex-1 space-y-6">
          <p className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            EV co-ownership made calm
          </p>
          <h1 className="text-4xl font-bold text-neutral-900 sm:text-5xl lg:text-6xl">
            Share EV fleets without the spreadsheets or stress.
          </h1>
          <p className="text-lg text-neutral-600">
            Co-Hire Share EV orchestrates reservations, fair usage, digital
            contracts, and shared funds so every stakeholder stays aligned.
            Designed specifically for Vietnam&apos;s fast-growing EV
            communities.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              className="rounded-md bg-accent-blue px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
              href="#contact"
            >
              Request live demo
            </a>
            <a
              className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-500"
              href="#benefits"
            >
              Explore product
            </a>
          </div>
          <div className="grid gap-4 border-t border-neutral-200 pt-6 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-semibold text-neutral-900">
                  {stat.value}
                </p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 rounded-3xl border border-neutral-200 bg-neutral-100 p-8 shadow-xl shadow-neutral-200/60">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Snapshot preview
            </p>
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase text-neutral-500">
                Upcoming booking
              </p>
              <h3 className="mt-2 text-xl font-semibold text-neutral-900">
                Mercedes EQB · HCM-88A-22190
              </h3>
              <p className="text-sm text-neutral-500">
                Tomorrow · 07:30 - 14:00
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                <li>• Check-in photos required</li>
                <li>• Shared fund auto-top-up scheduled</li>
                <li>• Charging slot: Vinhomes 2</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase text-neutral-500">
                Cost overview
              </p>
              <div className="mt-3 space-y-3">
                {[
                  {
                    label: "Charging & energy",
                    value: "₫54.3M",
                    bar: "w-7/12",
                  },
                  {
                    label: "Maintenance & repairs",
                    value: "₫36.1M",
                    bar: "w-1/3",
                  },
                  { label: "Insurance & admin", value: "₫12.5M", bar: "w-1/4" },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">{row.label}</span>
                      <span className="font-semibold text-neutral-900">
                        {row.value}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-neutral-200">
                      <div
                        className={`h-full rounded-full bg-accent-blue/70 ${row.bar}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="bg-white py-16">
        <div className="mx-auto max-w-5xl space-y-10 px-6 text-center">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Why EV communities choose us
            </p>
            <h2 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">
              Designed for transparency, harmony, and scale.
            </h2>
            <p className="text-neutral-600">
              Warm, minimal interfaces make complex fleet coordination intuitive
              for every member, from founders to rotating drivers.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-left shadow-sm"
              >
                <h3 className="text-xl font-semibold text-neutral-900">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm text-neutral-600">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-neutral-100 py-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              How it works
            </p>
            <h2 className="text-3xl font-semibold text-neutral-900">
              Launch your shared EV program in weeks, not months.
            </h2>
            <p className="text-neutral-600">
              We provide onboarding playbooks, Vietnamese legal templates, and a
              support team that understands the nuance of shared-ownership
              operations.
            </p>
            <a
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent-blue"
              href="#demo"
            >
              Talk to a specialist →
            </a>
          </div>
          <div className="flex-1 space-y-5">
            {howItWorks.map((item) => (
              <article
                key={item.step}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  {item.step}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-neutral-900">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-600">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl space-y-10 px-6">
          <div className="text-center space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Voices from the community
            </p>
            <h2 className="text-3xl font-semibold text-neutral-900">
              Built with co-owners, for co-owners.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <blockquote
                key={testimonial.author}
                className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm"
              >
                <p className="text-lg text-neutral-800">
                  “{testimonial.quote}”
                </p>
                <div className="mt-4 text-sm text-neutral-500">
                  <p className="font-semibold text-neutral-800">
                    {testimonial.author}
                  </p>
                  <p>{testimonial.role}</p>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-5xl space-y-10 px-6">
          <div className="text-center space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Pricing
            </p>
            <h2 className="text-3xl font-semibold text-neutral-900">
              Transparent tiers that scale with your fleet.
            </h2>
            <p className="text-neutral-600">
              Usage-based billing for small collectives, predictable enterprise
              bundles for multi-city operations.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Essentials
              </p>
              <p className="mt-2 text-3xl font-semibold text-neutral-900">
                ₫6.5M / group / tháng
              </p>
              <p className="text-sm text-neutral-500">
                Up to 2 vehicles, shared fund, booking calendar.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                <li>• Unlimited members</li>
                <li>• Digital check-in / check-out</li>
                <li>• Vietnamese KYC templates</li>
              </ul>
            </article>
            <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg shadow-neutral-200">
              <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Growth & Enterprise
              </p>
              <p className="mt-2 text-3xl font-semibold text-neutral-900">
                Custom quote
              </p>
              <p className="text-sm text-neutral-500">
                Multi-vehicle fleets, predictive maintenance, and API access.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                <li>• AI fairness & optimization suite</li>
                <li>• Dedicated success manager</li>
                <li>• Integration with VNPay, Momo, ZaloPay</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-neutral-100 py-16">
        <div className="mx-auto max-w-5xl rounded-3xl border border-neutral-200 bg-white px-10 py-12 text-center shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Ready to co-own smarter?
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-neutral-900">
            Tell us about your fleet and we will co-design the launch with you.
          </h2>
          <p className="mt-3 text-neutral-600">
            Transparent pricing, tailored onboarding, and hands-on guidance from
            a Vietnam-based success team.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              className="rounded-md bg-accent-blue px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
              href="mailto:contact@cohireshare.ev"
            >
              contact@cohireshare.ev
            </a>
            <a
              className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-500"
              href="tel:+84901234567"
            >
              +84 90 123 4567
            </a>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} Co-Hire Share EV. All rights reserved.
        </p>
      </section>
    </main>
  );
};

export default Home;
