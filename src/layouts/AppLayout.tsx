import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-slate-800">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
