import { useEffect, useMemo, useState } from 'react'
import { bookingApi } from '@/services/booking/api'
import { bookingTemplatesApi } from '@/services/booking/templates'
import type { CreateBookingDto } from '@/models/booking'
import type { BookingTemplateResponse } from '@/models/bookingExtras'

const initialForm = {
  vehicle: 'Tesla Model 3 Performance',
  date: '2025-03-18',
  start: '08:00',
  end: '15:00',
  repeat: 'none',
  purpose: 'Business',
  distance: 120,
  notes: '',
}

const repeatOptions = [
  { value: 'none', label: 'No repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
]

const vehicleMap: Record<string, string> = {
  'Tesla Model 3 Performance': '00000000-0000-0000-0000-000000000001',
  'Kia EV6 GT-Line': '00000000-0000-0000-0000-000000000002',
}

type FormState = typeof initialForm

const CreateBooking = () => {
  const [form, setForm] = useState(initialForm)
  const [purpose, setPurpose] = useState('Business')
  const [templates, setTemplates] = useState<BookingTemplateResponse[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [templateMessage, setTemplateMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    bookingTemplatesApi
      .getTemplates()
      .then((data) => {
        if (mounted) setTemplates(data)
      })
      .catch((error) => {
        console.error('Failed to load booking templates', error)
        if (mounted) setTemplateMessage('Không thể tải template từ API.')
      })
    return () => {
      mounted = false
    }
  }, [])

  const duration = useMemo(() => {
    const [startHour, startMin] = form.start.split(':').map(Number)
    const [endHour, endMin] = form.end.split(':').map(Number)
    const hours = endHour + endMin / 60 - (startHour + startMin / 60)
    if (Number.isNaN(hours) || hours <= 0) return 0
    return hours
  }, [form.start, form.end])

  const usageWarning = duration > 8 ? 'Longer than 8 hours, fairness impact is higher.' : null
  const conflict = form.date === '2025-03-18'

  const updateForm = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const applyTemplate = (template: BookingTemplateResponse) => {
    const preferredHour = template.preferredStartTime.substring(0, 5)
    setForm((prev) => ({
      ...prev,
      start: preferredHour,
      end: form.end,
      purpose: template.purpose ?? prev.purpose,
      notes: template.notes ?? prev.notes,
    }))
    setPurpose(template.purpose ?? purpose)
    setTemplateMessage(`Áp dụng template "${template.name}" với ưu tiên ${template.priority}.`)
  }

  const handleSubmit = async () => {
    const vehicleId = vehicleMap[form.vehicle] ?? form.vehicle
    if (!vehicleId) {
      setServerMessage('Vehicle ID is missing')
      setSubmissionStatus('error')
      return
    }

    const buildIso = (date: string, time: string) => new Date(`${date}T${time}:00`).toISOString()
    const payload: CreateBookingDto = {
      vehicleId,
      startAt: buildIso(form.date, form.start),
      endAt: buildIso(form.date, form.end),
      notes: form.notes,
      purpose,
      isEmergency: false,
      priority: 'Normal',
    }

    setSubmissionStatus('submitting')
    setServerMessage('Sending to /api/booking …')
    try {
      const booking = await bookingApi.create(payload)
      setSubmissionStatus('success')
      setServerMessage(`Created booking ${booking.id.slice(0, 8)} for ${booking.vehicleModel}`)
    } catch (error) {
      console.error('Failed to create booking', error)
      setSubmissionStatus('error')
      setServerMessage('Failed to create booking. Check console for details.')
    }
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Screen 13</p>
        <h1 className="text-4xl font-semibold text-slate-50">Create booking</h1>
        <p className="text-slate-300">Full width form with warnings and live summary.</p>
      </header>

      {conflict && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Conflict with Quan (07:00 - 12:00).</p>
          <p>Pick another slot or request a swap.</p>
        </div>
      )}

      {usageWarning && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          {usageWarning}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <form className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
          <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            <span>Vehicle</span>
              <select
                value={form.vehicle}
                onChange={(e) => updateForm('vehicle', e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
              >
                <option>Tesla Model 3 Performance</option>
                <option>Kia EV6 GT-Line</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Start date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateForm('date', e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Start time</span>
              <input
                type="time"
                value={form.start}
                onChange={(e) => updateForm('start', e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>End time</span>
              <input
                type="time"
                value={form.end}
                onChange={(e) => updateForm('end', e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            <span>Repeat</span>
            <div className="grid gap-3 sm:grid-cols-3">
              {repeatOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    form.repeat === option.value
                      ? 'border-brand bg-brand/20 text-brand'
                      : 'border-slate-800 text-slate-400 hover:border-brand/40'
                  }`}
                  onClick={() => updateForm('repeat', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </label>

          <label className="space-y-2 text-sm text-slate-300">
            <span>Purpose</span>
            <select
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value)
                updateForm('purpose', e.target.value)
              }}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
            >
              <option>Personal</option>
              <option>Business</option>
              <option>Other</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-300">
            <span>Estimated distance (km)</span>
            <input
              type="number"
              value={form.distance}
              onChange={(e) => updateForm('distance', Number(e.target.value))}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-300">
            <span>Notes</span>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
              placeholder="Add context for other co-owners"
            />
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submissionStatus === 'submitting'}
            className="w-full rounded-2xl bg-brand/90 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submissionStatus === 'submitting' ? 'Creating…' : 'Create booking'}
          </button>
          {serverMessage && (
            <p className="text-xs text-slate-400" aria-live="polite">
              {serverMessage}
            </p>
          )}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
            <p className="text-slate-200">Booking templates (API)</p>
            <p>{templates.length} template(s) loaded.</p>
            <select
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2"
              value={selectedTemplateId}
              onChange={(event) => {
                const templateId = event.target.value
                setSelectedTemplateId(templateId)
                const selected = templates.find((template) => template.id === templateId)
                if (selected) {
                  applyTemplate(selected)
                }
              }}
            >
              <option value="">Chọn template để áp dụng</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} · {template.duration}
                </option>
              ))}
            </select>
            {templateMessage && <p className="mt-2">{templateMessage}</p>}
          </div>
        </form>

        <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Preview</p>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
              <p className="text-lg font-semibold text-slate-50">{form.vehicle}</p>
              <p>
                {form.date} · {form.start} - {form.end}
              </p>
              <p className="text-slate-400">
                {duration}h · {purpose}
              </p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase text-slate-500">Fairness impact</p>
              <p className="text-lg font-semibold text-slate-100">+4.2%</p>
              <p className="text-slate-400">Compared to personal quota</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase text-slate-500">Charging suggestion</p>
              <p className="text-slate-100">District 1 fast charge</p>
              <p className="text-slate-400">2.3 km away</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase text-slate-500">AI note</p>
              <p className="text-slate-200">Demand is low between 08:00 - 15:00.</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default CreateBooking
