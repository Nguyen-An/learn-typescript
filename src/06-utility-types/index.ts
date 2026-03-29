/**
 * ============================================================
 * BÀI 06: UTILITY TYPES
 * ============================================================
 * TypeScript có sẵn rất nhiều Utility Types (built-in).
 * Các chủ đề:
 *  1. Partial, Required, Readonly
 *  2. Pick, Omit, Extract, Exclude
 *  3. Record, ReturnType, Parameters
 *  4. NonNullable, Awaited, InstanceType
 *  5. Template literal utilities
 *  6. Tự xây dựng Custom Utility Types
 * ============================================================
 */

// Ví dụ domain types dùng xuyên suốt
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user" | "guest";
  age?: number;
  address?: {
    street: string;
    city: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────
// 1. Partial, Required, Readonly
// ──────────────────────────────────────────────
console.log("=== 1. Partial | Required | Readonly ===");

// Partial<T> – tất cả props thành optional
type UserUpdate = Partial<User>;
const update: UserUpdate = { name: "New Name" }; // chỉ cần 1 field
console.log("Partial update:", update);

// Required<T> – tất cả props thành required (bỏ ?)
type StrictUser = Required<User>;
// StrictUser.age – bây giờ bắt buộc không còn optional

// Readonly<T> – không thể thay đổi sau khi tạo
type FrozenUser = Readonly<User>;
const frozenUser: FrozenUser = {
  id: 1, name: "Alice", email: "alice@test.com", password: "hashed",
  role: "user", createdAt: new Date(), updatedAt: new Date(),
};
// frozenUser.name = "Bob"; // ❌ Lỗi! Cannot assign to 'name' because it is a read-only

// ReadonlyArray
const immutableList: ReadonlyArray<string> = ["a", "b", "c"];
// immutableList.push("d"); // ❌ Lỗi!
console.log("Readonly array:", immutableList[0]);

// ──────────────────────────────────────────────
// 2. Pick, Omit, Extract, Exclude
// ──────────────────────────────────────────────
console.log("\n=== 2. Pick | Omit | Extract | Exclude ===");

// Pick<T, K> – chỉ lấy các keys được chỉ định
type UserPublic = Pick<User, "id" | "name" | "email" | "role">;
const publicUser: UserPublic = {
  id: 1,
  name: "Alice",
  email: "alice@test.com",
  role: "user",
};
console.log("Public user (no password):", publicUser);

// Omit<T, K> – loại bỏ các keys không muốn
type UserSafe = Omit<User, "password" | "createdAt" | "updatedAt">;
type CreateUserDto = Omit<User, "id" | "createdAt" | "updatedAt">;

// Extract<T, U> – giữ lại các kiểu trong T mà thuộc U
type AdminOrUser = Extract<User["role"], "admin" | "user">;
// "admin" | "user"

type StringOrNumber = string | number | boolean | null;
type OnlyStrOrNum = Extract<StringOrNumber, string | number>;
// string | number

console.log("Extract example works at type level");

// Exclude<T, U> – loại bỏ các kiểu trong T mà thuộc U
type NonAdmin = Exclude<User["role"], "admin">;
// "user" | "guest"

type NonNullish = Exclude<StringOrNumber, null | undefined>;
// string | number | boolean

// ──────────────────────────────────────────────
// 3. Record, ReturnType, Parameters
// ──────────────────────────────────────────────
console.log("\n=== 3. Record | ReturnType | Parameters ===");

// Record<K, V> – tạo object type với key K và value V
type RolePermissions = Record<User["role"], string[]>;
const permissions: RolePermissions = {
  admin: ["read", "write", "delete", "manage_users"],
  user: ["read", "write"],
  guest: ["read"],
};
console.log("Admin permissions:", permissions.admin);

// Record với union keys
type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
type Schedule = Record<DayOfWeek, string[]>;

const mySchedule: Schedule = {
  Mon: ["9:00 Meeting", "14:00 Code Review"],
  Tue: ["10:00 Design Review"],
  Wed: [],
  Thu: ["11:00 Demo"],
  Fri: ["15:00 Retrospective"],
  Sat: [],
  Sun: [],
};

// ReturnType<F> – lấy kiểu trả về của function
function fetchUser(id: number) {
  return { id, name: "Alice", email: "alice@test.com", role: "user" as const };
}
type FetchedUser = ReturnType<typeof fetchUser>;
// { id: number; name: string; email: string; role: "user" }

const fetched: FetchedUser = fetchUser(1);
console.log("Fetched:", fetched.name);

// Parameters<F> – lấy kiểu của tất cả tham số
function createPost(title: string, body: string, authorId: number, tags: string[]) {
  return { title, body, authorId, tags };
}
type CreatePostArgs = Parameters<typeof createPost>;
// [title: string, body: string, authorId: number, tags: string[]]

const args: CreatePostArgs = ["My Post", "Content here", 1, ["typescript", "tutorial"]];
const post = createPost(...args);
console.log("Post:", post.title);

// ──────────────────────────────────────────────
// 4. NonNullable, Awaited, InstanceType
// ──────────────────────────────────────────────
console.log("\n=== 4. NonNullable | Awaited | InstanceType ===");

// NonNullable<T> – loại bỏ null | undefined
type MaybeUser = User | null | undefined;
type DefiniteUser = NonNullable<MaybeUser>; // User

function processUser(user: MaybeUser): string {
  const u: NonNullable<MaybeUser> = user!;
  return u.name;
}

// Awaited<T> – unwrap Promise (đặc biệt hữu ích với async functions)
async function loadUser(): Promise<User> {
  return {
    id: 1, name: "Alice", email: "a@test.com", password: "x",
    role: "user", createdAt: new Date(), updatedAt: new Date(),
  };
}
type LoadedUser = Awaited<ReturnType<typeof loadUser>>;
// User (không còn bọc trong Promise)

// Awaited nested
type NestedPromise = Awaited<Promise<Promise<string>>>;
// string

// InstanceType<C> – lấy kiểu instance của một class constructor
class HttpClient {
  constructor(public baseUrl: string, public timeout: number = 5000) {}
  get(path: string): Promise<unknown> { return Promise.resolve(null); }
}
type HttpClientInstance = InstanceType<typeof HttpClient>;
// HttpClient

function createClient(ctor: typeof HttpClient, url: string): HttpClientInstance {
  return new ctor(url);
}
const client = createClient(HttpClient, "https://api.example.com");
console.log("Client:", client.baseUrl);

// ──────────────────────────────────────────────
// 5. TEMPLATE LITERAL UTILITIES
// ──────────────────────────────────────────────
console.log("\n=== 5. TEMPLATE LITERAL UTILITIES ===");

// Uppercase<S>, Lowercase<S>, Capitalize<S>, Uncapitalize<S>

type UpperRole = Uppercase<User["role"]>;             // "ADMIN" | "USER" | "GUEST"
type LowerEmail = Lowercase<"HELLO@EXAMPLE.COM">;     // "hello@example.com"
type TitleName = Capitalize<"alice johnson">;          // "Alice johnson"
type CamelCase = Uncapitalize<"UserName">;             // "userName"

// Practical: tạo event names từ resource names
type Resource = "user" | "post" | "comment";
type CRUDEvent = `${Resource}:${"created" | "updated" | "deleted"}`;
// "user:created" | "user:updated" | "user:deleted" | "post:created" | ...

type EventMap = Record<CRUDEvent, (id: number) => void>;

const eventHandlers: Partial<EventMap> = {
  "user:created": (id) => console.log(`User ${id} created`),
  "post:deleted": (id) => console.log(`Post ${id} deleted`),
};

eventHandlers["user:created"]?.(42);
eventHandlers["post:deleted"]?.(7);

// ──────────────────────────────────────────────
// 6. CUSTOM UTILITY TYPES TỰ XÂY DỰNG
// ──────────────────────────────────────────────
console.log("\n=== 6. CUSTOM UTILITY TYPES ===");

// DeepPartial – Partial đệ quy
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

type PartialUser = DeepPartial<User>;
const partialUser: PartialUser = {
  name: "Alice",
  address: { city: "Hanoi" }, // không cần street và country!
};
console.log("DeepPartial:", partialUser.address?.city);

// DeepReadonly – Readonly đệ quy
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// Flatten – làm phẳng nested type
type Flatten<T> = T extends Array<infer Item> ? Item : T;
type NumberItem = Flatten<number[]>;   // number
type Str = Flatten<string>;           // string (không array)

// KeysOfType – lấy các key có value là kiểu T
type KeysOfType<Obj, Type> = {
  [K in keyof Obj]: Obj[K] extends Type ? K : never;
}[keyof Obj];

type StringKeys = KeysOfType<User, string>;
// "name" | "email" | "password" | "role"

type DateKeys = KeysOfType<User, Date>;
// "createdAt" | "updatedAt"

// OptionalKeys & RequiredKeys
type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

type UserOptionalKeys = OptionalKeys<User>; // "age" | "address"
type UserRequiredKeys = RequiredKeys<User>; // "id" | "name" | "email" | ...

// MakeOptional<T, K> – chỉ make một số key optional
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type UserWithOptionalEmail = MakeOptional<User, "email" | "age">;

// StrictOmit – đảm bảo key phải tồn tại
type StrictOmit<T, K extends keyof T> = Omit<T, K>;
// type WillFail = StrictOmit<User, "nonexistent">; // ❌ Lỗi compile

// Prettify – flatten intersection types để IDE hiển thị đẹp hơn
type Prettify<T> = { [K in keyof T]: T[K] } & {};
type PrettyUser = Prettify<Pick<User, "id" | "name"> & { extra: string }>;

// XOR – chỉ một trong hai (loại trừ việc có cả hai)
type Without<T, U> = { [K in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T & Without<U, T>) | (U & Without<T, U>);

type ByEmail = { email: string };
type ByUsername = { username: string };
type LoginInput = XOR<ByEmail, ByUsername>;

const login1: LoginInput = { email: "alice@test.com" };       // ✅
const login2: LoginInput = { username: "alice" };             // ✅
// const login3: LoginInput = { email: "a@b.c", username: "a" }; // ❌ Lỗi!
console.log("Login by email:", login1.email);
console.log("Login by username:", login2.username);

// Tuple utilities
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

type MyTuple = [string, number, boolean, Date];
type FirstEl = Head<MyTuple>;  // string
type RestEls = Tail<MyTuple>;  // [number, boolean, Date]
type LastEl = Last<MyTuple>;   // Date

console.log("\n✅ Bài 06 hoàn thành!");

export {};
