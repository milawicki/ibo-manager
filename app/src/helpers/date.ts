export function toLocalDateTime(timestamp: string): string {
  return (new Date(timestamp)).toLocaleString();
}

export function adjustTimestamp(timestamp: number | string): number {
  return +timestamp * 1000;
}
