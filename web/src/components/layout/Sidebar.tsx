import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Workflow,
  History,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Workflows', href: '/app/workflows', icon: Workflow },
  { name: 'Executions', href: '/app/executions', icon: History },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

const planLabels: Record<string, string> = {
  FREE: 'Free Plan',
  MAKER: 'Maker Plan',
  TEAM: 'Team Plan',
  BUSINESS: 'Business Plan',
};

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={cn(
        'flex w-64 flex-col bg-surface-900 text-white',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-surface-800 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="8" cy="16" r="3" fill="white" />
            <circle cx="24" cy="8" r="3" fill="white" />
            <circle cx="24" cy="24" r="3" fill="white" />
            <path d="M11 16h4l4-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M11 16h4l4 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight">AutoFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            location.pathname === item.href ||
            location.pathname.startsWith(item.href + '/');
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600/20 text-primary-300 border-l-2 border-primary-500 -ml-[3px] pl-3'
                  : 'text-surface-200 hover:bg-surface-800 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-surface-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-700 text-sm font-medium text-white">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-surface-400 truncate">
              {planLabels[user?.plan || 'FREE']}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
