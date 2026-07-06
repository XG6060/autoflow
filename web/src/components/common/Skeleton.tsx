import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export default function Skeleton({
  className,
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-surface-200',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 rounded',
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-surface-200 bg-white p-5">
            <Skeleton variant="circular" width="32px" height="32px" />
            <Skeleton className="mt-3" width="60%" />
            <Skeleton className="mt-2" width="40%" height="24px" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-surface-200 bg-white p-5">
        <Skeleton width="30%" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width={`${70 + Math.random() * 30}%`} height="20px" />
          ))}
        </div>
      </div>
    </div>
  );
}
