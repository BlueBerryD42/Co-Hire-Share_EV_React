import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingApi } from '@/services/booking/api'
import type { BookingDto } from '@/models/booking'

type TripStatus = 'Completed' | 'Cancelled' | string

const normalizeStatus = (status: BookingDto['status']): TripStatus => {
  if (typeof status === 'number') {
    if (status === 4) return 'Completed'
    if (status === 5) return 'Cancelled'
    return status.toString()
  }
  return status
}

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
  Completed: 'bg-amber-50 text-black',
  Cancelled: 'bg-amber-50 text-black',
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

  const apiHistory = useMemo(() => {
    return apiTrips
      .filter((booking) => {
        const status = normalizeStatus(booking.status)
        return status === 'Completed' || status === 'Cancelled'
      })
      .map((booking) => {
        const start = new Date(booking.startAt)
        const end = new Date(booking.endAt)
        const durationHours = Math.max((end.getTime() - start.getTime()) / 3_600_000, 0)
        const normalizedStatus = normalizeStatus(booking.status)
        return {
          id: booking.id,
          date: start.toLocaleDateString('vi-VN'),
          vehicle: booking.vehicleModel,
          duration: `${durationHours.toFixed(1)}h`,
          distance: booking.distanceKm ? `${booking.distanceKm} km` : '—',
          cost: booking.tripFeeAmount ? `$${booking.tripFeeAmount.toFixed(2)}` : '—',
          status: normalizedStatus,
          checkIn: {
            odo: '—',
            battery: `Priority ${booking.priority}`,
          },
          checkOut: {
            odo: '—',
            battery: booking.tripFeeAmount ? `$${booking.tripFeeAmount.toFixed(2)}` : '—',
          },
          issues:
            normalizedStatus === 'Cancelled'
              ? [booking.notes ? `Reason: ${booking.notes}` : 'Cancelled']
              : booking.requiresDamageReview
              ? ['Damage review required']
              : [],
        }
      })
  }, [apiTrips])

  const combinedTrips = [...apiHistory, ...trips]

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 bg-amber-50 p-8 text-black">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-black">Screen 39</p>
        <h1 className="text-4xl font-semibold text-black">Trip history</h1>
        <p className="text-black">Filters plus timeline cards with evidence.</p>
        <p className="text-xs text-black">
          {status === 'loading'
            ? 'Đang tải từ /api/booking/my-bookings...'
            : `API trả về ${apiTrips.length} booking`}
        </p>
      </header>
      <div className="flex flex-wrap gap-3 text-sm text-black">
        <Link to="/booking/report-issue" className="rounded-2xl border border-slate-700 px-4 py-2">
          Next: Report Issue (Screen 40)
        </Link>
        <Link to="/booking/expenses" className="rounded-2xl bg-brand px-4 py-2 font-semibold text-black">
          Go to Expenses (Screen 18)
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {['Date', 'Vehicle', 'Status'].map((label) => (
          <label key={label} className="space-y-2 text-sm text-black">
            <span>{label}</span>
            <select className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3">
              <option>All</option>
              <option>Option A</option>
              <option>Option B</option>
            </select>
          </label>
        ))}
      </div>

      <div className="space-y-4">
        {combinedTrips.length === 0 && (
          <p className="text-sm text-black">No completed or cancelled bookings yet.</p>
        )}
        {combinedTrips.map((trip) => (
          <article key={trip.id} className="rounded-3xl border border-slate-800 bg-amber-50 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase text-black">{trip.date}</p>
                <h2 className="text-2xl font-semibold text-black">
                  {trip.vehicle} - {trip.id}
                </h2>
                <p className="text-black">
                  {trip.duration} - {trip.distance}
                </p>
              </div>
              <span className={`inline-flex rounded-full px-4 py-1 text-xs font-semibold ${statusColors[trip.status]}`}>
                {trip.status}
              </span>
            </div>

            <div className="mt-4 grid gap-4 text-sm text-black md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4">
                <p className="text-xs uppercase text-black">Check-in</p>
                <p>Odo {trip.checkIn.odo}</p>
                <p>Battery {trip.checkIn.battery}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4">
                <p className="text-xs uppercase text-black">Check-out</p>
                <p>Odo {trip.checkOut.odo}</p>
                <p>Battery {trip.checkOut.battery}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4">
                <p className="text-xs uppercase text-black">Cost</p>
                <p className="text-2xl font-semibold text-black">{trip.cost}</p>
                {trip.issues.length > 0 ? (
                  <p className="text-black">Issues: {trip.issues.join(', ')}</p>
                ) : (
                  <p className="text-black">No issues</p>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3 text-center text-xs text-black">
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
