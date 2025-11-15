import { Outlet } from 'react-router-dom'
import Header from '@/components/navigation/Header'
import Footer from '@/components/navigation/Footer'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout

