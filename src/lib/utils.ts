
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Position, PositionGroup } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAverage(numbers: number[]): number {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
}

export function formatAverage(avg: number): string {
  return avg.toFixed(1);
}

export function getPositionGroup(position: Position): PositionGroup {
  switch (position) {
    case 'PT':
      return 'Goalkeeper';
    case 'DFC':
    case 'LI':
    case 'LD':
      return 'Defender';
    case 'MCD':
    case 'MC':
    case 'MDI':
    case 'MDD':
    case 'MO':
      return 'Midfielder';
    case 'EXI':
    case 'EXD':
    case 'SD':
    case 'DC':
      return 'Forward';
  }
}

export function getPositionGroupColor(position: Position): string {
  const group = getPositionGroup(position);
  switch (group) {
    case 'Goalkeeper':
      return '#FAC748'; // Yellow
    case 'Defender':
      return '#57A6FF'; // Blue
    case 'Midfielder':
      return '#5DD972'; // Green
    case 'Forward':
      return '#FF6B6B'; // Red
    default:
      return 'hsl(var(--primary))';
  }
}
