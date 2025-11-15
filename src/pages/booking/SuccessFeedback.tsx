import { useEffect, useState } from 'react'
import { bookingApi } from '@/services/booking/api'
import { notificationPreferencesApi } from '@/services/booking/notificationPreferences'
import type { BookingNotificationPreferenceDto } from '@/models/booking'

const SuccessFeedback = () => {
  const [toastMessage, setToastMessage] = useState<string>('Booking created successfully')
  const [preferences, setPreferences] = useState<BookingNotificationPreferenceDto | null>(null)

  useEffect(() => {
    bookingApi
      .getMyBookings()
      .then((bookings) => {
        if (bookings.length > 0) {
          setToastMessage(`Booking ${bookings[0].id.slice(0, 8)} created successfully`)
        }
      })
      .catch((error) => {
        console.error('Unable to fetch bookings for success feedback', error)
      })
    notificationPreferencesApi
      .getPreferences()
      .then(setPreferences)
      .catch((error) => {
        console.error('Unable to fetch notification preferences', error)
      })
  }, [])
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Screen 68</p>
        <h1 className="text-4xl font-semibold text-slate-50">Success feedback patterns</h1>
        <p className="text-slate-300">Toast, modal, inline and banner references.</p>
      </header>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm font-semibold text-slate-200">1. Toast notification</p>
          <div className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-emerald-500/20 px-4 py-3 text-sm text-emerald-100">
            <span className="text-lg">✓</span>
            <div>
              <p className="font-semibold">{toastMessage}</p>
              <p className="text-xs text-emerald-200">Auto dismiss after 4 seconds</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm font-semibold text-slate-200">2. Success modal</p>
          <div className="mt-4 rounded-3xl border border-emerald-500/30 bg-slate-950/70 p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-2xl text-emerald-200">
              ✓
            </div>
            <h2 className="text-2xl font-semibold text-slate-50">Success</h2>
            <p className="mt-2 text-slate-300">Payment processed for BK-2034.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
              <button type="button" className="rounded-full border border-slate-700 px-4 py-2 text-slate-200">
                Download receipt
              </button>
              <button type="button" className="rounded-full bg-brand px-6 py-2 font-semibold text-slate-950">
                View booking
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm font-semibold text-slate-200">3. Inline success</p>
          <div className="mt-4 space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <p className="font-semibold">Looks good</p>
            <p>Vehicle field has been validated.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm font-semibold text-slate-200">4. Banner success</p>
          <div className="mt-4 rounded-2xl bg-emerald-500/20 px-5 py-4 text-sm text-emerald-100">
            <div className="flex items-center justify-between">
              <p>Your documents are verified.</p>
              <button type="button" className="text-xs text-emerald-200">Dismiss</button>
            </div>
            {preferences && (
              <p className="mt-2 text-xs text-emerald-100">
                Preferences: reminders {preferences.enableReminders ? 'ON' : 'OFF'} · email{' '}
                {preferences.enableEmail ? 'ON' : 'OFF'} · sms {preferences.enableSms ? 'ON' : 'OFF'}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SuccessFeedback
