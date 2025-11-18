import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingApi } from '@/services/booking/api'
import type { BookingDto } from '@/models/booking'

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
  Paid: 'bg-amber-50 text-black',
  Pending: 'bg-amber-50 text-black',
  Overdue: 'bg-amber-50 text-black',
}

const ExpensesPayments = () => {
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [lateFeeMessage] = useState<string>('Late return fee API unavailable in current backend.')

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
          <span>Category</span>
          <span>Total and share</span>
          <span>Status</span>
        </div>
        {expenses.map((expense) => (
          <div key={expense.id} className="grid grid-cols-5 gap-4 border-b border-slate-900 px-6 py-4 text-sm text-black">
            <span className="font-semibold">{expense.id}</span>
            <span>{expense.date}</span>
            <span>{expense.category}</span>
            <span>
              {expense.amount}
              <span className="block text-xs text-black">Your share {expense.share}</span>
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
        <button type="button" className="rounded-2xl bg-brand px-6 py-3 font-semibold text-black">
          Pay pending (2)
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
