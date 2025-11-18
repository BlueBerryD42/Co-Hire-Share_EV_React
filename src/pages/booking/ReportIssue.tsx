import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingApi } from '@/services/booking/api'
import type { BookingDto } from '@/models/booking'

const categories = [
  { value: 'damage', label: 'Vehicle damage' },
  { value: 'malfunction', label: 'Malfunction' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'payment', label: 'Payment dispute' },
  { value: 'member', label: 'Member behavior' },
  { value: 'tech', label: 'App issue' },
  { value: 'other', label: 'Other' },
]

const priorities = ['Low', 'Medium', 'High', 'Urgent']

const ReportIssue = () => {
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [selectedBookingId, setSelectedBookingId] = useState<string>('')
  const [existingDamageMessage, setExistingDamageMessage] = useState<string>('Select a booking to review.')

  useEffect(() => {
    let mounted = true
    bookingApi
      .getMyBookings()
      .then((data) => {
        if (mounted) setBookings(data)
      })
      .catch((error) => {
        console.error('Unable to fetch bookings for report issue', error)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-8 bg-amber-50 p-8 text-black">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-black">Screen 40</p>
        <h1 className="text-4xl font-semibold text-black">Report issue</h1>
        <p className="text-black">Wizard style form with visual categories and preview.</p>
      </header>

      <form className="space-y-6 rounded-3xl border border-slate-800 bg-amber-50 p-8">
        <label className="space-y-2 text-sm text-black">
          <span>Related to</span>
          <select
            className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3"
            value={selectedBookingId}
            onChange={(event) => {
              const bookingId = event.target.value
              setSelectedBookingId(bookingId)
              if (bookingId) {
                setExistingDamageMessage('Damage report APIs were removed from Booking service.')
              } else {
                setExistingDamageMessage('Select a booking to review.')
              }
            }}
          >
            <option value="">Select booking</option>
            {bookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                Booking {booking.id.slice(0, 8)} - {booking.vehicleModel}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-3">
          <span className="text-sm font-semibold text-black">Category</span>
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <button
                type="button"
                key={category.value}
                className="rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3 text-left text-sm text-black hover:border-brand/40"
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-sm font-semibold text-black">Priority</span>
          <div className="flex flex-wrap gap-3">
            {priorities.map((priority) => (
              <button
                key={priority}
                type="button"
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  priority === 'High' ? 'bg-amber-50 text-black' : 'bg-amber-50 text-black'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        <label className="space-y-2 text-sm text-black">
          <span>Description (min 20 characters)</span>
          <textarea rows={5} className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3" placeholder="Describe the incident in detail" />
        </label>

        <div className="space-y-2 text-sm text-black">
          <span>Attachments</span>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((slot) => (
              <div key={slot} className="flex min-h-[90px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-amber-50 text-xs text-black">
                <span>Photo {slot}</span>
                <button type="button" className="mt-2 rounded-full border border-slate-700 px-3 py-1">
                  Upload
                </button>
              </div>
            ))}
          </div>
        </div>

        <label className="space-y-2 text-sm text-black">
          <span>Contact preference</span>
          <select className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3">
            <option>Email</option>
            <option>Phone</option>
            <option>In-app</option>
          </select>
        </label>

        <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4 text-sm text-black">
          <p className="text-xs uppercase text-black">Preview</p>
          <p className="text-lg font-semibold text-black">Issue ID AI-0451</p>
          <p>Expected response: under 2h.</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4 text-sm text-black">
          <p className="text-xs uppercase text-black">Existing damage reports</p>
          <p>{existingDamageMessage}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="rounded-2xl border border-slate-700 px-6 py-3 text-black">
            Save draft
          </button>
          <button type="submit" className="rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-black">
            Submit issue
          </button>
        </div>
      </form>
      <div className="flex flex-wrap gap-3 text-sm text-black">
        <Link to="/booking/expenses" className="rounded-2xl bg-brand px-5 py-2 text-black font-semibold">
          Next: Expenses & Payments (Screen 18)
        </Link>
        <Link to="/booking/trip-history" className="rounded-2xl border border-slate-700 px-5 py-2">
          Back to Trip History
        </Link>
      </div>
    </section>
  )
}

export default ReportIssue
