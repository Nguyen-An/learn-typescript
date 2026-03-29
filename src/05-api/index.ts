/**
 * ============================================================
 * BÀI 05: TYPESCRIPT VỚI API
 * ============================================================
 * Các chủ đề:
 *  1. Định nghĩa kiểu cho API Response
 *  2. Generic API Client
 *  3. Async/Await với TypeScript
 *  4. Error handling có kiểu
 *  5. Type-safe fetch wrapper
 *  6. Zod-style runtime validation
 *  7. Environment variables typing
 * ============================================================
 */

// ──────────────────────────────────────────────
// 1. ĐỊNH NGHĨA KIỂU CHO API RESPONSE
// ──────────────────────────────────────────────
console.log("=== 1. API TYPE DEFINITIONS ===");

// Kiểu chuẩn cho REST API response
interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  statusCode: number;
}

type ApiResult<T> = ApiSuccess<T> | ApiError;

// Domain types
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  avatar?: string;
  createdAt: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Query params type
interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
}

// ──────────────────────────────────────────────
// 2. GENERIC API CLIENT
// ──────────────────────────────────────────────
console.log("\n=== 2. API CLIENT ===");

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private token: string | null = null;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // remove trailing slash
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
  }

  setAuthToken(token: string): this {
    this.token = token;
    return this;
  }

  clearAuthToken(): this {
    this.token = null;
    return this;
  }

  private buildHeaders(): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<ApiResult<T>> {
    try {
      const url = this.buildUrl(path, params);
      const response = await fetch(url, {
        method: "GET",
        headers: this.buildHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T, B = unknown>(path: string, body: B): Promise<ApiResult<T>> {
    try {
      const response = await fetch(this.buildUrl(path), {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T, B = unknown>(path: string, body: B): Promise<ApiResult<T>> {
    try {
      const response = await fetch(this.buildUrl(path), {
        method: "PUT",
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(path: string): Promise<ApiResult<T>> {
    try {
      const response = await fetch(this.buildUrl(path), {
        method: "DELETE",
        headers: this.buildHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResult<T>> {
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        error: {
          code: `HTTP_${response.status}`,
          message: body?.message || response.statusText,
          details: body,
        },
      };
    }

    return { success: true, data: body as T };
  }

  private handleError(error: unknown): ApiError {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        statusCode: 0,
        error: { code: "NETWORK_ERROR", message: "Lỗi kết nối mạng" },
      };
    }
    return {
      success: false,
      statusCode: 500,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Lỗi không xác định",
      },
    };
  }
}

// ──────────────────────────────────────────────
// 3. SERVICE LAYER – Tầng business logic
// ──────────────────────────────────────────────
console.log("\n=== 3. SERVICE LAYER ===");

class UserService {
  constructor(private client: ApiClient) {}

  async getUsers(params?: PaginationParams): Promise<ApiResult<PaginatedResponse<User>>> {
    return this.client.get<PaginatedResponse<User>>("/users", params as Record<string, unknown>);
  }

  async getUserById(id: number): Promise<ApiResult<User>> {
    return this.client.get<User>(`/users/${id}`);
  }

  async createUser(
    data: Omit<User, "id" | "createdAt">
  ): Promise<ApiResult<User>> {
    return this.client.post<User, Omit<User, "id" | "createdAt">>("/users", data);
  }

  async updateUser(
    id: number,
    data: Partial<Omit<User, "id" | "createdAt">>
  ): Promise<ApiResult<User>> {
    return this.client.put<User>(`/users/${id}`, data);
  }

  async deleteUser(id: number): Promise<ApiResult<{ deleted: boolean }>> {
    return this.client.delete(`/users/${id}`);
  }
}

// ──────────────────────────────────────────────
// 4. ERROR HANDLING CÓ KIỂU
// ──────────────────────────────────────────────
console.log("\n=== 4. TYPE-SAFE ERROR HANDLING ===");

// Custom Error classes với kiểu
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    // Fix prototype chain cho extend Error
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: number | string) {
    super(`${resource} với id=${id} không tìm thấy`, "NOT_FOUND", 404);
  }
}

class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fields: Record<string, string[]>
  ) {
    super(message, "VALIDATION_ERROR", 422);
  }
}

class UnauthorizedError extends AppError {
  constructor() {
    super("Bạn chưa đăng nhập", "UNAUTHORIZED", 401);
  }
}

// Result type (Railway-Oriented Programming)
type Result<T, E extends Error = Error> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

function fail<E extends Error>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Sử dụng Result type
function parseUserId(raw: string): Result<number, ValidationError> {
  const id = parseInt(raw, 10);
  if (isNaN(id) || id <= 0) {
    return fail(new ValidationError("ID không hợp lệ", { id: ["ID phải là số nguyên dương"] }));
  }
  return { ok: true, value: id };
}

const r = parseUserId("abc");
if (!r.ok) {
  console.log("Lỗi validation:", r.error.message);
  console.log("Fields:", r.error.fields);
} else {
  console.log("Valid ID:", r.value);
}

const r2 = parseUserId("42");
if (r2.ok) {
  console.log("Parsed ID:", r2.value);
}

// ──────────────────────────────────────────────
// 5. MOCK API DEMO (không cần mạng)
// ──────────────────────────────────────────────
console.log("\n=== 5. MOCK API DEMO ===");

// Mock data giống JSONPlaceholder
const mockUsers: User[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin", createdAt: "2024-01-01" },
  { id: 2, name: "Bob Smith",     email: "bob@example.com",   role: "user",  createdAt: "2024-02-15" },
  { id: 3, name: "Carol White",   email: "carol@example.com", role: "moderator", createdAt: "2024-03-20" },
];

// Type-safe mock service
class MockUserService {
  private users: User[] = [...mockUsers];
  private nextId = mockUsers.length + 1;

  async findAll(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    await this.delay(50); // simulate network

    let result = [...this.users];

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.includes(q));
    }

    if (params?.sort) {
      const key = params.sort as keyof User;
      const dir = params.order === "desc" ? -1 : 1;
      result.sort((a, b) => {
        const av = String(a[key] ?? "");
        const bv = String(b[key] ?? "");
        return av.localeCompare(bv) * dir;
      });
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);
    const totalPages = Math.ceil(result.length / limit);

    return {
      data: paginated,
      total: result.length,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findById(id: number): Promise<User> {
    await this.delay(30);
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundError("User", id);
    return user;
  }

  async create(data: Omit<User, "id" | "createdAt">): Promise<User> {
    await this.delay(100);
    const newUser: User = {
      ...data,
      id: this.nextId++,
      createdAt: new Date().toISOString().split("T")[0],
    };
    this.users.push(newUser);
    return newUser;
  }

  async update(id: number, data: Partial<Omit<User, "id" | "createdAt">>): Promise<User> {
    await this.delay(80);
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new NotFoundError("User", id);
    this.users[idx] = { ...this.users[idx], ...data };
    return this.users[idx];
  }

  async delete(id: number): Promise<void> {
    await this.delay(60);
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new NotFoundError("User", id);
    this.users.splice(idx, 1);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ──────────────────────────────────────────────
// 6. RUNTIME DEMO (async/await)
// ──────────────────────────────────────────────
async function runApiDemo(): Promise<void> {
  const service = new MockUserService();

  // findAll với pagination
  const page1 = await service.findAll({ page: 1, limit: 2 });
  console.log("Page 1:", page1.data.map(u => u.name));
  console.log("Total:", page1.total, "| Has next:", page1.hasNext);

  // Search
  const searched = await service.findAll({ search: "alice" });
  console.log("Search 'alice':", searched.data.map(u => u.name));

  // findById
  const user = await service.findById(1);
  console.log("\nUser #1:", user.name, "-", user.role);

  // Create
  const newUser = await service.create({
    name: "Dave Brown",
    email: "dave@example.com",
    role: "user",
  });
  console.log("\nCreated:", newUser.name, "(id:", newUser.id + ")");

  // Update
  const updated = await service.update(newUser.id, { role: "moderator" });
  console.log("Updated role:", updated.role);

  // Delete
  await service.delete(newUser.id);
  console.log("Deleted user", newUser.id);

  // Error handling
  try {
    await service.findById(999);
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.log("\nError caught:", error.message, `(${error.code})`);
    }
  }
}

// ──────────────────────────────────────────────
// 7. ENVIRONMENT VARIABLES TYPING
// ──────────────────────────────────────────────
console.log("\n=== 7. ENV TYPING ===");

// Khai báo kiểu cho process.env (thường để trong env.d.ts)
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    API_BASE_URL?: string;
    API_TIMEOUT?: string;
    JWT_SECRET?: string;
    DB_HOST?: string;
    DB_PORT?: string;
    DB_NAME?: string;
  }
}

// Safe env reader với validation
function getEnv(key: keyof NodeJS.ProcessEnv, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable "${key}" is required but not set`);
  }
  return value;
}

function getEnvNumber(key: keyof NodeJS.ProcessEnv, defaultValue?: number): number {
  const raw = process.env[key];
  if (raw === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable "${key}" is required`);
  }
  const num = parseInt(raw, 10);
  if (isNaN(num)) throw new Error(`Environment variable "${key}" must be a number`);
  return num;
}

const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  apiBaseUrl: getEnv("API_BASE_URL", "https://api.example.com"),
  apiTimeout: getEnvNumber("API_TIMEOUT", 5000),
};

console.log("Environment:", env);

// Run demo
runApiDemo().then(() => {
  console.log("\n✅ Bài 05 hoàn thành!");
});

export {};
