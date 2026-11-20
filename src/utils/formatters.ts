/**
 * Formatting helpers for duration, relative timestamps, and dates
 */

// Format milliseconds to mm:ss or hh:mm:ss
export function formatDuration(ms: number | undefined | null): string {
  if (!ms || isNaN(ms) || ms < 0) return '0:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format timestamp to relative human time (e.g. "a few seconds ago", "12 minutes ago")
export function formatRelativeTime(timestamp: number | undefined | null): string {
  if (!timestamp) return '';

  const now = Date.now();
  const diffSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (diffSeconds < 20) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  return formatDate(timestamp);
}

// Format full date: e.g. "February 2024" or "20 Feb 2024"
export function formatDate(timestamp: number | undefined | null, includeDay = true): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);

  if (!includeDay) {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
