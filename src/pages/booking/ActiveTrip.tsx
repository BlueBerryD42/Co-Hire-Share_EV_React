import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingApi } from '@/services/booking/api'
import type { BookingDto } from '@/models/booking'

const stats = [
  { label: 'Elapsed time', value: '02:14:33', detail: 'Started 08:05' },
  { label: 'Distance', value: '126 km', detail: 'GPS tracking' },
  { label: 'Battery', value: '58%', detail: 'Estimated 112 km left' },
  { label: 'Estimated cost', value: '$34.10', detail: 'Updates every 5 min' },
]

const quickActions = [
  { label: 'Navigate', detail: 'Open Google Maps', accent: 'bg-brand/20 text-black' },
  { label: 'Find charging', detail: '3 nearby stations', accent: 'bg-amber-50 text-black' },
  { label: 'Emergency call', detail: '1900 9999', accent: 'bg-amber-50 text-black' },
  { label: 'Report issue', detail: 'Jump to screen 40', accent: 'bg-amber-50 text-black' },
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
    <section className="mx-auto flex max-w-5xl flex-col gap-8 bg-amber-50 p-8 text-black">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-black">Screen 17</p>
        <h1 className="text-4xl font-semibold text-black">Active trip</h1>
        <p className="text-black">Timer, live stats, map preview and quick actions.</p>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-amber-50 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase text-black">Trip timer</p>
            <p className="text-6xl font-semibold text-black">02:14:33</p>
            <p className="text-black">
              {activeBooking
                ? `${activeBooking.vehicleModel} · ${new Date(activeBooking.startAt).toLocaleTimeString()}`
                : 'Đang chờ dữ liệu từ API'}
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-black">
            <button type="button" className="rounded-full border border-rose-500/50 px-5 py-3 text-black">
              Emergency contact
            </button>
            <button type="button" className="rounded-full border border-brand/60 bg-brand/10 px-5 py-3 font-semibold text-black">
              End trip
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-800 bg-amber-50 p-4">
              <p className="text-xs uppercase text-black">{stat.label}</p>
              <p className="text-3xl font-semibold text-black">{stat.value}</p>
              <p className="text-sm text-black">{stat.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-black">Map view</p>
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
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-black">
          <Link to="/booking/check-out" className="rounded-2xl bg-brand px-5 py-2 text-black font-semibold">
            Next: Check-Out (Screen 16)
          </Link>
          <Link to="/booking/trip-history" className="rounded-2xl border border-slate-700 px-5 py-2">
            View Trip History
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ActiveTrip
