type Row = Record<string, any>;

const MOCK_DATA: Record<string, Row[]> = {
  categories: [
    { 
      id: "cat-1", 
      name: "Desk Accessories", 
      slug: "desk-accessories",
      image_url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=1200&fit=crop&crop=center"
    },
    { 
      id: "cat-2", 
      name: "Gadgets", 
      slug: "gadgets",
      image_url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=1200&fit=crop&crop=center"
    }
  ],
  products: [
    {
      id: "prod-1",
      name: "Desk Lamp",
      slug: "desk-lamp",
      description: "A compact desk lamp.",
      price: 1499,
      category_id: "cat-1",
      image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center",
      video_url: null,
      model_url: null,
      material_info: "PLA body with LED module",
      color_options: ["Black", "White"],
      specifications: { height: "28cm", power: "5W" },
      rating: 4.6,
      review_count: 12,
      featured: true,
      best_seller: true,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-2",
      name: "Phone Stand",
      slug: "phone-stand",
      description: "Adjustable 3D-printed phone stand.",
      price: 499,
      category_id: "cat-1",
      image_url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop&crop=center",
      video_url: null,
      model_url: null,
      material_info: "PETG recommended",
      color_options: ["Gray", "Blue"],
      specifications: { tilt: "45°" },
      rating: 4.3,
      review_count: 8,
      featured: true,
      best_seller: false,
      active: true,
      created_at: new Date().toISOString()
    }
  ],
  users: [
    { id: "user-1", name: "Sample Customer", email: "customer@example.com", role: "customer" },
    { id: "admin-1", name: "Sample Admin", email: "admin@example.com", role: "admin" }
  ],
  addresses: [],
  coupons: [
    {
      id: "coupon-1",
      code: "WELCOME10",
      discount_type: "percentage",
      discount_value: 10,
      expires_at: null,
      usage_limit: 100,
      times_used: 0,
      min_order_total: 0,
      active: true
    }
  ],
  orders: [],
  order_items: [],
  reviews: [
    { id: "rev-1", user_id: "user-1", product_id: "prod-1", rating: 5, comment: "Solid print quality.", approved: true, hidden: false }
  ],
  wishlists: [],
  stl_uploads: [],
  print_jobs: [],
  inventory: [
    { id: "inv-1", material: "PLA", quantity: 50, threshold: 10, unit: "kg" },
    { id: "inv-2", material: "PETG", quantity: 40, threshold: 10, unit: "kg" },
    { id: "inv-3", material: "Resin", quantity: 25, threshold: 5, unit: "kg" }
  ],
  inventory_logs: [],
  analytics_events: [],
  notifications: [],
  support_tickets: [],
  settings: []
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

class MockQuery {
  private filters: Array<{ key: string; value: unknown; op: "eq" | "gte" | "lt" }> = [];
  private limitCount: number | null = null;
  private sort: { key: string; ascending: boolean } | null = null;
  private mode: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: Row[] | Row | null = null;
  private countOption: string | null = null;
  private isHead = false;

  constructor(private table: string, private isSingle = false) {}

  select(columns = "*", opts?: { count?: string; head?: boolean }) {
    this.mode = "select";
    this.countOption = opts?.count ?? null;
    this.isHead = opts?.head ?? false;
    return this;
  }

  eq(key: string, value: unknown) {
    this.filters.push({ key, value, op: "eq" });
    return this;
  }

  gte(key: string, value: unknown) {
    this.filters.push({ key, value, op: "gte" });
    return this;
  }

  lt(key: string, value: unknown) {
    this.filters.push({ key, value, op: "lt" });
    return this;
  }

  order(key: string, opts?: { ascending?: boolean }) {
    this.sort = { key, ascending: opts?.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(payload: Row | Row[]) {
    this.mode = "insert";
    this.payload = payload;
    return this;
  }

  upsert(payload: Row | Row[]) {
    this.mode = "upsert";
    this.payload = payload;
    return this;
  }

  update(payload: Row) {
    this.mode = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.mode = "delete";
    return this;
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: null; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    const run = async () => this.execute();
    return run().then(onfulfilled, onrejected);
  }

  private execute() {
    const rows = MOCK_DATA[this.table] ?? [];

    if (this.mode === "insert") {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      const inserted = items.map((item) => ({
        id: item.id ?? `${this.table}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...item
      }));
      MOCK_DATA[this.table] = [...rows, ...inserted];
      return { data: this.isSingle ? inserted[0] ?? null : inserted, error: null };
    }

    if (this.mode === "upsert") {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      for (const item of items) {
        const index = rows.findIndex((row) => row.id === item.id);
        if (index >= 0) {
          rows[index] = { ...rows[index], ...item };
        } else {
          rows.push({
            id: item.id ?? `${this.table}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            ...item
          });
        }
      }
      MOCK_DATA[this.table] = rows;
      return { data: this.isSingle ? items[0] ?? null : items, error: null };
    }

    if (this.mode === "update") {
      const updated: Row[] = [];
      for (const row of rows) {
        if (this.matches(row)) {
          updated.push({ ...row, ...(this.payload as Row) });
        } else {
          updated.push(row);
        }
      }
      MOCK_DATA[this.table] = updated;
      const match = updated.find((row) => this.matches(row)) ?? null;
      return { data: this.isSingle ? match : updated.filter((row) => this.matches(row)), error: null };
    }

    if (this.mode === "delete") {
      MOCK_DATA[this.table] = rows.filter((row) => !this.matches(row));
      return { data: null, error: null };
    }

    let result = rows.filter((row) => this.matches(row));
    const count = result.length;

    if (this.isHead) {
      return { data: null, error: null, count };
    }

    if (this.sort) {
      result = [...result].sort((a, b) => {
        const left = a[this.sort!.key];
        const right = b[this.sort!.key];
        if (left === right) return 0;
        return this.sort!.ascending ? (left > right ? 1 : -1) : left < right ? 1 : -1;
      });
    }
    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }

    const data = this.isSingle ? result[0] ?? null : clone(result);
    return { data, error: null, count: this.countOption ? count : undefined };
  }

  private matches(row: Row) {
    return this.filters.every((filter) => {
      const value = row[filter.key];
      switch (filter.op) {
        case "eq":
          return value === filter.value;
        case "gte":
          return value >= (filter.value as any);
        case "lt":
          return value < (filter.value as any);
        default:
          return true;
      }
    });
  }
}

class MockStorageBucket {
  constructor(private bucket: string) {}

  async upload(path: string, file: File, options?: Record<string, any>) {
    return { data: { path, bucket: this.bucket, fileName: file.name, options }, error: null };
  }

  getPublicUrl(path: string) {
    return {
      data: {
        publicUrl: `https://mock.local/storage/${this.bucket}/${path}`
      }
    };
  }
}

class MockStorage {
  from(bucket: string) {
    return new MockStorageBucket(bucket);
  }
}

class MockAuth {
  async getUser() {
    return { data: { user: null }, error: null };
  }

  async signInWithPassword(credentials: { email: string; password: string }) {
    console.log("Mock login attempt:", credentials.email);
    // Simulate successful login
    const user = {
      id: `mock-user-${Date.now()}`,
      email: credentials.email,
      created_at: new Date().toISOString()
    };
    const session = {
      access_token: "mock-access-token",
      user
    };
    return { data: { user, session }, error: null };
  }

  async signUp(options: { email: string; password: string; options?: any }) {
    console.log("Mock signup attempt:", options.email);
    // Simulate successful signup
    const user = {
      id: `mock-user-${Date.now()}`,
      email: options.email,
      user_metadata: options.options?.data || {},
      created_at: new Date().toISOString()
    };
    return { data: { user }, error: null };
  }

  async signOut() {
    console.log("Mock logout");
    return { error: null };
  }

  async resetPasswordForEmail(email: string, options?: any) {
    console.log("Mock password reset for:", email);
    return { error: null };
  }
}

export function createMockSupabaseClient() {
  return {
    from(table: string) {
      return new MockQuery(table);
    },
    storage: new MockStorage(),
    auth: new MockAuth()
  };
}

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const mockData = MOCK_DATA;
