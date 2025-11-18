import { useEffect, useState } from 'react'
import { bookingApi } from '@/services/booking/api'

const SuccessFeedback = () => {
  const [toastMessage, setToastMessage] = useState<string>('Booking created successfully')
  const [preferencesMessage] = useState<string>('Notification preference API is disabled.')

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
  }, [])
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-8 bg-amber-50 p-8 text-black">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-black">Screen 68</p>
        <h1 className="text-4xl font-semibold text-black">Success feedback patterns</h1>
        <p className="text-black">Toast, modal, inline and banner references.</p>
      </header>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-amber-50 p-6">
          <p className="text-sm font-semibold text-black">1. Toast notification</p>
          <div className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-black">
            <span className="text-lg">✓</span>
            <div>
              <p className="font-semibold">{toastMessage}</p>
              <p className="text-xs text-black">Auto dismiss after 4 seconds</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-amber-50 p-6">
          <p className="text-sm font-semibold text-black">2. Success modal</p>
          <div className="mt-4 rounded-3xl border border-emerald-500/30 bg-amber-50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-2xl text-black">
              ✓
            </div>
            <h2 className="text-2xl font-semibold text-black">Success</h2>
            <p className="mt-2 text-black">Payment processed for BK-2034.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
              <button type="button" className="rounded-full border border-slate-700 px-4 py-2 text-black">
                Download receipt
              </button>
              <button type="button" className="rounded-full bg-brand px-6 py-2 font-semibold text-black">
                View booking
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-amber-50 p-6">
          <p className="text-sm font-semibold text-black">3. Inline success</p>
          <div className="mt-4 space-y-3 rounded-2xl border border-emerald-500/30 bg-amber-50 px-4 py-3 text-sm text-black">
            <p className="font-semibold">Looks good</p>
            <p>Vehicle field has been validated.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-amber-50 p-6">
          <p className="text-sm font-semibold text-black">4. Banner success</p>
          <div className="mt-4 rounded-2xl bg-amber-50 px-5 py-4 text-sm text-black">
            <div className="flex items-center justify-between">
              <p>Your documents are verified.</p>
              <button type="button" className="text-xs text-black">Dismiss</button>
            </div>
            <p className="mt-2 text-xs text-black">{preferencesMessage}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SuccessFeedback
