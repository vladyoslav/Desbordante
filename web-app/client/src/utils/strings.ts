export const limitString = (s: string, count: number) =>
  s.slice(0, count) + (s.length > count ? '...' : '');
