import { Bell, Search } from 'lucide-react';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-surface-900">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search workflows..."
            className="w-64 rounded-lg border border-surface-200 bg-surface-50 py-2 pl-10 pr-4 text-sm text-surface-800 placeholder-surface-400 focus:border-primary-400 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-700"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white" />
        </button>

        {/* User avatar */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-medium text-white ring-2 ring-surface-50"
        >
          JD
        </button>
      </div>
    </header>
  );
}
