import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingApi } from '@/services/booking/api'
import { recurringBookingsApi } from '@/services/booking/recurring'
import type { BookingDto } from '@/models/booking'
import type { RecurringBookingDto } from '@/models/bookingExtras'

const bookingScreens = [
  {
    id: 12,
    title: 'Booking Calendar',
    description: 'Month/week/day schedule with co-owner colors and fairness bar.',
    href: '/booking/calendar',
    badge: 'Scheduling',
  },
  {
    id: 13,
    title: 'Create Booking',
    description: 'Form with conflict checks, fairness warning and live summary.',
    href: '/booking/create',
    badge: 'Form',
  },
  {
    id: 14,
    title: 'Booking Details',
    description: 'Status banner, timeline and actions per state.',
    href: '/booking/details/BK-2034',
    badge: 'Info',
  },
  {
    id: 15,
    title: 'Check-In',
    description: 'QR scan, 4-angle photos, odometer and battery capture.',
    href: '/booking/check-in',
    badge: 'Ops',
  },
  {
    id: 16,
    title: 'Check-Out',
    description: 'Before/after comparison, damage notes, cost preview.',
    href: '/booking/check-out',
    badge: 'Ops',
  },
  {
    id: 17,
    title: 'Active Trip',
    description: 'Large timer, live stats, safety shortcuts.',
    href: '/booking/active-trip',
    badge: 'Realtime',
  },
  {
    id: 18,
    title: 'Expenses & Payments',
    description: 'Summary cards, filters and list of shared costs.',
    href: '/booking/expenses',
    badge: 'Finance',
  },
  {
    id: 39,
    title: 'Trip History',
    description: 'Filterable timeline with check-in/out evidence.',
    href: '/booking/trip-history',
    badge: 'History',
  },
  {
    id: 40,
    title: 'Report Issue',
    description: 'Category, priority and attachment friendly form.',
    href: '/booking/report-issue',
    badge: 'Support',
  },
  {
    id: 60,
    title: 'AI Booking Recommendations',
    description: 'AI suggestions with confidence, fairness impact and CTA.',
    href: '/booking/ai-recommendations',
    badge: 'AI',
  },
  {
    id: 68,
    title: 'Success Feedback',
    description: 'Toast, modal, inline and banner patterns for booking flows.',
    href: '/booking/success-feedback',
    badge: 'Feedback',
  },
]

const BookingHub = () => {
  const [myBookings, setMyBookings] = useState<BookingDto[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [recurringBooking, setRecurringBooking] = useState<RecurringBookingDto | null>(null)
  const [recurringStatus, setRecurringStatus] = useState<string>('Chưa tạo')

  useEffect(() => {
    let isMounted = true
    bookingApi
      .getMyBookings()
      .then((data) => {
        if (isMounted) setMyBookings(data)
      })
      .catch((error) => {
        console.error('Failed to load my bookings', error)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const bookingCount = myBookings.length
  const pendingApprovals = myBookings.filter((booking) => booking.status === 'PendingApproval').length

  const handleCreateRecurring = async () => {
    setRecurringStatus('Đang tạo...')
    try {
      const created = await recurringBookingsApi.create({
        vehicleId: '00000000-0000-0000-0000-000000000001',
        groupId: '00000000-0000-0000-0000-0000000000ab',
        pattern: 'Weekly',
        daysOfWeek: ['Monday', 'Wednesday'],
        startTime: '08:00:00',
        endTime: '12:00:00',
        recurrenceStartDate: new Date().toISOString(),
        notes: 'Auto-created from hub',
      })
      setRecurringBooking(created)
      setRecurringStatus('Đã tạo mẫu recurring booking.')
    } catch (error) {
      console.error('Failed to create recurring booking', error)
      setRecurringStatus('Tạo recurring thất bại.')
    }
  }

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-10">
      <header className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg shadow-slate-950/40">
        <p className="text-xs uppercase tracking-wide text-brand">Booking squad</p>
        <h1 className="text-4xl font-semibold text-slate-50">Booking screen suite</h1>
        <p className="max-w-3xl text-slate-300">
          Central place for every booking-related screen so dev, QA and backend can open the
          right URL during integration. All designs follow the same warm minimalist palette.
        </p>
        <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs uppercase text-slate-500">Synced bookings</p>
            <p className="text-2xl font-semibold text-slate-50">
              {isLoading ? 'Syncing...' : bookingCount}
            </p>
            <p>From /api/booking/my-bookings</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs uppercase text-slate-500">Usage cap</p>
            <div className="mt-2 h-2 rounded-full bg-slate-800">
              <div className="h-full w-4/5 rounded-full bg-brand" />
            </div>
            <p className="mt-2">80 percent of March quota</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs uppercase text-slate-500">Pending approvals</p>
            <p className="text-lg font-semibold text-brand">
              {isLoading ? '...' : pendingApprovals}
            </p>
            <p>Waiting for admin action</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs uppercase text-slate-500">Recurring booking</p>
            <p className="text-slate-200">{recurringBooking ? recurringBooking.pattern : 'None'}</p>
            <button
              type="button"
              onClick={handleCreateRecurring}
              className="mt-2 rounded-lg border border-brand px-3 py-1 text-xs font-semibold text-brand"
            >
              Trigger create
            </button>
            <p className="mt-1 text-[11px] text-slate-500">{recurringStatus}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {bookingScreens.map((screen) => (
          <Link
            key={screen.id}
            to={screen.href}
            className="group relative flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 transition hover:border-brand hover:bg-slate-900/80"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Screen {screen.id} · {screen.badge}
            </span>
            <h2 className="text-2xl font-semibold text-slate-50 group-hover:text-brand">
              {screen.title}
            </h2>
            <p className="text-sm text-slate-300">{screen.description}</p>
            <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-brand">
              Open screen
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default BookingHub
