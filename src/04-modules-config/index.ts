/**
 * ============================================================
 * BÀI 04: MODULES & CONFIG
 * ============================================================
 * Các chủ đề:
 *  1. Named exports & imports
 *  2. Default export & import
 *  3. Re-exports & barrel files
 *  4. Namespace
 *  5. Declaration Merging
 *  6. Module Augmentation
 *  7. Path aliases (tsconfig paths)
 * ============================================================
 */

// ──────────────────────────────────────────────
// 1. NAMED EXPORTS & IMPORTS
// ──────────────────────────────────────────────
console.log("=== 1. NAMED IMPORTS ===");

import { add, subtract, multiply, divide, Statistics, type MathResult } from "./math";

const r1: MathResult = add(10, 5);
const r2: MathResult = divide(20, 4);
console.log(`${r1.operation} = ${r1.value}`);
console.log(`${r2.operation} = ${r2.value}`);

const numbers = [3, 7, 2, 9, 4, 1, 8, 5, 6];
console.log("Mean:", Statistics.mean(numbers).toFixed(2));
console.log("Median:", Statistics.median(numbers));
console.log("StdDev:", Statistics.stdDev(numbers).toFixed(2));

// ──────────────────────────────────────────────
// 2. DEFAULT EXPORT & IMPORT
// ──────────────────────────────────────────────
console.log("\n=== 2. DEFAULT IMPORT ===");

import logger, { StringValidator, LogLevel } from "./utils";
// "logger" là default export, đặt tên tuỳ ý

logger.info("Ứng dụng khởi động");
logger.warn("Cảnh báo: sắp hết bộ nhớ", { used: "80%", available: "20%" });
logger.error("Lỗi kết nối database", { host: "localhost", port: 5432 });

// ──────────────────────────────────────────────
// 3. VALIDATORS VỚI METHOD CHAINING
// ──────────────────────────────────────────────
console.log("\n=== 3. VALIDATORS ===");

const emailValidator = new StringValidator()
  .minLength(5)
  .maxLength(100)
  .email();

const tests = ["alice@example.com", "invalid-email", "ab@c", "valid@test.co.vn"];
tests.forEach(t => {
  const result = emailValidator.validate(t);
  console.log(`"${t}": ${result.isValid ? "✅" : "❌ " + result.errors.join(", ")}`);
});

// ──────────────────────────────────────────────
// 4. NAMESPACES
// ──────────────────────────────────────────────
console.log("\n=== 4. NAMESPACES ===");

// Namespace dùng để nhóm các type/function liên quan, tránh xung đột tên
namespace Geometry {
  export interface Point {
    x: number;
    y: number;
  }

  export interface Circle {
    center: Point;
    radius: number;
  }

  export function distance(p1: Point, p2: Point): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }

  export function isInsideCircle(point: Point, circle: Circle): boolean {
    return distance(point, circle.center) <= circle.radius;
  }

  // Nested namespace
  export namespace Polygon {
    export function regularArea(sides: number, sideLength: number): number {
      return (sides * sideLength ** 2) / (4 * Math.tan(Math.PI / sides));
    }
  }
}

const p1: Geometry.Point = { x: 0, y: 0 };
const p2: Geometry.Point = { x: 3, y: 4 };
console.log("Distance:", Geometry.distance(p1, p2));  // 5

const circle: Geometry.Circle = { center: p1, radius: 6 };
console.log("P2 in circle:", Geometry.isInsideCircle(p2, circle)); // true

console.log("Hexagon area:", Geometry.Polygon.regularArea(6, 5).toFixed(2));

// ──────────────────────────────────────────────
// 5. DECLARATION MERGING
// ──────────────────────────────────────────────
console.log("\n=== 5. DECLARATION MERGING ===");

// Interface merging – cùng tên sẽ tự động merge
interface Plugin {
  name: string;
  version: string;
}

interface Plugin {
  author: string;
  install(): void;
}

// Kết quả: Plugin có cả 4 properties
const plugin: Plugin = {
  name: "awesome-plugin",
  version: "1.0.0",
  author: "Alice",
  install() { console.log(`Installing ${this.name}@${this.version}`); },
};
plugin.install();

// Namespace + function merging
function greet(name: string): string {
  return `Hello, ${name}!`;
}
namespace greet {
  export function formal(name: string): string {
    return `Good day, ${name}.`;
  }
}

console.log(greet("Alice"));
console.log(greet.formal("Dr. Smith"));

// ──────────────────────────────────────────────
// 6. MODULE AUGMENTATION
// ──────────────────────────────────────────────
console.log("\n=== 6. MODULE AUGMENTATION ===");

// Thêm method vào built-in types (thường dùng trong .d.ts files)
declare global {
  interface String {
    toTitleCase(): string;
    truncate(length: number, suffix?: string): string;
  }

  interface Array<T> {
    groupBy<K extends string>(keyFn: (item: T) => K): Record<K, T[]>;
  }
}

String.prototype.toTitleCase = function(): string {
  return this.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
};

String.prototype.truncate = function(length: number, suffix = "..."): string {
  return this.length <= length ? String(this) : String(this).slice(0, length) + suffix;
};

Array.prototype.groupBy = function<T, K extends string>(
  this: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return this.reduce((acc, item) => {
    const key = keyFn(item);
    return { ...acc, [key]: [...(acc[key] || []), item] };
  }, {} as Record<K, T[]>);
};

console.log("title case:", "hello world from typescript".toTitleCase());
console.log("truncate:", "This is a very long text".truncate(10));

type Employee = { name: string; dept: string; salary: number };
const employees: Employee[] = [
  { name: "Alice", dept: "Engineering", salary: 5000 },
  { name: "Bob",   dept: "Marketing",   salary: 4000 },
  { name: "Carol", dept: "Engineering", salary: 6000 },
  { name: "Dave",  dept: "Marketing",   salary: 4500 },
];

const byDept = employees.groupBy(e => e.dept);
console.log("By department:", Object.keys(byDept));
console.log("Engineering:", byDept.Engineering.map(e => e.name));

// ──────────────────────────────────────────────
// 7. TSCONFIG OPTIONS CÁC MỤC QUAN TRỌNG
// ──────────────────────────────────────────────
console.log("\n=== 7. TSCONFIG CHEAT SHEET ===");

const tsconfigNotes = `
tsconfig.json – Các option quan trọng:
────────────────────────────────────────────────
"strict": true           → Bật tất cả strict checks
"target": "ES2020"       → Output JS version
"module": "commonjs"     → Module system (Node.js dùng commonjs)
"outDir": "./dist"       → Thư mục output
"rootDir": "./src"       → Thư mục nguồn
"declaration": true      → Tạo file .d.ts
"sourceMap": true        → Debug TypeScript trong browser/Node
"esModuleInterop": true  → Cho phép import CJS modules dễ hơn
"paths": {...}           → Path aliases (như @/components/...)
"baseUrl": "./src"       → Base URL cho path resolution
"experimentalDecorators" → Bật Decorators
────────────────────────────────────────────────
`;
console.log(tsconfigNotes);
console.log("\n✅ Bài 04 hoàn thành!");
