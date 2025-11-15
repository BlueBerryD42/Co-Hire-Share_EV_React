import { useEffect, useState } from 'react'
import { bookingApi } from '@/services/booking/api'
import type { BookingCalendarResponse } from '@/models/booking'

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type CalendarStatus = 'mine' | 'others' | 'conflict' | 'idle'

const bookingSlots: { date: string; label: string; owner: string; type: CalendarStatus; time: string }[] = [
  { date: '2025-03-04', label: 'Client pitch', owner: 'You', type: 'mine', time: '09:00 - 12:00' },
  { date: '2025-03-06', label: 'Kiet - charging', owner: 'Kiet', type: 'others', time: '14:00 - 18:00' },
  { date: '2025-03-09', label: 'Family trip', owner: 'You', type: 'mine', time: '08:00 - 20:00' },
  { date: '2025-03-12', label: 'Prototype filming', owner: 'Quan', type: 'conflict', time: '07:00 - 16:00' },
  { date: '2025-03-15', label: 'Thuong - charging', owner: 'Thuong', type: 'others', time: '10:00 - 12:00' },
  { date: '2025-03-19', label: 'Business trip', owner: 'You', type: 'mine', time: '06:00 - 22:00' },
  { date: '2025-03-22', label: 'KYC photo shoot', owner: 'Nguyen', type: 'others', time: '09:00 - 17:00' },
  { date: '2025-03-25', label: 'Vehicle review', owner: 'Phong', type: 'others', time: '13:00 - 17:00' },
  { date: '2025-03-28', label: 'Weekend trip', owner: 'You', type: 'mine', time: 'All day' },
]

type CalendarCell = {
  iso: string
  label: number
  monthType: 'previous' | 'current' | 'next'
  status: CalendarStatus
  event?: (typeof bookingSlots)[number]
}

const buildCalendar = (): CalendarCell[] => {
  const matrix = []
  const year = 2025
  const month = 2
  const firstDay = new Date(year, month, 1)
  const firstWeekDay = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  for (let i = 0; i < 42; i += 1) {
    const dayNumber = i - firstWeekDay + 1
    const date = new Date(year, month, dayNumber)
    const iso = date.toISOString().slice(0, 10)
    const event = bookingSlots.find((slot) => slot.date === iso)

    const monthType: CalendarCell['monthType'] =
      dayNumber < 1 ? 'previous' : dayNumber > daysInMonth ? 'next' : 'current'

    matrix.push({
      iso,
      label: date.getDate(),
      monthType,
      status: event ? event.type : 'idle',
      event,
    })
  }

  return matrix
}

const legendItems = [
  { label: 'Your booking', className: 'bg-brand/20 text-brand border border-brand/40' },
  { label: 'Co-owner booking', className: 'bg-slate-800 text-slate-200 border border-slate-700' },
  { label: 'Available slot', className: 'bg-slate-900 text-slate-500 border border-dashed border-slate-700' },
  { label: 'Conflict', className: 'bg-transparent text-rose-300 border border-rose-500' },
]

const BookingCalendar = () => {
  const calendar = buildCalendar()
  const [vehicleId, setVehicleId] = useState<string>('')
  const [calendarData, setCalendarData] = useState<BookingCalendarResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!vehicleId) return
    let isMounted = true
    setLoading(true)
    bookingApi
      .getCalendar(vehicleId)
      .then((data) => {
        if (isMounted) setCalendarData(data)
      })
      .catch((error) => {
        console.error('Failed to load calendar', error)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [vehicleId])

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Screen 12</p>
            <h1 className="text-3xl font-semibold text-slate-50">Booking calendar</h1>
            <p className="max-w-2xl text-slate-300">
              Month grid with fairness indicator, quick filters and drag to create booking guidance.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">API Calendar</span>
              <span className="font-semibold text-slate-100">
                {loading ? 'Syncing...' : calendarData?.totalBookings ?? 0}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-brand"
                style={{
                  width: `${Math.min(100, (calendarData?.confirmedBookings ?? 0) * 10)}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {calendarData
                ? `Vehicle ${calendarData.vehicleId.slice(0, 8)} • ${calendarData.confirmedBookings} confirmed`
                : 'Select a vehicle to load live bookings'}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-xs">
          {legendItems.map((item) => (
            <span key={item.label} className={`rounded-full px-3 py-1 ${item.className}`}>
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Vehicle</span>
          <select
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
            value={vehicleId}
            onChange={(event) => setVehicleId(event.target.value)}
          >
            <option value="">Select vehicle</option>
            <option value="00000000-0000-0000-0000-000000000001">Tesla Model 3</option>
            <option value="00000000-0000-0000-0000-000000000002">Kia EV6</option>
          </select>
        </label>
        {['Co-owner', 'My bookings only', 'View'].map((label) => (
          <label key={label} className="space-y-2 text-sm text-slate-300">
            <span>{label}</span>
            <select className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              <option>All</option>
              <option>Option A</option>
              <option>Option B</option>
            </select>
          </label>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/40">
        <div className="flex flex-col gap-2 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Month</p>
            <p className="text-2xl font-semibold text-slate-50">March 2025</p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full border border-slate-800 p-2 hover:border-brand hover:text-brand" type="button">
              Prev
            </button>
            <button className="rounded-full border border-slate-800 p-2 hover:border-brand hover:text-brand" type="button">
              Next
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wide text-slate-400">
          {weekDays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2 text-sm">
          {calendar.map((day) => {
            const isToday = day.iso === '2025-03-10'
            const statusStyles = {
              mine: 'border border-brand/70 bg-brand/15',
              others: 'border border-slate-800 bg-slate-900/70 text-slate-300',
              conflict: 'border border-rose-500 bg-slate-900/30 text-rose-200',
              idle: 'border border-dashed border-slate-800 text-slate-500',
            }
            const cardClass =
              statusStyles[day.status as keyof typeof statusStyles] ?? statusStyles.idle

            return (
              <div
                key={day.iso}
                className={`min-h-[110px] rounded-2xl p-3 ${cardClass} ${day.monthType !== 'current' ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{day.label}</span>
                  {isToday && <span className="h-2 w-2 rounded-full bg-brand" />}
                </div>
                {day.event ? (
                  <div className="mt-3 rounded-xl bg-slate-950/60 px-2 py-1 text-xs">
                    <p className="font-semibold">{day.event.label}</p>
                    <p className="text-slate-400">{day.event.time}</p>
                  </div>
                ) : (
                  <p className="mt-6 text-xs text-slate-500">Available</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default BookingCalendar
