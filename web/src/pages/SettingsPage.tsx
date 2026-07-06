import { useState } from 'react';
import { Key, Shield, Bell } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { useAuthStore } from '@/stores/authStore';

const planLabels: Record<string, string> = {
  FREE: 'Free Plan',
  MAKER: 'Maker Plan',
  TEAM: 'Team Plan',
  BUSINESS: 'Business Plan',
};

const planExecLimits: Record<string, string> = {
  FREE: '1,000',
  MAKER: '10,000',
  TEAM: '100,000',
  BUSINESS: '1,000,000',
};

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [showToken, setShowToken] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Profile */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-600">
            {initials}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-surface-900">{user?.name}</h3>
            <p className="text-sm text-surface-500">{user?.email}</p>
          </div>
          <Button variant="secondary" size="sm">Edit Profile</Button>
        </div>
      </Card>

      {/* Plan */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <Shield className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-surface-900">
                  {planLabels[user?.plan || 'FREE']}
                </h3>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-sm text-surface-500">
                {planExecLimits[user?.plan || 'FREE']} executions / month
              </p>
            </div>
          </div>
          <Button size="sm">Upgrade to Team</Button>
        </div>
      </Card>

      {/* JWT Token */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Key className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">Session Token</h3>
              <p className="text-sm text-surface-500">Current JWT for API access</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-surface-200 bg-surface-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-surface-500 break-all">
              {showToken ? token : token?.slice(0, 30) + '...'}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowToken(!showToken)}
            >
              {showToken ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
            <Bell className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">Notifications</h3>
            <p className="text-sm text-surface-500">Choose how you want to be alerted</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Workflow failure alerts', description: 'Get notified immediately when a workflow fails', enabled: true },
            { label: 'Weekly digest', description: 'Summary of all workflow activity every Monday', enabled: true },
            { label: 'Execution threshold warnings', description: 'Alert when approaching plan limits', enabled: false },
            { label: 'New feature announcements', description: 'Product updates and integration releases', enabled: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-800">{item.label}</p>
                <p className="text-xs text-surface-400">{item.description}</p>
              </div>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  item.enabled ? 'bg-primary-600' : 'bg-surface-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    item.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
