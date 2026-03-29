/**
 * ============================================================
 * BÀI 02: ADVANCED TYPES TRONG TYPESCRIPT
 * ============================================================
 * Các chủ đề:
 *  1. Generics (kiểu tổng quát)
 *  2. Conditional Types
 *  3. Mapped Types
 *  4. Template Literal Types
 *  5. Discriminated Unions
 *  6. Type Guards
 *  7. Infer keyword
 * ============================================================
 */

// ──────────────────────────────────────────────
// 1. GENERICS – Kiểu tổng quát
// ──────────────────────────────────────────────
console.log("=== 1. GENERICS ===");

// Generic function – tái sử dụng với nhiều kiểu khác nhau
function identity<T>(value: T): T {
  return value;
}
console.log(identity<string>("hello")); // "hello"
console.log(identity<number>(42));      // 42
console.log(identity(true));            // TypeScript tự suy luận T = boolean

// Generic với nhiều type parameter
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}
const result = pair("age", 25);
console.log("Pair:", result); // ["age", 25]

// Generic Interface
interface Repository<T> {
  findById(id: number): T | undefined;
  findAll(): T[];
  save(item: T): void;
  delete(id: number): void;
}

// Generic Class
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.push(3);
console.log("Stack peek:", stack.peek()); // 3
console.log("Stack pop:", stack.pop());   // 3
console.log("Stack size:", stack.size);   // 2

// Generic Constraints – giới hạn kiểu
interface HasLength {
  length: number;
}

function getLength<T extends HasLength>(item: T): number {
  return item.length;
}
console.log("String length:", getLength("hello"));       // 5
console.log("Array length:", getLength([1, 2, 3]));      // 3

// keyof với Generics
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: "Alice", age: 30, email: "alice@example.com" };
console.log(getProperty(user, "name"));  // "Alice"
console.log(getProperty(user, "age"));   // 30
// getProperty(user, "phone"); // ❌ Lỗi! "phone" không tồn tại trong user

// Default type parameters
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message: string;
}

// ──────────────────────────────────────────────
// 2. CONDITIONAL TYPES
// ──────────────────────────────────────────────
console.log("\n=== 2. CONDITIONAL TYPES ===");

// Cú pháp: T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
type C = IsString<"hello">; // true (string literal extends string)

// NonNullable tự viết
type MyNonNullable<T> = T extends null | undefined ? never : T;
type SafeString = MyNonNullable<string | null | undefined>; // string

// Distributive conditional types
type ElementType<T> = T extends Array<infer E> ? E : T;
type NumberItem = ElementType<number[]>;   // number
type StrItem = ElementType<string[]>;      // string
type Scalar = ElementType<boolean>;        // boolean (không phải array)

// ──────────────────────────────────────────────
// 3. MAPPED TYPES
// ──────────────────────────────────────────────
console.log("\n=== 3. MAPPED TYPES ===");

type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

// Biến tất cả property thành optional
type Partial_<T> = {
  [K in keyof T]?: T[K];
};

// Biến tất cả property thành readonly
type Readonly_<T> = {
  readonly [K in keyof T]: T[K];
};

// Biến tất cả property thành nullable
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

// Chỉ lấy các key cụ thể
type Pick_<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Loại bỏ các key cụ thể
type Omit_<T, K extends keyof T> = Pick_<T, Exclude<keyof T, K>>;

type UserPreview = Pick_<User, "id" | "name">;
// { id: number; name: string }

type UserWithoutId = Omit_<User, "id">;
// { name: string; email: string; age: number }

// Mapped type với remapping (đổi tên key)
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<Pick<User, "name" | "email">>;
// { getName: () => string; getEmail: () => string }

// ──────────────────────────────────────────────
// 4. TEMPLATE LITERAL TYPES
// ──────────────────────────────────────────────
console.log("\n=== 4. TEMPLATE LITERAL TYPES ===");

type Greeting = `Hello, ${string}!`;
const g1: Greeting = "Hello, World!";
const g2: Greeting = "Hello, TypeScript!";

// Kết hợp Union với Template Literal
type Axis = "x" | "y" | "z";
type CSSProperty = "margin" | "padding";
type CSSDirection = "top" | "right" | "bottom" | "left";

type CSSSpacing = `${CSSProperty}-${CSSDirection}`;
// "margin-top" | "margin-right" | ... | "padding-bottom" | "padding-left"

type EventHandler = `on${Capitalize<string>}`;
// "onClick", "onChange", "onSubmit", ...

// Practical example: API route types
type ApiVersion = "v1" | "v2";
type ResourceName = "users" | "products" | "orders";
type ApiEndpoint = `/${ApiVersion}/${ResourceName}`;
// "/v1/users" | "/v1/products" | "/v2/orders" | ...

const endpoint: ApiEndpoint = "/v1/users";
console.log("API Endpoint:", endpoint);

// ──────────────────────────────────────────────
// 5. DISCRIMINATED UNIONS
// ──────────────────────────────────────────────
console.log("\n=== 5. DISCRIMINATED UNIONS ===");

// Pattern: dùng 1 property chung (discriminant) để phân biệt các variant
type Circle = {
  kind: "circle";
  radius: number;
};

type Rectangle = {
  kind: "rectangle";
  width: number;
  height: number;
};

type Triangle = {
  kind: "triangle";
  base: number;
  height: number;
};

type Shape = Circle | Rectangle | Triangle;

function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    // TypeScript kiểm tra exhaustive – nếu thiếu case sẽ báo lỗi
    default:
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

const circle: Circle = { kind: "circle", radius: 5 };
const rect: Rectangle = { kind: "rectangle", width: 4, height: 6 };
console.log("Circle area:", calculateArea(circle).toFixed(2));    // 78.54
console.log("Rectangle area:", calculateArea(rect));               // 24

// Practical: Action types (giống Redux)
type LoadingAction = { type: "LOADING" };
type SuccessAction<T> = { type: "SUCCESS"; payload: T };
type ErrorAction = { type: "ERROR"; error: string };
type Action<T> = LoadingAction | SuccessAction<T> | ErrorAction;

function handleAction<T>(action: Action<T>): string {
  switch (action.type) {
    case "LOADING": return "Đang tải...";
    case "SUCCESS": return `Thành công: ${JSON.stringify(action.payload)}`;
    case "ERROR":   return `Lỗi: ${action.error}`;
  }
}

console.log(handleAction({ type: "LOADING" }));
console.log(handleAction({ type: "SUCCESS", payload: { id: 1, name: "Alice" } }));
console.log(handleAction({ type: "ERROR", error: "Not found" }));

// ──────────────────────────────────────────────
// 6. TYPE GUARDS – Kiểm tra kiểu lúc runtime
// ──────────────────────────────────────────────
console.log("\n=== 6. TYPE GUARDS ===");

// typeof guard
function processInput(input: string | number | boolean): string {
  if (typeof input === "string") return input.toUpperCase();
  if (typeof input === "number") return input.toFixed(2);
  return String(input);
}
console.log("processInput:", processInput("hello"), processInput(3.14), processInput(true));

// instanceof guard
class Cat {
  meow() { return "Meow!"; }
}
class Bird {
  chirp() { return "Tweet!"; }
}

function makeSound(animal: Cat | Bird): string {
  if (animal instanceof Cat) return animal.meow();
  return animal.chirp();
}
console.log(makeSound(new Cat()));
console.log(makeSound(new Bird()));

// User-defined type guard (is keyword)
interface Fish {
  swim(): void;
  name: string;
}
interface Fly {
  fly(): void;
  name: string;
}

function isFish(pet: Fish | Fly): pet is Fish {
  return "swim" in pet;
}

const pet: Fish | Fly = {
  name: "Nemo",
  swim() { console.log("Swimming..."); },
};

if (isFish(pet)) {
  pet.swim(); // TypeScript biết chắc là Fish
  console.log(pet.name, "is a fish");
}

// Assertion functions (TypeScript 3.7+)
function assertIsString(val: unknown): asserts val is string {
  if (typeof val !== "string") {
    throw new Error(`Expected string, got ${typeof val}`);
  }
}

const maybeStr: unknown = "Hello";
assertIsString(maybeStr);
console.log("Asserted string:", maybeStr.toUpperCase()); // ✅ TypeScript biết là string

// ──────────────────────────────────────────────
// 7. INFER KEYWORD
// ──────────────────────────────────────────────
console.log("\n=== 7. INFER KEYWORD ===");

// infer – lấy kiểu từ bên trong conditional type

// Lấy kiểu trả về của function
type ReturnType_<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never;

function add(a: number, b: number): number { return a + b; }
function greet(name: string): string { return `Hello ${name}`; }

type AddReturn = ReturnType_<typeof add>;    // number
type GreetReturn = ReturnType_<typeof greet>; // string

// Lấy kiểu tham số của function
type Parameters_<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

type AddParams = Parameters_<typeof add>; // [a: number, b: number]

// Lấy kiểu element của Promise
type Awaited_<T> = T extends Promise<infer R> ? R : T;
type AsyncResult = Awaited_<Promise<string>>;    // string
type SyncResult = Awaited_<number>;              // number

// Lấy kiểu keys của object dưới dạng union
type ValueOf<T> = T[keyof T];
type UserValues = ValueOf<User>; // number | string

console.log("\n✅ Bài 02 hoàn thành!");

export {};
