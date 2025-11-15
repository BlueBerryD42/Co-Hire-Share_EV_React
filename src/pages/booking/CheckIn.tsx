import { useEffect, useState } from 'react'
import { bookingApi } from '@/services/booking/api'
import { checkInApi } from '@/services/booking/checkIn'
import { vehicleQrApi } from '@/services/booking/vehicleQr'
import type { BookingDto } from '@/models/booking'
import type { CheckInRecordDetailDto } from '@/models/bookingExtras'

const steps = [
  { id: 1, label: 'Scan QR', status: 'done' },
  { id: 2, label: 'Photos', status: 'current' },
  { id: 3, label: 'Odometer', status: 'pending' },
  { id: 4, label: 'Battery', status: 'pending' },
  { id: 5, label: 'Damage notes', status: 'pending' },
  { id: 6, label: 'Confirm', status: 'pending' },
]

const photoAngles = ['Front', 'Back', 'Left', 'Right']

const CheckIn = () => {
  const [bookingId, setBookingId] = useState<string>('')
  const [booking, setBooking] = useState<BookingDto | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string | null>(null)
  const [history, setHistory] = useState<CheckInRecordDetailDto[]>([])
  const [historyMessage, setHistoryMessage] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!booking) return
    checkInApi
      .filterHistory({ vehicleId: booking.vehicleId })
      .then((records) => {
        setHistory(records)
        setHistoryMessage(`Fetched ${records.length} check-in records for vehicle ${booking.vehicleId.slice(0, 8)}.`)
      })
      .catch((error) => {
        console.error('Failed to load check-in history', error)
        setHistoryMessage('Không thể tải lịch sử check-in.')
      })
  }, [booking])

  const handleStartTrip = async () => {
    if (!booking) return
    setMessage('Đang gửi StartTrip tới API…')
    try {
      await checkInApi.startTrip({
        bookingId: booking.id,
        odometerReading: 32118,
        notes: 'Started trip from UI mock',
      })
      setMessage('StartTrip request sent successfully (check logs server).')
    } catch (error) {
      console.error('StartTrip failed', error)
      setMessage('StartTrip failed.')
    }
  }

  const handleGenerateQr = async () => {
    if (!booking) return
    try {
      const qr = await vehicleQrApi.getQrAsDataUrl(booking.vehicleId)
      setQrDataUrl(qr.payload)
      setMessage(`QR loaded, expires at ${new Date(qr.expiresAt).toLocaleTimeString()}`)
    } catch (error) {
      console.error('QR fetch failed', error)
      setMessage('Không thể lấy QR của xe.')
    }
  }

  const handleLoadBooking = async () => {
    if (!bookingId) {
      setMessage('Nhập BookingId trước khi load.')
      return
    }
    setLoading(true)
    setMessage('Đang tải booking...')
    try {
      const data = await bookingApi.getBooking(bookingId)
      setBooking(data)
      setMessage(`Đã tải ${data.vehicleModel}`)
    } catch (error) {
      console.error('Failed to load booking for check-in', error)
      setMessage('Không thể tải booking, xem console để biết thêm.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Screen 15</p>
        <h1 className="text-4xl font-semibold text-slate-50">Vehicle check-in</h1>
        <p className="text-slate-300">Full screen style with progress chips and large confirm button.</p>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-sm font-semibold text-slate-200">Sync booking từ API</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm"
            placeholder="Nhập BookingId (GUID)"
          />
          <button
            type="button"
            onClick={handleLoadBooking}
            className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Load booking'}
          </button>
        </div>
        {message && <p className="mt-2 text-xs text-slate-400">{message}</p>}
        {booking && (
          <p className="mt-1 text-xs text-slate-400">
            Vehicle: {booking.vehicleModel} · {new Date(booking.startAt).toLocaleString()}
          </p>
        )}
      </div>
      {historyMessage && <p className="text-xs text-slate-400">{historyMessage}</p>}

      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-slate-400">
          {steps.map((step) => (
            <span
              key={step.id}
              className={`rounded-full px-4 py-1 ${
                step.status === 'done'
                  ? 'bg-emerald-500/20 text-emerald-200'
                  : step.status === 'current'
                    ? 'bg-brand/30 text-brand'
                    : 'bg-slate-900 text-slate-500'
              }`}
            >
              {step.id}. {step.label}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center">
              <p className="text-sm text-slate-400">Scan the QR on the windshield</p>
              <div className="mt-4 flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950">
                <div className="h-32 w-32 border-2 border-dashed border-brand/60" />
              </div>
              <p className="mt-3 text-xs text-slate-500">Hold steady inside the frame</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-sm font-semibold text-slate-200">Odometer</p>
              <div className="mt-3 flex items-center gap-3">
                <button className="rounded-xl border border-slate-700 px-3 py-2 text-lg">-</button>
                <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-center text-2xl font-semibold">
                  32,118 km
                </div>
                <button className="rounded-xl border border-slate-700 px-3 py-2 text-lg">+</button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-200">Four angle photos</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {photoAngles.map((angle) => (
                  <div
                    key={angle}
                    className="flex h-28 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 text-xs text-slate-400"
                  >
                    <span>{angle}</span>
                    <button type="button" className="mt-2 rounded-full border border-slate-700 px-3 py-1 text-[11px]">
                      Capture or retake
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-sm font-semibold text-slate-200">Battery</p>
              <div className="mt-3 flex items-center gap-3">
                <input type="range" min="0" max="100" defaultValue="92" className="h-1 flex-1 accent-brand" />
                <span className="text-2xl font-semibold text-brand">92%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            <span>Damage notes</span>
            <textarea rows={4} className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3" placeholder="No scratches detected" />
          </label>
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-400">
            Optional extra photos can be attached here.
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-2xl bg-brand px-6 py-4 text-center text-lg font-semibold text-slate-950"
            type="button"
            onClick={handleStartTrip}
            disabled={!booking}
          >
            Confirm and start trip
          </button>
          <button
            className="rounded-2xl border border-brand px-6 py-4 text-center text-lg font-semibold text-brand"
            type="button"
            onClick={handleGenerateQr}
            disabled={!booking}
          >
            Load vehicle QR
          </button>
        </div>
        {qrDataUrl && (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Vehicle QR (dataUrl from /api/vehicle/&#123;id&#125;/qr)</p>
            <img src={qrDataUrl} alt="Vehicle QR" className="h-32 w-32 rounded-lg border border-slate-800 bg-slate-950 p-2" />
          </div>
        )}
        {history.length > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-400">
            <p className="font-semibold text-slate-200">Latest check-in record</p>
            <p>ID: {history[0].record.id}</p>
            <p>Type: {history[0].record.type}</p>
            <p>Captured at: {history[0].record.createdAt}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default CheckIn
