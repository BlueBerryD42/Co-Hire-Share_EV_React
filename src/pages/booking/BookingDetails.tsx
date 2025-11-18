import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { bookingApi } from '@/services/booking/api'
import type { BookingDto } from '@/models/booking'

type BookingStatus = 'Upcoming' | 'Active' | 'Completed' | 'Cancelled'

type Booking = {
  vehicle: string
  status: BookingStatus
  date: string
  time: string
  duration: string
  purpose: string
  checkIn: {
    time: string
    odometer: string
    battery: string
    photos: string[]
  }
  checkOut: null | {
    time: string
    odometer: string
    battery: string
    differences?: {
      distance: string
      battery: string
    }
  }
  cost: {
    distance: string
    energy: string
    estimate: string
  }
}

const bookingMap: Record<string, Booking> = {
  'BK-2034': {
    vehicle: 'Tesla Model 3 Performance',
    status: 'Upcoming',
    date: '18 Mar 2025',
    time: '08:00 - 15:00',
    duration: '7h',
    purpose: 'Business demo',
    checkIn: {
      time: '18 Mar 07:45',
      odometer: '32,120 km',
      battery: '92%',
      photos: ['Front', 'Back', 'Left', 'Right'],
    },
    checkOut: null,
    cost: {
      distance: '125 km',
      energy: '52 kWh',
      estimate: '$42.60',
    },
  },
  'BK-1995': {
    vehicle: 'Kia EV6 GT-Line',
    status: 'Completed',
    date: '08 Mar 2025',
    time: '06:00 - 12:00',
    duration: '6h',
    purpose: 'Family trip',
    checkIn: {
      time: '08 Mar 05:50',
      odometer: '28,502 km',
      battery: '88%',
      photos: ['Front', 'Back', 'Left', 'Right'],
    },
    checkOut: {
      time: '08 Mar 12:05',
      odometer: '28,690 km',
      battery: '41%',
      differences: {
        distance: '+188 km',
        battery: '-47%',
      },
    },
    cost: {
      distance: '188 km',
      energy: '61 kWh',
      estimate: '$57.10',
    },
  },
}

const statusStyles: Record<BookingStatus, string> = {
  Upcoming: 'bg-brand/20 text-black border border-brand/30',
  Active: 'bg-amber-50 text-black border border-emerald-500/30',
  Completed: 'bg-amber-50 text-black border border-emerald-500/30',
  Cancelled: 'bg-amber-50 text-black border border-rose-500/30',
}

const BookingDetails = () => {
  const params = useParams<{ bookingId?: string }>()
  const navigate = useNavigate()
  const bookingKey = params.bookingId ?? 'BK-2034'
  const fallbackBooking = bookingMap[bookingKey] ?? bookingMap['BK-2034']
  const [remoteBooking, setRemoteBooking] = useState<BookingDto | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState<string>('User cancelled in UI')

  useEffect(() => {
    let active = true
    setLoading(true)
    bookingApi
      .getBooking(bookingKey)
      .then((data) => {
        if (active) {
          setRemoteBooking(data)
          setError(null)
        }
      })
      .catch((err) => {
        console.warn('Unable to fetch booking from API', err)
        if (active) setError('Không thể tải dữ liệu thật, hiển thị bản mẫu.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [bookingKey])

  const handleCancel = async () => {
    setActionMessage('Đang gửi yêu cầu huỷ booking…')
    try {
      const targetId = remoteBooking?.id ?? bookingKey
      const updated = await bookingApi.cancelBooking(targetId, { reason: cancelReason })
      setRemoteBooking(updated)
      setActionMessage('Booking đã được huỷ thành công.')
      setTimeout(() => navigate('/booking/calendar'), 800)
    } catch (err) {
      console.error('Cancel booking failed', err)
      setActionMessage('Huỷ booking thất bại.')
    }
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 bg-amber-50 p-8 text-black">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-black">Screen 14 - {bookingKey}</p>
        <h1 className="text-4xl font-semibold text-black">Booking details</h1>
        <p className="text-black">Vehicle information, timeline and context aware actions.</p>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-amber-50 p-8">
        {loading && <p className="text-xs text-black">Loading booking from API…</p>}
        {error && <p className="text-xs text-black">{error}</p>}
        {remoteBooking && (
          <div className="mb-4 rounded-2xl border border-slate-800 bg-amber-50 p-4 text-sm text-black">
            <p className="text-xs uppercase text-black">Live data</p>
            <p className="text-lg font-semibold text-black">{remoteBooking.vehicleModel}</p>
            <p>
              {new Date(remoteBooking.startAt).toLocaleString()} -{' '}
              {new Date(remoteBooking.endAt).toLocaleTimeString()}
            </p>
            <p>Status: {remoteBooking.status}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/booking/check-in?bookingId=${bookingKey}`}
            className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-black"
          >
            Next: Check-In (Screen 15)
          </Link>
          <Link
            to={`/booking/trip-history?bookingId=${bookingKey}`}
            className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-black"
          >
            View Trip History
          </Link>
          <Link
            to={`/booking/report-issue?bookingId=${bookingKey}`}
            className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-black"
          >
            Report Issue
          </Link>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-black">Vehicle</p>
            <p className="text-2xl font-semibold text-black">{fallbackBooking.vehicle}</p>
            <p className="text-black">
              {fallbackBooking.date} - {fallbackBooking.time}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
            statusStyles[fallbackBooking.status]
          }`}>
            {fallbackBooking.status}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4">
            <p className="text-xs uppercase text-black">Duration</p>
            <p className="text-2xl font-semibold text-black">{fallbackBooking.duration}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4">
            <p className="text-xs uppercase text-black">Purpose</p>
            <p className="text-xl font-semibold text-black">{fallbackBooking.purpose}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4">
            <p className="text-xs uppercase text-black">Cost estimate</p>
            <p className="text-xl font-semibold text-black">{fallbackBooking.cost.estimate}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-black">Check-in</p>
            <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4">
              <p className="text-black">{fallbackBooking.checkIn.time}</p>
              <p className="text-black">
                Odometer {fallbackBooking.checkIn.odometer} - Battery {fallbackBooking.checkIn.battery}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-black">
                {fallbackBooking.checkIn.photos.map((photo) => (
                  <span key={photo} className="rounded-xl border border-dashed border-slate-700 px-3 py-2">
                    {photo} view
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-black">Check-out</p>
            {fallbackBooking.checkOut ? (
              <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4">
                <p className="text-black">{fallbackBooking.checkOut.time}</p>
                <p className="text-black">
                  Odometer {fallbackBooking.checkOut.odometer} - Battery {fallbackBooking.checkOut.battery}
                </p>
                {fallbackBooking.checkOut.differences && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <span className="rounded-xl bg-amber-50 px-3 py-2 text-black">
                      Distance {fallbackBooking.checkOut.differences.distance}
                    </span>
                    <span className="rounded-xl bg-amber-50 px-3 py-2 text-black">
                      Battery {fallbackBooking.checkOut.differences.battery}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-amber-50 p-4 text-black">
                Not checked out yet.
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-amber-50 p-5">
          <p className="text-xs uppercase text-black">Actions</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {fallbackBooking.status === 'Upcoming' && (
              <>
                <Link
                  to="/booking/create"
                  className="rounded-2xl border border-slate-800 px-4 py-2 text-black hover:border-brand hover:text-black"
                >
                  Edit booking
                </Link>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-2xl border border-rose-500/40 px-4 py-2 text-black"
                >
                  Cancel booking
                </button>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-2 text-sm text-black"
                  placeholder="Reason for cancellation"
                />
                <button type="button" className="rounded-2xl border border-slate-800 px-4 py-2 text-black">
                  Add to calendar
                </button>
              </>
            )}
            {fallbackBooking.status === 'Active' && (
              <Link to="/booking/check-out" className="rounded-2xl bg-brand/80 px-4 py-2 font-semibold text-black">
                Check out now
              </Link>
            )}
            {fallbackBooking.status === 'Completed' && (
              <Link
                to="/booking/trip-history"
                className="rounded-2xl border border-slate-800 px-4 py-2 text-black hover:border-brand hover:text-black"
              >
                View trip history
              </Link>
            )}
          </div>
          {actionMessage && <p className="text-xs text-black">{actionMessage}</p>}
        </div>
      </div>
    </section>
  )
}

export default BookingDetails
