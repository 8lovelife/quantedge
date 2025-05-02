import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}


export function formatDuration(startTime: Date | string, endTime: Date | string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const diffMs = end.getTime() - start.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds}s`;
}


import * as LucideIcons from "lucide-react"

export function getIconComponent(name: string): React.ElementType | null {
  const iconName = `${name.charAt(0).toUpperCase()}${name.slice(1)}Icon`
  return (LucideIcons as any)[iconName] ?? null
}

export function formatDateTimeWithAmPm(date: Date) {
  const [mdy, time] = date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: true,
  }).split(", ");
  const [month, day, year] = mdy.split("/");
  return `${year}-${month}-${day} ${time}`;
}