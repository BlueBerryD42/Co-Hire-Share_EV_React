import { useEffect, useState } from 'react'
import { bookingApi } from '@/services/booking/api'
import { lateReturnFeesApi } from '@/services/booking/lateReturnFees'
import type { BookingDto } from '@/models/booking'
import type { LateReturnFeeDto } from '@/models/bookingExtras'

type ExpenseStatus = 'Paid' | 'Pending' | 'Overdue'

const summaryCards = [
  { label: 'Total expenses (month)', value: '$1,245', sub: '+12% vs last month' },
  { label: 'Your share', value: '$312', sub: '3 items pending' },
  { label: 'Pending payments', value: '$148', sub: '2 overdue' },
]

const expenses: { id: string; date: string; category: string; amount: string; share: string; status: ExpenseStatus }[] = [
  { id: 'EXP-2301', date: '12 Mar', category: 'Charging', amount: '$32.10', share: '$8.02', status: 'Pending' },
  { id: 'EXP-2288', date: '10 Mar', category: 'Maintenance', amount: '$240.00', share: '$60.00', status: 'Paid' },
  { id: 'EXP-2274', date: '04 Mar', category: 'Insurance', amount: '$530.00', share: '$132.50', status: 'Pending' },
]

const statusStyles: Record<ExpenseStatus, string> = {
  Paid: 'bg-emerald-500/20 text-emerald-200',
  Pending: 'bg-amber-500/20 text-amber-100',
  Overdue: 'bg-rose-500/20 text-rose-200',
}

const ExpensesPayments = () => {
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [lateFees, setLateFees] = useState<LateReturnFeeDto[]>([])
  const [lateFeeMessage, setLateFeeMessage] = useState<string>('No late fee data yet.')

  useEffect(() => {
    let mounted = true
    setApiStatus('loading')
    bookingApi
      .getMyBookings()
      .then((data) => {
        if (mounted) {
          setBookings(data)
          setApiStatus('loaded')
        }
      })
      .catch((error) => {
        console.error('Failed to fetch bookings for expenses', error)
        if (mounted) setApiStatus('error')
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    lateReturnFeesApi
      .getHistory(5)
      .then((fees) => {
        setLateFees(fees)
        setLateFeeMessage(`Loaded ${fees.length} late-fee records.`)
      })
      .catch((error) => {
        console.error('Unable to fetch late return fee history', error)
        setLateFeeMessage('Cannot load late return fees.')
      })
  }, [])

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Screen 18</p>
        <h1 className="text-4xl font-semibold text-slate-50">Expenses and payments</h1>
        <p className="text-slate-300">Financial snapshot plus table of shared costs.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase text-slate-500">{card.label}</p>
            <p className="text-3xl font-semibold text-slate-50">{card.value}</p>
            <p className="text-sm text-slate-400">{card.sub}</p>
          </div>
        ))}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-xs uppercase text-slate-500">Bookings synced</p>
          <p className="text-3xl font-semibold text-slate-50">
            {apiStatus === 'loading' ? '...' : bookings.length}
          </p>
          <p className="text-sm text-slate-400">From /api/booking/my-bookings</p>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
        <p className="text-xs uppercase text-slate-500">Late return fees (API)</p>
        <p>{lateFeeMessage}</p>
        {lateFees.slice(0, 2).map((fee) => (
          <p key={fee.id}>
            Booking {fee.bookingId.slice(0, 8)} · {fee.status} · ${fee.feeAmount}
          </p>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {['Date range', 'Category', 'Vehicle', 'Status'].map((label) => (
          <label key={label} className="space-y-2 text-sm text-slate-300">
            <span>{label}</span>
            <select className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
              <option>All</option>
              <option>Option A</option>
              <option>Option B</option>
            </select>
          </label>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-950/60">
        <div className="grid grid-cols-5 gap-4 border-b border-slate-800 px-6 py-4 text-xs uppercase tracking-wide text-slate-500">
          <span>ID</span>
          <span>Date</span>
          <span>Category</span>
          <span>Total and share</span>
          <span>Status</span>
        </div>
        {expenses.map((expense) => (
          <div key={expense.id} className="grid grid-cols-5 gap-4 border-b border-slate-900 px-6 py-4 text-sm text-slate-200">
            <span className="font-semibold">{expense.id}</span>
            <span>{expense.date}</span>
            <span>{expense.category}</span>
            <span>
              {expense.amount}
              <span className="block text-xs text-slate-400">Your share {expense.share}</span>
            </span>
            <span
              className={`inline-flex h-fit w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
                statusStyles[expense.status]
              }`}
            >
              {expense.status}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <button type="button" className="rounded-2xl bg-brand px-6 py-3 font-semibold text-slate-950">
          Pay pending (2)
        </button>
        <button type="button" className="rounded-2xl border border-slate-800 px-6 py-3 text-slate-200">
          Export PDF
        </button>
        <button type="button" className="rounded-2xl border border-slate-800 px-6 py-3 text-slate-200">
          Export CSV
        </button>
      </div>
    </section>
  )
}

export default ExpensesPayments
