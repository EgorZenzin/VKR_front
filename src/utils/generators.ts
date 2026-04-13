import type { City, KnapsackItem } from '../types';

export function generateCities(count: number): City[] {
  return Array.from({ length: count }, () => ({
    x: Math.round(Math.random() * 100),
    y: Math.round(Math.random() * 100),
  }));
}

export function generateKnapsackItems(count: number): {
  items: KnapsackItem[];
  capacity: number;
} {
  const items = Array.from({ length: count }, () => ({
    weight: Math.round(Math.random() * 20 + 1),
    value: Math.round(Math.random() * 100 + 1),
  }));
  const capacity = Math.round(items.reduce((s, i) => s + i.weight, 0) / 2);
  return { items, capacity };
}

export function generateCostMatrix(size: number): number[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Math.round(Math.random() * 50 + 1)),
  );
}
