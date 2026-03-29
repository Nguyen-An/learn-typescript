/**
 * ============================================================
 * BÀI 03: FUNCTIONS & OBJECTS NÂNG CAO
 * ============================================================
 * Các chủ đề:
 *  1. Function Overloading
 *  2. Rest & Spread trong TypeScript
 *  3. This & Method Chaining
 *  4. Classes nâng cao
 *  5. Abstract Classes & Interfaces
 *  6. Mixins
 *  7. Object Destructuring & Typing
 * ============================================================
 */

// ──────────────────────────────────────────────
// 1. FUNCTION SIGNATURES & OVERLOADING
// ──────────────────────────────────────────────
console.log("=== 1. FUNCTION OVERLOADING ===");

// Function type annotations đầy đủ
type MathOp = (a: number, b: number) => number;
const multiply: MathOp = (a, b) => a * b;

// Optional & default parameters
function createUser(
  name: string,
  age: number,
  role: string = "user",      // default param
  email?: string               // optional param
): { name: string; age: number; role: string; email?: string } {
  return { name, age, role, ...(email && { email }) };
}
console.log(createUser("Alice", 25));
console.log(createUser("Bob", 30, "admin", "bob@example.com"));

// Function Overloading – cùng tên, khác signature
function format(value: string): string;
function format(value: number): string;
function format(value: Date): string;
function format(value: string | number | Date): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return value.toLocaleString();
  return value.toISOString().split("T")[0];
}

console.log(format("  hello world  "));        // "hello world"
console.log(format(1234567));                  // "1,234,567"
console.log(format(new Date("2024-01-15")));   // "2024-01-15"

// Overloading với object shapes
function createElement(tag: "a"): HTMLAnchorElement;
function createElement(tag: "canvas"): HTMLCanvasElement;
function createElement(tag: "table"): HTMLTableElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

// ──────────────────────────────────────────────
// 2. REST & SPREAD
// ──────────────────────────────────────────────
console.log("\n=== 2. REST & SPREAD ===");

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}
console.log("Sum:", sum(1, 2, 3, 4, 5)); // 15

// Typed rest parameters với tuple
function logWithLevel(level: "info" | "warn" | "error", ...messages: string[]): void {
  console.log(`[${level.toUpperCase()}]`, messages.join(" "));
}
logWithLevel("info", "Server", "started", "on port 3000");

// Spread với tuple types
type Args = [string, number, boolean];
function processArgs(...args: Args): string {
  const [name, age, active] = args;
  return `${name} (${age}) - ${active ? "active" : "inactive"}`;
}
console.log(processArgs("Alice", 25, true));

// ──────────────────────────────────────────────
// 3. THIS CONTEXT & METHOD CHAINING
// ──────────────────────────────────────────────
console.log("\n=== 3. THIS & METHOD CHAINING ===");

class QueryBuilder {
  private table: string = "";
  private conditions: string[] = [];
  private selectedFields: string[] = ["*"];
  private limitValue: number | null = null;

  from(table: string): this {   // trả về this để chain
    this.table = table;
    return this;
  }

  select(...fields: string[]): this {
    this.selectedFields = fields;
    return this;
  }

  where(condition: string): this {
    this.conditions.push(condition);
    return this;
  }

  limit(n: number): this {
    this.limitValue = n;
    return this;
  }

  build(): string {
    const fields = this.selectedFields.join(", ");
    let query = `SELECT ${fields} FROM ${this.table}`;
    if (this.conditions.length > 0) {
      query += ` WHERE ${this.conditions.join(" AND ")}`;
    }
    if (this.limitValue !== null) {
      query += ` LIMIT ${this.limitValue}`;
    }
    return query;
  }
}

const query = new QueryBuilder()
  .from("users")
  .select("id", "name", "email")
  .where("age > 18")
  .where("active = true")
  .limit(10)
  .build();

console.log("SQL:", query);

// this parameter type (chỉ định kiểu của this)
interface Timer {
  seconds: number;
  start(this: Timer): void;
}
const timer: Timer = {
  seconds: 0,
  start(this: Timer) {
    console.log("Timer started, seconds:", this.seconds);
  },
};
timer.start();

// ──────────────────────────────────────────────
// 4. CLASSES NÂNG CAO
// ──────────────────────────────────────────────
console.log("\n=== 4. CLASSES NÂNG CAO ===");

// Access modifiers: public, private, protected, readonly
class BankAccount {
  readonly accountNumber: string;
  private _balance: number;
  protected owner: string;
  public currency: string;

  constructor(owner: string, initialBalance: number = 0) {
    this.accountNumber = `ACC-${Date.now()}`;
    this._balance = initialBalance;
    this.owner = owner;
    this.currency = "VND";
  }

  // Getter/Setter
  get balance(): number {
    return this._balance;
  }

  set balance(amount: number) {
    if (amount < 0) throw new Error("Số dư không được âm");
    this._balance = amount;
  }

  deposit(amount: number): this {
    if (amount <= 0) throw new Error("Số tiền phải dương");
    this._balance += amount;
    return this;
  }

  withdraw(amount: number): this {
    if (amount > this._balance) throw new Error("Không đủ số dư");
    this._balance -= amount;
    return this;
  }

  toString(): string {
    return `[${this.accountNumber}] ${this.owner}: ${this._balance.toLocaleString()} ${this.currency}`;
  }
}

class SavingsAccount extends BankAccount {
  private interestRate: number;

  constructor(owner: string, initialBalance: number, interestRate: number) {
    super(owner, initialBalance);
    this.interestRate = interestRate;
  }

  applyInterest(): this {
    const interest = this.balance * this.interestRate;
    this.deposit(interest);
    console.log(`Lãi suất ${(this.interestRate * 100).toFixed(1)}%: +${interest.toLocaleString()}`);
    return this;
  }
}

const account = new BankAccount("Nguyen Van A", 1_000_000);
account.deposit(500_000).deposit(250_000);
account.withdraw(100_000);
console.log(account.toString());

const savings = new SavingsAccount("Le Thi B", 10_000_000, 0.05);
savings.applyInterest();
console.log(savings.toString());

// Static members
class MathHelper {
  static readonly PI = Math.PI;
  private static _instanceCount = 0;

  constructor() {
    MathHelper._instanceCount++;
  }

  static circle(r: number): { area: number; circumference: number } {
    return {
      area: MathHelper.PI * r ** 2,
      circumference: 2 * MathHelper.PI * r,
    };
  }

  static get instanceCount(): number {
    return MathHelper._instanceCount;
  }
}

const c = MathHelper.circle(5);
console.log(`Circle r=5: area=${c.area.toFixed(2)}, circumference=${c.circumference.toFixed(2)}`);

// ──────────────────────────────────────────────
// 5. ABSTRACT CLASSES & INTERFACES
// ──────────────────────────────────────────────
console.log("\n=== 5. ABSTRACT CLASSES ===");

// Abstract class – không thể instantiate trực tiếp
abstract class Shape {
  abstract area(): number;
  abstract perimeter(): number;

  // Concrete method – dùng chung cho tất cả subclass
  describe(): string {
    return `Hình ${this.constructor.name}: diện tích=${this.area().toFixed(2)}, chu vi=${this.perimeter().toFixed(2)}`;
  }

  // Abstract static method (TypeScript 4.2+)
  abstract toString(): string;
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }
  area(): number { return Math.PI * this.radius ** 2; }
  perimeter(): number { return 2 * Math.PI * this.radius; }
  toString(): string { return `Circle(r=${this.radius})`; }
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }
  area(): number { return this.width * this.height; }
  perimeter(): number { return 2 * (this.width + this.height); }
  toString(): string { return `Rectangle(${this.width}x${this.height})`; }
}

const shapes: Shape[] = [new Circle(5), new Rectangle(4, 6)];
shapes.forEach(s => console.log(s.describe()));

// Interface vs Abstract class:
// - Interface: chỉ khai báo, không có implementation, không có state
// - Abstract class: có thể có implementation & state, dùng khi cần share logic

// ──────────────────────────────────────────────
// 6. MIXINS – Kết hợp nhiều class
// ──────────────────────────────────────────────
console.log("\n=== 6. MIXINS ===");

// Mixin pattern: thêm behaviour từ nhiều nguồn
type Constructor<T = {}> = new (...args: any[]) => T;

function Serializable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    serialize(): string {
      return JSON.stringify(this);
    }
    static deserialize<T>(data: string): T {
      return JSON.parse(data) as T;
    }
  };
}

function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt: Date = new Date();
    updatedAt: Date = new Date();

    touch(): this {
      this.updatedAt = new Date();
      return this;
    }
  };
}

function Activatable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    isActive: boolean = false;

    activate(): this {
      this.isActive = true;
      return this;
    }

    deactivate(): this {
      this.isActive = false;
      return this;
    }
  };
}

// Kết hợp các Mixins
class BaseUser {
  constructor(public name: string, public email: string) {}
}

const User = Activatable(Timestamped(Serializable(BaseUser)));
type UserType = InstanceType<typeof User>;

const newUser = new User("Alice", "alice@example.com");
newUser.activate();
console.log("User active:", newUser.isActive);       // true
console.log("Created at:", newUser.createdAt);
console.log("Serialized:", newUser.serialize());

// ──────────────────────────────────────────────
// 7. OBJECT DESTRUCTURING & TYPING
// ──────────────────────────────────────────────
console.log("\n=== 7. OBJECT DESTRUCTURING ===");

interface Config {
  host: string;
  port: number;
  database: {
    name: string;
    user: string;
    password: string;
  };
  options?: {
    ssl: boolean;
    timeout: number;
  };
}

// Destructuring với default values & rename
function connectDB({
  host,
  port = 5432,
  database: { name: dbName, user: dbUser },
  options: { ssl = false, timeout = 30 } = { ssl: false, timeout: 30 },
}: Config): string {
  return `Connecting to ${dbName} at ${host}:${port} (ssl=${ssl}, timeout=${timeout}s)`;
}

const dbConfig: Config = {
  host: "localhost",
  port: 5432,
  database: { name: "mydb", user: "admin", password: "secret" },
};
console.log(connectDB(dbConfig));

// Typed Object.entries / Object.keys / Object.fromEntries
type Record_<K extends string, V> = { [P in K]: V };

function mapValues<T extends Record<string, unknown>, U>(
  obj: T,
  fn: (value: T[keyof T], key: string) => U
): Record<string, U> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, fn(v as T[keyof T], k)])
  );
}

const prices = { apple: 10000, banana: 5000, orange: 15000 };
const discounted = mapValues(prices, (price) => (price as number) * 0.9);
console.log("Discounted:", discounted);

console.log("\n✅ Bài 03 hoàn thành!");

export {};
