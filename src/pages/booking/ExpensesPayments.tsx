import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingApi } from '@/services/booking/api'
import type { BookingDto } from '@/models/booking'

const statusStyles: Record<BookingDto['status'], string> = {
  Pending: 'bg-amber-50 text-black border border-slate-800',
  PendingApproval: 'bg-amber-50 text-black border border-slate-800',
  Confirmed: 'bg-amber-50 text-black border border-slate-800',
  InProgress: 'bg-amber-50 text-black border border-emerald-500/40',
  Completed: 'bg-amber-50 text-black border border-slate-800',
  Cancelled: 'bg-amber-50 text-black border border-rose-500/40',
  NoShow: 'bg-amber-50 text-black border border-rose-500/40',
}

const formatCurrency = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A'
  return `$${value.toFixed(2)}`
}

const formatDateLabel = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric',
      })
    : 'N/A'

const ExpensesPayments = () => {
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')

  useEffect(() => {
    let mounted = true
    setApiStatus('loading')
    bookingApi
      .getMyBookings()
      .then((data) => {
        if (!mounted) return
        setBookings(Array.isArray(data) ? data : [])
        setApiStatus('loaded')
      })
      .catch((error) => {
        console.error('Failed to fetch bookings for expenses', error)
        if (mounted) {
          setBookings([])
          setApiStatus('error')
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  const totalTripFee = useMemo(
    () => bookings.reduce((sum, booking) => sum + (booking.tripFeeAmount ?? 0), 0),
    [bookings],
  )
  const pendingCount = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.status === 'Pending' || booking.status === 'PendingApproval',
      ).length,
    [bookings],
  )
  const activeCount = useMemo(
    () => bookings.filter((booking) => booking.status === 'InProgress').length,
    [bookings],
  )

  const summaryCards = [
    {
      label: 'Total trip fee',
      value: formatCurrency(totalTripFee),
      sub: `${bookings.length} booking${bookings.length === 1 ? '' : 's'}`,
    },
    {
      label: 'Pending approvals',
      value: `${pendingCount}`,
      sub: 'Awaiting confirmation',
    },
    {
      label: 'Active trips',
      value: `${activeCount}`,
      sub: 'Currently in progress',
    },
  ]

  const lateFeeMessage = 'Late return fee data requires the finance API and is not yet available.'

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 bg-amber-50 p-8 text-black">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-black">Screen 18</p>
        <h1 className="text-4xl font-semibold text-black">Expenses and payments</h1>
        <p className="text-black">Financial snapshot plus table of shared costs.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-800 bg-amber-50 p-5">
            <p className="text-xs uppercase text-black">{card.label}</p>
            <p className="text-3xl font-semibold text-black">{card.value}</p>
            <p className="text-sm text-black">{card.sub}</p>
          </div>
        ))}
        <div className="rounded-2xl border border-slate-800 bg-amber-50 p-5">
          <p className="text-xs uppercase text-black">Bookings synced</p>
          <p className="text-3xl font-semibold text-black">
            {apiStatus === 'loading' ? '...' : bookings.length}
          </p>
          <p className="text-sm text-black">From /api/booking/my-bookings</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-amber-50 p-5 text-sm text-black">
        <p className="text-xs uppercase text-black">Late return fees</p>
        <p>{lateFeeMessage}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {['Date range', 'Category', 'Vehicle', 'Status'].map((label) => (
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

      <div className="rounded-3xl border border-slate-800 bg-amber-50">
        <div className="grid grid-cols-5 gap-4 border-b border-slate-800 px-6 py-4 text-xs uppercase tracking-wide text-black">
          <span>ID</span>
          <span>Date</span>
          <span>Vehicle</span>
          <span>Total</span>
          <span>Status</span>
        </div>
        {bookings.length === 0 ? (
          <div className="px-6 py-4 text-sm text-black">
            {apiStatus === 'loading'
              ? 'Loading bookings from /api/booking/my-bookings...'
              : 'No expense data available.'}
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="grid grid-cols-5 gap-4 border-b border-slate-900 px-6 py-4 text-sm text-black"
            >
              <span className="font-semibold">{booking.id.slice(0, 8)}</span>
              <span>{formatDateLabel(booking.startAt)}</span>
              <span>{booking.vehicleModel}</span>
              <span>
                {formatCurrency(booking.tripFeeAmount)}
                <span className="block text-xs text-black">
                  Start {formatDateLabel(booking.startAt)}
                </span>
              </span>
              <span
                className={`inline-flex h-fit w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyles[booking.status]
                }`}
              >
                {booking.status}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <button type="button" className="rounded-2xl bg-brand px-6 py-3 font-semibold text-black">
          Pay pending
        </button>
        <button type="button" className="rounded-2xl border border-slate-800 px-6 py-3 text-black">
          Export PDF
        </button>
        <button type="button" className="rounded-2xl border border-slate-800 px-6 py-3 text-black">
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-black">
        <Link to="/booking" className="rounded-2xl border border-slate-700 px-4 py-2">
          Back to Booking Suite
        </Link>
        <Link to="/booking/calendar" className="rounded-2xl bg-brand px-4 py-2 font-semibold text-black">
          Plan Next Booking (Screen 12)
        </Link>
      </div>
    </section>
  )
}

export default ExpensesPayments
