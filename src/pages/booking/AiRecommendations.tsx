import { useEffect, useState } from 'react'
import { bookingApi } from '@/services/booking/api'
import type { BookingSuggestionResponse } from '@/models/booking'

type StaticSuggestion = {
  label: string
  slot: string
  duration: string
  confidence: string
  impact: string
  reasoning: string
  weather: string
}

const staticSuggestions: StaticSuggestion[] = [
  {
    label: 'Best match',
    slot: 'Tue 18 Mar 13:00 - 15:00',
    duration: '2h',
    confidence: '92%',
    impact: '+1.4% fairness',
    reasoning: 'Low demand period that matches your usual pattern.',
    weather: 'Light clouds',
  },
  {
    label: 'Balanced usage',
    slot: 'Thu 20 Mar 07:00 - 10:00',
    duration: '3h',
    confidence: '88%',
    impact: '-0.8% fairness',
    reasoning: 'Balances with other co-owners and keeps morning habit.',
    weather: 'Sunny',
  },
  {
    label: 'Charging friendly',
    slot: 'Sat 22 Mar 05:00 - 08:00',
    duration: '3h',
    confidence: '81%',
    impact: '+0.2% fairness',
    reasoning: 'Close to an empty fast charging bay.',
    weather: 'Cool 26C',
  },
]

const AiRecommendations = () => {
  const [form, setForm] = useState({
    vehicleId: '00000000-0000-0000-0000-000000000001',
    preferredDate: new Date().toISOString().split('T')[0],
    durationHours: 2,
  })
  const [remoteSuggestions, setRemoteSuggestions] = useState<BookingSuggestionResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const fetchSuggestions = async () => {
    if (!form.vehicleId) {
      setStatusMessage('Select a vehicle first.')
      return
    }
    setLoading(true)
    setStatusMessage('Fetching suggestions from API…')
    try {
      const response = await bookingApi.getSuggestions({
        vehicleId: form.vehicleId,
        preferredDate: new Date(form.preferredDate).toISOString(),
        durationHours: form.durationHours,
      })
      setRemoteSuggestions(response)
      setStatusMessage(`Received ${response.suggestions.length} suggestions`)
    } catch (error) {
      console.error('Failed to fetch AI suggestions', error)
      setStatusMessage('Unable to fetch suggestions. Showing static data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuggestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const transformedRemoteSuggestions: StaticSuggestion[] | null = remoteSuggestions
    ? remoteSuggestions.suggestions.map((suggestion, index) => ({
        label: `Suggestion ${index + 1}`,
        slot: `${new Date(suggestion.startAt).toLocaleString()} - ${new Date(
          suggestion.endAt,
        ).toLocaleTimeString()}`,
        duration: `${Math.round(
          (new Date(suggestion.endAt).getTime() - new Date(suggestion.startAt).getTime()) / (1000 * 60),
        )} min`,
        confidence: suggestion.confidence ?? 'High',
        impact: suggestion.isOptimal ? 'Balances fairness' : 'Neutral impact',
        reasoning: 'Generated from availability window.',
        weather: '',
      }))
    : null

  const suggestionsToRender = transformedRemoteSuggestions ?? staticSuggestions

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Screen 60</p>
        <h1 className="text-4xl font-semibold text-slate-50">AI booking recommendations</h1>
        <p className="text-slate-300">Sheet style drawer with inputs on the left and cards on the right.</p>
      </header>

      <div className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 lg:grid-cols-[1.1fr,1fr]">
        <form className="space-y-4">
          <p className="text-sm font-semibold text-slate-200">Input preferences</p>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Vehicle</span>
            <select
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
              value={form.vehicleId}
              onChange={(event) => setForm((prev) => ({ ...prev, vehicleId: event.target.value }))}
            >
              <option value="00000000-0000-0000-0000-000000000001">Tesla Model 3</option>
              <option value="00000000-0000-0000-0000-000000000002">Kia EV6</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Preferred date</span>
            <input
              type="date"
              value={form.preferredDate}
              onChange={(event) => setForm((prev) => ({ ...prev, preferredDate: event.target.value }))}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Time of day</span>
            <select className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
              <option>Morning (05:00 - 11:00)</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Duration</span>
            <select
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
              value={form.durationHours}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, durationHours: Number(event.target.value) }))
              }
            >
              {[2, 3, 4, 8].map((hour) => (
                <option key={hour} value={hour}>
                  {hour}h
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Priority</span>
            <select className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
              <option>Fairness</option>
              <option>Prime time</option>
              <option>Charging ready</option>
            </select>
          </label>
          <button
            type="button"
            className="w-full rounded-2xl border border-brand/50 bg-brand/10 px-6 py-3 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50"
            onClick={fetchSuggestions}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Regenerate suggestions'}
          </button>
          {statusMessage && <p className="text-xs text-slate-400">{statusMessage}</p>}
        </form>

        <div className="space-y-4">
          {suggestionsToRender.map((suggestion) => (
            <div key={suggestion.slot} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-brand">{suggestion.label}</span>
                <span className="text-xs text-slate-400">Confidence {suggestion.confidence}</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-50">{suggestion.slot}</p>
              <p className="text-sm text-slate-300">{suggestion.duration} - {suggestion.weather}</p>
              <p className="mt-2 text-xs font-semibold text-emerald-200">{suggestion.impact}</p>
              <p className="mt-2 text-sm text-slate-400">{suggestion.reasoning}</p>
              <button type="button" className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand/90 px-4 py-1 text-xs font-semibold text-slate-950">
                Book this slot
              </button>
            </div>
          ))}
          <button type="button" className="w-full rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-200">
            Show more options
          </button>
        </div>
      </div>
    </section>
  )
}

export default AiRecommendations
