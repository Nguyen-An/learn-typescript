/**
 * ============================================================
 * BÀI 01: TYPE SYSTEM TRONG TYPESCRIPT
 * ============================================================
 * Các chủ đề:
 *  1. Primitive Types
 *  2. Array & Tuple
 *  3. Enum
 *  4. Any, Unknown, Never, Void
 *  5. Type Inference (suy luận kiểu)
 *  6. Type Assertion
 *  7. Union & Intersection Types
 *  8. Literal Types
 *  9. Type Aliases & Interfaces
 * ============================================================
 */

// ──────────────────────────────────────────────
// 1. PRIMITIVE TYPES – Các kiểu nguyên thủy
// ──────────────────────────────────────────────
const username: string = "Nguyen Van A";
const age: number = 25;
const isStudent: boolean = true;
const score: null = null;
const data: undefined = undefined;
const id: symbol = Symbol("userId");
const bigNumber: bigint = 9999999999999999n;

console.log("=== 1. PRIMITIVE TYPES ===");
console.log({ username, age, isStudent, score, data });

// ──────────────────────────────────────────────
// 2. ARRAY & TUPLE
// ──────────────────────────────────────────────
console.log("\n=== 2. ARRAY & TUPLE ===");

// Array – mảng thuần nhất
const numbers: number[] = [1, 2, 3, 4, 5];
const names: Array<string> = ["Alice", "Bob", "Charlie"];

// Tuple – mảng có kiểu cố định theo vị trí
const user: [string, number, boolean] = ["Alice", 30, true];
console.log("Tuple user:", user);
console.log("Tên:", user[0], "| Tuổi:", user[1]);

// Tuple với label (dễ đọc hơn)
type Point = [x: number, y: number, z?: number];
const p1: Point = [10, 20];
const p2: Point = [10, 20, 30];
console.log("Points:", p1, p2);

// ──────────────────────────────────────────────
// 3. ENUM
// ──────────────────────────────────────────────
console.log("\n=== 3. ENUM ===");

// Numeric Enum (mặc định)
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right, // 3
}

// String Enum (nên dùng để dễ debug)
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING",
}

// Const Enum – được tối ưu lúc compile (không tạo object thật)
const enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}

console.log("Direction.Up:", Direction.Up);       // 0
console.log("Direction[0]:", Direction[0]);       // "Up"
console.log("Status.Active:", Status.Active);     // "ACTIVE"
const myColor: Color = Color.Red;
console.log("Color:", myColor);

// ──────────────────────────────────────────────
// 4. ANY, UNKNOWN, NEVER, VOID
// ──────────────────────────────────────────────
console.log("\n=== 4. ANY | UNKNOWN | NEVER | VOID ===");

// any – tắt type checking (nên tránh dùng)
let anything: any = 42;
anything = "hello";
anything = true;
// anything.foo.bar; // ⚠️ TypeScript không báo lỗi ở compile time nhưng sẽ crash runtime!
console.log("any đang là:", anything); // true

// unknown – kiểu an toàn hơn any, cần kiểm tra trước khi dùng
let mystery: unknown = "hello world";
// mystery.toUpperCase(); // ❌ Lỗi! Phải kiểm tra kiểu trước
if (typeof mystery === "string") {
  console.log("unknown string:", mystery.toUpperCase()); // ✅
}

// void – hàm không trả về giá trị
function logMessage(msg: string): void {
  console.log("LOG:", msg);
}
logMessage("Hello TypeScript!");

// never – hàm không bao giờ return (throw hoặc infinite loop)
function throwError(message: string): never {
  throw new Error(message);
}

function exhaustiveCheck(value: never): never {
  throw new Error(`Unhandled value: ${value}`);
}

// ──────────────────────────────────────────────
// 5. TYPE INFERENCE – Suy luận kiểu tự động
// ──────────────────────────────────────────────
console.log("\n=== 5. TYPE INFERENCE ===");

// TypeScript tự suy luận kiểu – KHÔNG cần khai báo tường minh
let inferredString = "TypeScript"; // kiểu: string
let inferredNumber = 100;          // kiểu: number
let inferredArr = [1, 2, 3];       // kiểu: number[]

// Contextual typing
const greet = (name: string) => `Hello, ${name}!`;
console.log(greet("World"));

// ──────────────────────────────────────────────
// 6. TYPE ASSERTION – Ép kiểu
// ──────────────────────────────────────────────
console.log("\n=== 6. TYPE ASSERTION ===");

const rawInput: unknown = "2024-01-01";

// Cách 1: as keyword (khuyến nghị)
const dateStr = rawInput as string;
console.log("Date string length:", dateStr.length);

// Cách 2: angle-bracket (không dùng được trong JSX)
// const dateStr2 = <string>rawInput;

// Non-null assertion (!) – khẳng định giá trị KHÔNG null/undefined
// (chỉ dùng trên Browser, document không tồn tại trong Node.js)
// const element = document.getElementById("app");
// element!.innerHTML = "Hello"; // Dùng ! để bỏ qua null check

// Double assertion (dùng khi thực sự cần thiết)
const num = (42 as unknown) as string; // ép kiểu 2 lần

// ──────────────────────────────────────────────
// 7. UNION & INTERSECTION TYPES
// ──────────────────────────────────────────────
console.log("\n=== 7. UNION & INTERSECTION ===");

// Union (|) – một trong các kiểu
type StringOrNumber = string | number;
type ID = string | number | null;

function formatID(id: StringOrNumber): string {
  if (typeof id === "string") {
    return id.toUpperCase();
  }
  return id.toFixed(0);
}
console.log("formatID('abc'):", formatID("abc"));
console.log("formatID(123):", formatID(123));

// Intersection (&) – kết hợp tất cả các kiểu
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;

const person: Person = { name: "Alice", age: 30 };
console.log("Person:", person);

// ──────────────────────────────────────────────
// 8. LITERAL TYPES – Kiểu giá trị cố định
// ──────────────────────────────────────────────
console.log("\n=== 8. LITERAL TYPES ===");

// String literal
type Direction2D = "up" | "down" | "left" | "right";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

function move(direction: Direction2D): string {
  return `Moving ${direction}`;
}
console.log(move("up"));
// move("forward"); // ❌ Lỗi! "forward" không hợp lệ

// Numeric literal
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
type FontSize = 12 | 14 | 16 | 18 | 24 | 32;

// Template literal types
type EventName = `on${Capitalize<string>}`;
type CSSUnit = `${number}px` | `${number}rem` | `${number}%`;

// Readonly tuple as const
const config = ["localhost", 3000] as const;
// config[0] = "other"; // ❌ Lỗi! readonly

// ──────────────────────────────────────────────
// 9. TYPE ALIASES & INTERFACES
// ──────────────────────────────────────────────
console.log("\n=== 9. TYPE ALIASES vs INTERFACES ===");

// Type Alias – có thể dùng cho mọi kiểu
type UserID = string | number;
type Callback = (error: Error | null, result: string) => void;

type Product = {
  id: number;
  name: string;
  price: number;
  category?: string; // optional property
};

// Interface – chỉ dùng cho object/class, có thể kế thừa & mở rộng
interface Animal {
  name: string;
  sound(): string;
}

interface Dog extends Animal {
  breed: string;
}

// Interface có thể được khai báo nhiều lần (declaration merging)
interface Window {
  myCustomProperty?: string;
}

const dog: Dog = {
  name: "Rex",
  breed: "Labrador",
  sound() {
    return "Woof!";
  },
};

console.log(`${dog.name} says: ${dog.sound()}`);

// Readonly & Optional trong interface
interface Config {
  readonly host: string;      // không thể thay đổi sau khi gán
  port: number;
  ssl?: boolean;              // optional
  [key: string]: unknown;     // index signature – cho phép thêm prop bất kỳ
}

const serverConfig: Config = {
  host: "localhost",
  port: 3000,
  ssl: true,
  timeout: 5000, // ✅ được nhờ index signature
};
// serverConfig.host = "other"; // ❌ Lỗi! readonly

console.log("Server config:", serverConfig);
console.log("\n✅ Bài 01 hoàn thành!");

export {};
