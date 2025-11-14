import { useEffect, useState } from 'react'
import { bookingApi } from '@/services/booking/api'
import type { BookingDto } from '@/models/booking'

const stats = [
  { label: 'Elapsed time', value: '02:14:33', detail: 'Started 08:05' },
  { label: 'Distance', value: '126 km', detail: 'GPS tracking' },
  { label: 'Battery', value: '58%', detail: 'Estimated 112 km left' },
  { label: 'Estimated cost', value: '$34.10', detail: 'Updates every 5 min' },
]

const quickActions = [
  { label: 'Navigate', detail: 'Open Google Maps', accent: 'bg-brand/20 text-brand' },
  { label: 'Find charging', detail: '3 nearby stations', accent: 'bg-emerald-500/15 text-emerald-200' },
  { label: 'Emergency call', detail: '1900 9999', accent: 'bg-rose-500/20 text-rose-200' },
  { label: 'Report issue', detail: 'Jump to screen 40', accent: 'bg-amber-500/20 text-amber-100' },
]

const ActiveTrip = () => {
  const [activeBooking, setActiveBooking] = useState<BookingDto | null>(null)

  useEffect(() => {
    let mounted = true
    bookingApi
      .getMyBookings()
      .then((data) => {
        if (mounted) setActiveBooking(data.find((booking) => booking.status === 'InProgress') ?? data[0] ?? null)
      })
      .catch((error) => {
        console.error('Unable to fetch active trip', error)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Screen 17</p>
        <h1 className="text-4xl font-semibold text-slate-50">Active trip</h1>
        <p className="text-slate-300">Timer, live stats, map preview and quick actions.</p>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">Trip timer</p>
            <p className="text-6xl font-semibold text-slate-50">02:14:33</p>
            <p className="text-slate-400">
              {activeBooking
                ? `${activeBooking.vehicleModel} · ${new Date(activeBooking.startAt).toLocaleTimeString()}`
                : 'Đang chờ dữ liệu từ API'}
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-slate-400">
            <button type="button" className="rounded-full border border-rose-500/50 px-5 py-3 text-rose-200">
              Emergency contact
            </button>
            <button type="button" className="rounded-full border border-brand/60 bg-brand/10 px-5 py-3 font-semibold text-brand">
              End trip
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="text-xs uppercase text-slate-500">{stat.label}</p>
              <p className="text-3xl font-semibold text-slate-100">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm font-semibold text-slate-200">Map view</p>
            <div className="mt-3 h-64 rounded-2xl border border-dashed border-slate-700 bg-[radial-gradient(circle_at_top,#1e293b,#020617)]" />
          </div>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={`flex w-full flex-col rounded-2xl border border-slate-800 px-4 py-3 text-left ${action.accent}`}
              >
                <span className="text-sm font-semibold">{action.label}</span>
                <span className="text-xs">{action.detail}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ActiveTrip
