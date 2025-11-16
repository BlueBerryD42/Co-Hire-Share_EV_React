import { Outlet } from "react-router-dom";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-700 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
