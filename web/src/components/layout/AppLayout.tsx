import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function AppLayout() {
  const location = useLocation();

  const pageTitles: Record<string, string> = {
    '/app/dashboard': 'Dashboard',
    '/app/workflows': 'Workflows',
    '/app/executions': 'Execution History',
    '/app/settings': 'Settings',
  };

  const title = pageTitles[location.pathname] || 'AutoFlow';

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-auto bg-surface-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
