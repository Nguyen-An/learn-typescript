/**
 * math.ts – Module toán học
 * Demo: Named exports, type exports
 */

export type MathResult = {
  value: number;
  operation: string;
};

export function add(a: number, b: number): MathResult {
  return { value: a + b, operation: `${a} + ${b}` };
}

export function subtract(a: number, b: number): MathResult {
  return { value: a - b, operation: `${a} - ${b}` };
}

export function multiply(a: number, b: number): MathResult {
  return { value: a * b, operation: `${a} × ${b}` };
}

export function divide(a: number, b: number): MathResult {
  if (b === 0) throw new Error("Không thể chia cho 0");
  return { value: a / b, operation: `${a} ÷ ${b}` };
}

// Namespace export gộp các function liên quan
export const Statistics = {
  mean(numbers: number[]): number {
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  },
  median(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  },
  variance(numbers: number[]): number {
    const m = Statistics.mean(numbers);
    return Statistics.mean(numbers.map(n => (n - m) ** 2));
  },
  stdDev(numbers: number[]): number {
    return Math.sqrt(Statistics.variance(numbers));
  },
};
