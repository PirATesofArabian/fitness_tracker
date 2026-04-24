'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
  sublabel?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 10,
  color = 'hsl(222.2 47.4% 11.2%)',
  backgroundColor = 'hsl(214.3 31.8% 91.4%)',
  showPercentage = true,
  label,
  sublabel,
  children,
}: ProgressRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            {showPercentage && (
              <span className="text-2xl font-bold" style={{ color }}>
                {Math.round(percentage)}%
              </span>
            )}
            {label && (
              <span className="text-sm font-medium text-muted-foreground">
                {label}
              </span>
            )}
          </>
        )}
      </div>
      {sublabel && (
        <span className="absolute -bottom-6 text-xs text-muted-foreground">
          {sublabel}
        </span>
      )}
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
  valueLabel?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  height = 8,
  color = 'hsl(222.2 47.4% 11.2%)',
  backgroundColor = 'hsl(214.3 31.8% 91.4%)',
  showLabel = true,
  label,
  valueLabel,
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full ${className || ''}`}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm font-medium">{label}</span>}
          {valueLabel && (
            <span className="text-sm text-muted-foreground">{valueLabel}</span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ backgroundColor, height }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
}

export function StatCard({ value, label, sublabel, trend, trendValue, icon }: StatCardProps) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {(sublabel || trend) && (
        <div className="flex items-center gap-1 mt-1">
          {trend && trendValue && (
            <span className={cn('text-xs', trendColors[trend])}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </span>
          )}
          {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}