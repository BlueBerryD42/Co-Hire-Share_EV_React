import { useEffect, useState } from 'react'
import { bookingApi } from '@/services/booking/api'
import type { BookingDto } from '@/models/booking'

type TripStatus = 'Completed' | 'Cancelled'

const trips: {
  id: string
  date: string
  vehicle: string
  duration: string
  distance: string
  cost: string
  status: TripStatus
  checkIn: { odo: string; battery: string }
  checkOut: { odo: string; battery: string }
  issues: string[]
}[] = [
  {
    id: 'BK-1995',
    date: '08 Mar 2025',
    vehicle: 'Tesla Model 3',
    duration: '6h 05m',
    distance: '188 km',
    cost: '$57.10',
    status: 'Completed',
    checkIn: { odo: '28,502 km', battery: '88%' },
    checkOut: { odo: '28,690 km', battery: '41%' },
    issues: [],
  },
  {
    id: 'BK-1982',
    date: '02 Mar 2025',
    vehicle: 'Kia EV6',
    duration: '4h 20m',
    distance: '112 km',
    cost: '$33.20',
    status: 'Completed',
    checkIn: { odo: '18,303 km', battery: '79%' },
    checkOut: { odo: '18,415 km', battery: '54%' },
    issues: ['Minor scratch'],
  },
]

const statusColors: Record<TripStatus, string> = {
  Completed: 'bg-emerald-500/15 text-emerald-200',
  Cancelled: 'bg-rose-500/15 text-rose-200',
}

const TripHistory = () => {
  const [apiTrips, setApiTrips] = useState<BookingDto[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  useEffect(() => {
    let mounted = true
    setStatus('loading')
    bookingApi
      .getMyBookings()
      .then((data) => {
        if (mounted) {
          setApiTrips(data)
          setStatus('idle')
        }
      })
      .catch((error) => {
        console.error('TripHistory: unable to fetch bookings', error)
        if (mounted) setStatus('error')
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Screen 39</p>
        <h1 className="text-4xl font-semibold text-slate-50">Trip history</h1>
        <p className="text-slate-300">Filters plus timeline cards with evidence.</p>
        <p className="text-xs text-slate-500">
          {status === 'loading'
            ? 'Đang tải từ /api/booking/my-bookings...'
            : `API trả về ${apiTrips.length} booking`}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {['Date', 'Vehicle', 'Status'].map((label) => (
          <label key={label} className="space-y-2 text-sm text-slate-300">
            <span>{label}</span>
            <select className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
              <option>All</option>
              <option>Option A</option>
              <option>Option B</option>
            </select>
          </label>
        ))}
      </div>

      <div className="space-y-4">
        {trips.map((trip) => (
          <article key={trip.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500">{trip.date}</p>
                <h2 className="text-2xl font-semibold text-slate-50">
                  {trip.vehicle} - {trip.id}
                </h2>
                <p className="text-slate-400">
                  {trip.duration} - {trip.distance}
                </p>
              </div>
              <span className={`inline-flex rounded-full px-4 py-1 text-xs font-semibold ${statusColors[trip.status]}`}>
                {trip.status}
              </span>
            </div>

            <div className="mt-4 grid gap-4 text-sm text-slate-300 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase text-slate-500">Check-in</p>
                <p>Odo {trip.checkIn.odo}</p>
                <p>Battery {trip.checkIn.battery}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase text-slate-500">Check-out</p>
                <p>Odo {trip.checkOut.odo}</p>
                <p>Battery {trip.checkOut.battery}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase text-slate-500">Cost</p>
                <p className="text-2xl font-semibold text-slate-100">{trip.cost}</p>
                {trip.issues.length > 0 ? (
                  <p className="text-amber-200">Issues: {trip.issues.join(', ')}</p>
                ) : (
                  <p className="text-slate-500">No issues</p>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3 text-center text-xs text-slate-400">
              {['Front', 'Back', 'Left', 'Right'].map((angle) => (
                <div key={angle} className="rounded-xl border border-dashed border-slate-700 px-3 py-4">
                  Photo {angle}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TripHistory
