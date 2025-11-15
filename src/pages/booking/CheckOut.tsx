import { useEffect, useState } from 'react'
import { bookingApi } from '@/services/booking/api'
import type { BookingDto } from '@/models/booking'

const summary = {
  mileage: { start: '32,118 km', end: '32,482 km', delta: '+364 km' },
  battery: { start: '92%', end: '38%', delta: '-54%' },
}

const CheckOut = () => {
  const [latestBooking, setLatestBooking] = useState<BookingDto | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    bookingApi
      .getMyBookings()
      .then((data) => {
        if (!mounted) return
        setLatestBooking(data[0] ?? null)
        setMessage(data[0] ? `Last booking: ${data[0].vehicleModel}` : 'No bookings found')
      })
      .catch((error) => {
        console.error('Unable to fetch bookings for checkout', error)
        if (mounted) setMessage('Cannot load bookings from API.')
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Screen 16</p>
        <h1 className="text-4xl font-semibold text-slate-50">Vehicle check-out</h1>
        <p className="text-slate-300">Side by side comparisons and closing summary.</p>
      </header>

      {message && <p className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs text-slate-400">{message}</p>}

      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
        <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-4">
          {['Scan QR', 'Photos', 'Odometer', 'Battery'].map((step) => (
            <span key={step} className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-center text-emerald-100">
              {step} done
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {Object.entries(summary).map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-sm uppercase text-slate-500">{key === 'mileage' ? 'Distance' : 'Battery'}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-500">Before</p>
                  <p className="text-lg font-semibold text-slate-100">{value.start}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-500">After</p>
                  <p className="text-lg font-semibold text-slate-100">{value.end}</p>
                </div>
              </div>
              <p className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                key === 'mileage' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'
              }`}>
                {value.delta}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm font-semibold text-slate-200">Cost summary</p>
          <div className="mt-3 grid gap-4 text-sm text-slate-300 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-xs text-slate-500">Distance</p>
              <p className="text-xl font-semibold text-slate-100">364 km</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-xs text-slate-500">Energy</p>
              <p className="text-xl font-semibold text-slate-100">74 kWh</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-xs text-slate-500">Estimate</p>
              <p className="text-xl font-semibold text-slate-100">$63.40</p>
            </div>
          </div>
        </div>

        <label className="mt-6 block text-sm text-slate-300">
          <span>Issue report (optional)</span>
          <textarea rows={4} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3" placeholder="Example: small scratch on rear door" />
        </label>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">Wrap up</p>
            <p className="text-lg font-semibold text-slate-100">Ready to submit check-out</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="rounded-2xl border border-slate-700 px-4 py-2 text-slate-200">
              Save draft
            </button>
            <button type="button" className="rounded-2xl bg-brand px-6 py-2 text-slate-950 font-semibold">
              Confirm return
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CheckOut
