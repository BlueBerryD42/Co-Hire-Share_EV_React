import Header from '@/components/navigation/Header'
import Footer from '@/components/navigation/Footer'
import Home from '@/pages/Home'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-12">
        <Home />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout

