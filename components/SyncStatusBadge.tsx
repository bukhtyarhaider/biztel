/**
 * SyncStatusBadge Component
 * Visual indicator for Google Sheets sync status
 */

import React from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Link2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDate } from '../utils/dateUtils';

export interface SyncStatusBadgeProps {
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncedAt?: string;
  error?: string;
  className?: string;
}

const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  status,
  lastSyncedAt,
  error,
  className
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: RefreshCw,
          text: 'Syncing...',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          animate: true
        };
      case 'success':
        return {
          icon: CheckCircle,
          text: lastSyncedAt 
            ? `Synced ${getTimeAgo(lastSyncedAt)}`
            : 'Synced',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          iconColor: 'text-emerald-600',
          borderColor: 'border-emerald-200',
          animate: false
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: error || 'Sync failed',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200',
          animate: false
        };
      default: // idle
        return {
          icon: Link2,
          text: 'Linked to Google Sheets',
          bgColor: 'bg-slate-50',
          textColor: 'text-slate-700',
          iconColor: 'text-slate-500',
          borderColor: 'border-slate-200',
          animate: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
      title={status === 'error' ? error : undefined}
    >
      <Icon
        className={cn(
          'w-4 h-4',
          config.iconColor,
          config.animate && 'animate-spin'
        )}
      />
      <span>{config.text}</span>
    </div>
  );
};

/**
 * Helper function to get time ago string
 * @param isoDate - ISO date string
 * @returns Human-readable time ago string
 */
const getTimeAgo = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return `on ${formatDate(date, { month: 'short', day: 'numeric' })}`;
};

export default SyncStatusBadge;
