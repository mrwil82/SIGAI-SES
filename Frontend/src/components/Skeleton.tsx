import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
}) => {
  const base = 'bg-white/5 rounded animate-pulse';
  const variants: Record<string, string> = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3 p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="flex-1 h-8" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-bg2 rounded-[14px] border border-white/5 p-4 shadow-neo space-y-4">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-2/3" />
  </div>
);

export default Skeleton;
