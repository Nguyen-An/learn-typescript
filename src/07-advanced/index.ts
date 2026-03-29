/**
 * ============================================================
 * BÀI 07: ADVANCED TYPESCRIPT
 * ============================================================
 * Các chủ đề:
 *  1. Decorators (class, method, property, parameter)
 *  2. Symbol & Unique Symbol
 *  3. Proxy & Reflect
 *  4. Recursive Types & Type Arithmetic
 *  5. Variance & Covariance
 *  6. Builder Pattern
 *  7. Dependency Injection
 *  8. TypeScript Compiler API hints
 * ============================================================
 */

// ──────────────────────────────────────────────
// 1. DECORATORS
// ──────────────────────────────────────────────
console.log("=== 1. DECORATORS ===");

// Cần "experimentalDecorators": true trong tsconfig.json

// Class Decorator – thêm metadata hoặc wrap constructor
function Singleton<T extends { new(...args: any[]): {} }>(constructor: T) {
  let instance: InstanceType<T> | null = null;
  return class extends constructor {
    constructor(...args: any[]) {
      if (instance) return instance as any;
      super(...args);
      instance = this as any;
    }
  };
}

@Singleton
class DatabaseConnection {
  id = Math.random().toString(36).slice(2);
  constructor(public url: string) {}
  connect() { return `Connected to ${this.url}`; }
}

const db1 = new DatabaseConnection("postgresql://localhost/mydb");
const db2 = new DatabaseConnection("postgresql://other/otherdb");
console.log("Same instance?", db1 === db2); // true (Singleton)
console.log("DB1 id:", db1.id, "| DB2 id:", db2.id); // same id

// Method Decorator – wrap method
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args: any[]) {
    console.log(`[LOG] Calling ${propertyKey}(${args.map(a => JSON.stringify(a)).join(", ")})`);
    const result = original.apply(this, args);
    console.log(`[LOG] ${propertyKey} returned:`, JSON.stringify(result));
    return result;
  };
  return descriptor;
}

function Memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  const cache = new Map<string, unknown>();
  descriptor.value = function(...args: any[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log(`[MEMO] Cache hit for ${propertyKey}(${key})`);
      return cache.get(key);
    }
    const result = original.apply(this, args);
    cache.set(key, result);
    return result;
  };
  return descriptor;
}

function Validate(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args: any[]) {
    args.forEach((arg, i) => {
      if (arg === null || arg === undefined) {
        throw new Error(`Argument ${i} of ${propertyKey} cannot be null/undefined`);
      }
    });
    return original.apply(this, args);
  };
  return descriptor;
}

// Property Decorator – thêm validation khi set
function MinValue(min: number) {
  return function(target: any, key: string) {
    let value: number;
    Object.defineProperty(target, key, {
      get() { return value; },
      set(newVal: number) {
        if (newVal < min) throw new Error(`${key} phải >= ${min}, nhận: ${newVal}`);
        value = newVal;
      },
      enumerable: true,
      configurable: true,
    });
  };
}

class Calculator {
  @MinValue(0)
  result: number = 0;

  @Log
  @Memoize
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }

  @Validate
  divide(a: number, b: number): number {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
  }
}

const calc = new Calculator();
console.log("Fibonacci(10):", calc.fibonacci(10));
console.log("Fibonacci(10) (cached):", calc.fibonacci(10));
console.log("Divide:", calc.divide(10, 3).toFixed(4));

try {
  calc.result = -1;
} catch (e) {
  console.log("MinValue error:", (e as Error).message);
}

// Parameter Decorator (metadata)
// Lưu ý: Reflect.getOwnMetadata cần package "reflect-metadata"
// Dưới đây mô phỏng cách lưu metadata thủ công
const REQUIRED_METADATA = Symbol("required");
function Required(target: any, propertyKey: string, parameterIndex: number) {
  const key = `__required_${propertyKey}`;
  const existingRequired: number[] = (target[key] as number[]) || [];
  existingRequired.push(parameterIndex);
  target[key] = existingRequired;
}

// ──────────────────────────────────────────────
// 2. SYMBOL & UNIQUE SYMBOL
// ──────────────────────────────────────────────
console.log("\n=== 2. SYMBOL & UNIQUE SYMBOL ===");

// Symbol – giá trị duy nhất, không bao giờ bằng nhau
const id1 = Symbol("id");
const id2 = Symbol("id");
console.log("id1 === id2:", Object.is(id1, id2)); // false – luôn khác nhau

// unique symbol – kiểu riêng biệt tại compile time
const TOKEN: unique symbol = Symbol("token");
type TokenType = typeof TOKEN;

// Symbol dùng như private key
const _private = Symbol("private");
class SecureStore {
  [_private]: Map<string, string> = new Map();

  set(key: string, value: string): void {
    this[_private].set(key, value);
  }

  get(key: string): string | undefined {
    return this[_private].get(key);
  }
}

const store = new SecureStore();
store.set("secret", "my-secret-value");
console.log("Store get:", store.get("secret"));

// Well-known Symbols (customize language behaviors)
class Collection<T> {
  private items: T[];

  constructor(...items: T[]) {
    this.items = items;
  }

  // Làm cho object iterable (for...of)
  [Symbol.iterator](): Iterator<T> {
    let index = 0;
    return {
      next: (): IteratorResult<T> => {
        if (index < this.items.length) {
          return { value: this.items[index++], done: false };
        }
        return { value: undefined as any, done: true };
      },
    };
  }

  // Customize instanceof behavior
  static [Symbol.hasInstance](instance: unknown): boolean {
    return Array.isArray(instance);
  }

  get [Symbol.toStringTag](): string {
    return "Collection";
  }
}

const col = new Collection(1, 2, 3, 4, 5);
const spread = [...col];
console.log("Iterable spread:", spread);

for (const item of col) {
  process.stdout.write(item + " ");
}
console.log();

// ──────────────────────────────────────────────
// 3. PROXY & REFLECT
// ──────────────────────────────────────────────
console.log("\n=== 3. PROXY & REFLECT ===");

// Type-safe Proxy wrapper
function createObservable<T extends object>(
  target: T,
  onChange: (key: keyof T, newValue: unknown, oldValue: unknown) => void
): T {
  return new Proxy(target, {
    set(obj, key, value) {
      const oldValue = Reflect.get(obj, key);
      const result = Reflect.set(obj, key, value);
      if (result && oldValue !== value) {
        onChange(key as keyof T, value, oldValue);
      }
      return result;
    },
    get(obj, key) {
      return Reflect.get(obj, key);
    },
  });
}

type AppState = {
  count: number;
  user: string | null;
  loading: boolean;
};

const state = createObservable<AppState>(
  { count: 0, user: null, loading: false },
  (key, newVal, oldVal) => {
    console.log(`State changed: "${String(key)}" ${JSON.stringify(oldVal)} → ${JSON.stringify(newVal)}`);
  }
);

state.count = 1;
state.user = "Alice";
state.loading = true;
state.count = 2;

// Validation Proxy
function createValidated<T extends object>(
  schema: Partial<Record<keyof T, (v: unknown) => boolean>>,
  data: T
): T {
  return new Proxy(data, {
    set(obj, key, value) {
      const validator = schema[key as keyof T];
      if (validator && !validator(value)) {
        throw new Error(`Validation failed for "${String(key)}": ${JSON.stringify(value)}`);
      }
      return Reflect.set(obj, key, value);
    },
  });
}

type UserForm = { name: string; age: number; email: string };
const form = createValidated<UserForm>(
  {
    name: (v) => typeof v === "string" && v.length >= 2,
    age: (v) => typeof v === "number" && v >= 0 && v <= 150,
    email: (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  },
  { name: "", age: 0, email: "" }
);

form.name = "Alice";
form.age = 25;
form.email = "alice@test.com";
console.log("Form:", form);

try {
  form.age = -5;
} catch (e) {
  console.log("Validation proxy error:", (e as Error).message);
}

// ──────────────────────────────────────────────
// 4. RECURSIVE TYPES & TYPE ARITHMETIC
// ──────────────────────────────────────────────
console.log("\n=== 4. RECURSIVE TYPES ===");

// JSON type
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

const json: JSONValue = {
  name: "TypeScript",
  version: 5,
  stable: true,
  features: ["generics", "decorators", "utility types"],
  meta: { year: 2012, creator: "Anders Hejlsberg" },
};

// Recursive tree structure
interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[];
}

function traverseTree<T>(node: TreeNode<T>, visitor: (value: T, depth: number) => void, depth = 0): void {
  visitor(node.value, depth);
  node.children?.forEach(child => traverseTree(child, visitor, depth + 1));
}

const orgChart: TreeNode<string> = {
  value: "CEO",
  children: [
    {
      value: "CTO",
      children: [
        { value: "Frontend Lead", children: [{ value: "Dev 1" }, { value: "Dev 2" }] },
        { value: "Backend Lead",  children: [{ value: "Dev 3" }, { value: "Dev 4" }] },
      ],
    },
    {
      value: "CFO",
      children: [{ value: "Accountant 1" }, { value: "Accountant 2" }],
    },
  ],
};

traverseTree(orgChart, (val, depth) =>
  console.log("  ".repeat(depth) + "└─ " + val)
);

// Deep path types (type-safe lodash.get style)
type Path<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends object
    ? K | `${K}.${Path<T[K]>}`
    : K
  : never;

type UserPath = Path<{
  name: string;
  address: {
    city: string;
    country: string;
  };
}>;
// "name" | "address" | "address.city" | "address.country"

// ──────────────────────────────────────────────
// 5. BUILDER PATTERN TYPE-SAFE
// ──────────────────────────────────────────────
console.log("\n=== 5. TYPE-SAFE BUILDER PATTERN ===");

// Dùng Generic + conditional type để enforce required fields
type BuilderState<Required extends string, Optional extends string = never> = {
  [K in Required]: unknown;
} & { [K in Optional]?: unknown };

class EmailBuilder {
  private config: {
    from?: string;
    to?: string[];
    subject?: string;
    body?: string;
    html?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: string[];
  } = {};

  setFrom(email: string): this & { _from: true } {
    this.config.from = email;
    return this as any;
  }

  addTo(...emails: string[]): this & { _to: true } {
    this.config.to = [...(this.config.to || []), ...emails];
    return this as any;
  }

  setSubject(subject: string): this & { _subject: true } {
    this.config.subject = subject;
    return this as any;
  }

  setBody(text: string, html?: string): this & { _body: true } {
    this.config.body = text;
    this.config.html = html;
    return this as any;
  }

  addCc(...emails: string[]): this {
    this.config.cc = [...(this.config.cc || []), ...emails];
    return this;
  }

  addBcc(...emails: string[]): this {
    this.config.bcc = [...(this.config.bcc || []), ...emails];
    return this;
  }

  addAttachment(path: string): this {
    this.config.attachments = [...(this.config.attachments || []), path];
    return this;
  }

  // build() chỉ available khi đã set from, to, subject, body
  build(
    this: this & { _from: true; _to: true; _subject: true; _body: true }
  ): typeof this.config {
    return { ...this.config };
  }
}

const email = new EmailBuilder()
  .setFrom("noreply@example.com")
  .addTo("alice@example.com", "bob@example.com")
  .setSubject("Welcome to TypeScript!")
  .setBody("Hello, this is text body", "<h1>Hello!</h1>")
  .addCc("manager@example.com")
  .build(); // ✅ OK vì đã set đủ 4 required fields

console.log("Email:", {
  from: email.from,
  to: email.to,
  subject: email.subject,
  cc: email.cc,
});

// ──────────────────────────────────────────────
// 6. DEPENDENCY INJECTION PATTERN
// ──────────────────────────────────────────────
console.log("\n=== 6. DEPENDENCY INJECTION ===");

// Interfaces (contracts)
interface ILogger {
  log(message: string): void;
  error(message: string): void;
}

interface IStorage<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  delete(key: string): void;
  has(key: string): boolean;
}

interface IEmailSender {
  send(to: string, subject: string, body: string): Promise<boolean>;
}

// Implementations
class ConsoleLogger implements ILogger {
  log(message: string): void { console.log(`  [LOG] ${message}`); }
  error(message: string): void { console.error(`  [ERR] ${message}`); }
}

class MemoryStorage<T> implements IStorage<T> {
  private store = new Map<string, T>();
  get(key: string) { return this.store.get(key); }
  set(key: string, value: T) { this.store.set(key, value); }
  delete(key: string) { this.store.delete(key); }
  has(key: string) { return this.store.has(key); }
}

class MockEmailSender implements IEmailSender {
  private sent: Array<{ to: string; subject: string }> = [];
  async send(to: string, subject: string, body: string): Promise<boolean> {
    this.sent.push({ to, subject });
    console.log(`  [MAIL] → ${to}: "${subject}"`);
    return true;
  }
  getSentCount(): number { return this.sent.length; }
}

// Service that uses DI
class UserRegistrationService {
  constructor(
    private logger: ILogger,
    private storage: IStorage<object>,
    private emailSender: IEmailSender,
  ) {}

  async register(name: string, email: string, password: string): Promise<{ success: boolean; userId: string }> {
    this.logger.log(`Registering user: ${email}`);

    if (this.storage.has(email)) {
      this.logger.error(`Email already exists: ${email}`);
      return { success: false, userId: "" };
    }

    const userId = `user_${Date.now()}`;
    this.storage.set(email, { id: userId, name, email, password: `hashed_${password}` });
    this.logger.log(`User created: ${userId}`);

    await this.emailSender.send(email, "Chào mừng bạn!", `Chào ${name}, tài khoản của bạn đã được tạo.`);

    return { success: true, userId };
  }
}

// Simple DI Container
class Container {
  private services = new Map<string, unknown>();

  register<T>(token: string, factory: () => T): this {
    this.services.set(token, factory);
    return this;
  }

  resolve<T>(token: string): T {
    const factory = this.services.get(token);
    if (!factory || typeof factory !== "function") {
      throw new Error(`Service "${token}" not registered`);
    }
    return (factory as () => T)();
  }
}

const container: Container = new Container();
container
  .register("logger", () => new ConsoleLogger())
  .register("storage", () => new MemoryStorage<object>())
  .register("emailSender", () => new MockEmailSender())
  .register("userService", () => new UserRegistrationService(
    container.resolve<ILogger>("logger"),
    container.resolve<IStorage<object>>("storage"),
    container.resolve<IEmailSender>("emailSender"),
  ));

async function runDIDemo(): Promise<void> {
  const userService = container.resolve<UserRegistrationService>("userService");

  const r1 = await userService.register("Alice", "alice@test.com", "pass123");
  console.log("Register result:", r1);

  const r2 = await userService.register("Alice2", "alice@test.com", "pass456");
  console.log("Duplicate email:", r2.success); // false
}

runDIDemo().then(() => {
  console.log("\n✅ Bài 07 hoàn thành!");
  console.log("\n🎉 Hoàn thành toàn bộ khoá học TypeScript!");
});

export {};
