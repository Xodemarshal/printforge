type Row = Record<string, any>;

const MOCK_DATA: Record<string, Row[]> = {
  categories: [
    {
      id: "cat-1",
      name: "Desk Accessories",
      slug: "desk-accessories",
      product_count: 2,
      image_url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=1200&fit=crop&crop=center"
    },
    {
      id: "cat-2",
      name: "Home Decor",
      slug: "home-decor",
      product_count: 2,
      image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=1200&fit=crop&crop=center"
    },
    {
      id: "cat-3",
      name: "Gaming & Tech",
      slug: "gaming-tech",
      product_count: 2,
      image_url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=1200&fit=crop&crop=center"
    },
    {
      id: "cat-4",
      name: "Outdoor & Garden",
      slug: "outdoor-garden",
      product_count: 2,
      image_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=1200&fit=crop&crop=center"
    },
    {
      id: "cat-5",
      name: "Kitchen & Dining",
      slug: "kitchen-dining",
      product_count: 2,
      image_url: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=1200&fit=crop&crop=center"
    },
    {
      id: "cat-6",
      name: "Tools & Workshop",
      slug: "tools-workshop",
      product_count: 2,
      image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=1200&fit=crop&crop=center"
    },
    {
      id: "cat-7",
      name: "Toys",
      slug: "toy",
      product_count: 3,
      image_url: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&h=1200&fit=crop&crop=center"
    }
  ],
  products: [
    {
      id: "prod-1",
      name: "Desk Lamp",
      slug: "desk-lamp",
      description: "A compact desk lamp perfect for any workspace.",
      long_description: "The Desk Lamp brings perfect illumination to your workspace. Handcrafted with attention to detail, this lamp combines functionality with aesthetic appeal.",
      price: 1499,
      category_id: "cat-1",
      image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center",
      material_info: "PLA body with LED module",
      material_options: ["PLA", "PETG"],
      color_options: ["Black", "White", "Green"],
      rating: 4.6,
      review_count: 24,
      badge: "Bestseller",
      featured: true,
      best_seller: true,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-2",
      name: "Phone Stand",
      slug: "phone-stand",
      description: "Adjustable 3D-printed phone stand for all devices.",
      long_description: "Keep your phone at the perfect viewing angle with this adjustable phone stand. Designed for stability and style.",
      price: 499,
      category_id: "cat-1",
      image_url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop&crop=center",
      material_info: "PETG recommended",
      material_options: ["PLA", "PETG", "ABS"],
      color_options: ["Black", "Blue", "Natural"],
      rating: 4.3,
      review_count: 18,
      badge: "New Arrival",
      featured: true,
      best_seller: false,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-3",
      name: "Wall Art - Forest",
      slug: "wall-art-forest",
      description: "Beautiful forest scene wall art piece",
      price: 2499,
      category_id: "cat-2",
      image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=400&fit=crop&crop=center",
      material_info: "PLA with wood fill",
      color_options: ["Natural Wood", "Black", "White"],
      rating: 4.8,
      review_count: 35,
      featured: true,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-4",
      name: "Decorative Vase",
      slug: "decorative-vase",
      description: "Modern geometric vase for home decor",
      price: 1899,
      category_id: "cat-2",
      image_url: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop&crop=center",
      material_info: "Resin",
      color_options: ["Marble White", "Matte Black", "Gold"],
      rating: 4.5,
      review_count: 22,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-5",
      name: "Controller Stand",
      slug: "controller-stand",
      description: "Gaming controller display stand",
      price: 799,
      category_id: "cat-3",
      image_url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop&crop=center",
      material_info: "PLA",
      color_options: ["Black", "Red", "Blue"],
      rating: 4.7,
      review_count: 42,
      best_seller: true,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-6",
      name: "Headphone Holder",
      slug: "headphone-holder",
      description: "Wall-mounted headphone display holder",
      price: 599,
      category_id: "cat-3",
      image_url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop&crop=center",
      material_info: "PETG",
      color_options: ["Black", "White", "Grey"],
      rating: 4.4,
      review_count: 28,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-7",
      name: "Garden Planter",
      slug: "garden-planter",
      description: "Weather-resistant outdoor planter",
      price: 1299,
      category_id: "cat-4",
      image_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center",
      material_info: "PETG UV-resistant",
      color_options: ["Green", "Terracotta", "Grey"],
      rating: 4.6,
      review_count: 19,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-8",
      name: "Bird Feeder",
      slug: "bird-feeder",
      description: "Decorative hanging bird feeder",
      price: 899,
      category_id: "cat-4",
      image_url: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop&crop=center",
      material_info: "PETG",
      color_options: ["Green", "Brown", "Red"],
      rating: 4.3,
      review_count: 15,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-9",
      name: "Spice Rack",
      slug: "spice-rack",
      description: "Compact countertop spice organizer",
      price: 1199,
      category_id: "cat-5",
      image_url: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop&crop=center",
      material_info: "PLA",
      color_options: ["White", "Black", "Natural"],
      rating: 4.5,
      review_count: 31,
      featured: true,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-10",
      name: "Utensil Holder",
      slug: "utensil-holder",
      description: "Modern kitchen utensil organizer",
      price: 699,
      category_id: "cat-5",
      image_url: "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=400&h=400&fit=crop&crop=center",
      material_info: "PLA",
      color_options: ["White", "Grey", "Blue"],
      rating: 4.2,
      review_count: 12,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-11",
      name: "Tool Organizer",
      slug: "tool-organizer",
      description: "Wall-mounted workshop tool holder",
      price: 1599,
      category_id: "cat-6",
      image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop&crop=center",
      material_info: "PETG",
      color_options: ["Black", "Grey", "Orange"],
      rating: 4.7,
      review_count: 26,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-12",
      name: "Measuring Tool Holder",
      slug: "measuring-tool-holder",
      description: "Magnetic measuring tape holder",
      price: 499,
      category_id: "cat-6",
      image_url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop&crop=center",
      material_info: "PLA",
      color_options: ["Yellow", "Red", "Black"],
      rating: 4.4,
      review_count: 14,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-13",
      name: "Action Figure - Forest Guardian",
      slug: "action-figure-forest-guardian",
      description: "Articulated 3D printed action figure",
      price: 1999,
      category_id: "cat-7",
      image_url: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop&crop=center",
      material_info: "Premium Resin",
      color_options: ["Green", "Brown", "Grey"],
      rating: 4.9,
      review_count: 48,
      badge: "Bestseller",
      featured: true,
      best_seller: true,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-14",
      name: "Mini Robot Figure",
      slug: "mini-robot-figure",
      description: "Cute articulated robot collectible",
      price: 1299,
      category_id: "cat-7",
      image_url: "https://images.unsplash.com/photo-1563207153-f403bf289096?w=400&h=400&fit=crop&crop=center",
      material_info: "PLA multi-color",
      color_options: ["Red", "Blue", "Silver"],
      rating: 4.7,
      review_count: 36,
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-15",
      name: "Dragon Figurine",
      slug: "dragon-figurine",
      description: "Detailed fantasy dragon sculpture",
      price: 2499,
      category_id: "cat-7",
      image_url: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=400&h=400&fit=crop&crop=center",
      material_info: "Resin hand-painted",
      color_options: ["Green", "Red", "Black"],
      rating: 4.8,
      review_count: 42,
      featured: true,
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
  settings: [
    {
      id: "setting-site-settings",
      key: "site_settings",
      value: {
        siteName: "Forest Foundry",
        logoUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=groot&backgroundColor=2c3e2d",
        hero: {
          title: "Ideas",
          coloredTitle: "Take Shape.",
          subtitle: "Premium Products",
          description: "Transform your ideas into stunning physical products with our premium design services and marketplace.",
          buttonText: "Explore Products",
          imageUrl: "https://picsum.photos/seed/wooden-guardian-hero/1400/1600",
          showcaseTitle: "Custom Product",
          showcaseItalic: "Design Made Easy",
          featuredItems: [
            { img: "https://picsum.photos/seed/wooden-guardian-collection-1/900/1200", label: "Fantasy Resin Mask", tag: "Classical Resin" },
            { img: "https://picsum.photos/seed/wooden-guardian-collection-2/900/1200", label: "Premium Rocin", tag: "Premium Finish" },
            { img: "https://picsum.photos/seed/wooden-guardian-collection-3/900/1200", label: "Custom Keyboard", tag: "Desk Collectible" },
            { img: "https://picsum.photos/seed/wooden-guardian-collection-4/900/1200", label: "Hand-carved Wood", tag: "Limited Series" }
          ]
        }
      }
    }
  ]
};

MOCK_DATA.products = (MOCK_DATA.products ?? []).map((product) => ({
  shipping_weight_grams: 250,
  shipping_length_cm: 20,
  shipping_width_cm: 15,
  shipping_height_cm: 10,
  ...product
}));

MOCK_DATA.orders = (MOCK_DATA.orders ?? []).map((order) => ({
  payment_method: "cod",
  shipping_provider: "shiprocket",
  shiprocket_status: "not_generated",
  shiprocket_pickup_status: "not_picked_up",
  shiprocket_tracking_events: [],
  shiprocket_payload: {},
  parcel_weight_grams: 250,
  parcel_length_cm: 20,
  parcel_width_cm: 15,
  parcel_height_cm: 10,
  ...order
}));

function clone<T>(value: T): T {
  return structuredClone(value);
}

class MockQuery {
private filters: Array<{
  key: string;
  value: unknown;
op:
  | "eq"
  | "gte"
  | "lte"
  | "gt"
  | "lt"
  | "ilike"
  | "in"
  | "or"
  | "is";
}> = [];
  private limitCount: number | null = null;
  private sort: { key: string; ascending: boolean } | null = null;
  private mode: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: Row[] | Row | null = null;
  private countOption: string | null = null;
  private isHead = false;

  constructor(private table: string, private isSingle = false) { }

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
or(filter: string) {
  this.filters.push({
    key: "__or__",
    value: filter,
    op: "or"
  });

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

  ilike(key: string, pattern: string) {
    this.filters.push({ key, value: pattern, op: "ilike" });
    return this;
  }

  is(key: string, value: unknown) {
  this.filters.push({
    key,
    value,
    op: "is"
  });

  return this;
}
  lte(key: string, value: unknown) {
  this.filters.push({
    key,
    value,
    op: "lte"
  });

  return this;
}

gt(key: string, value: unknown) {
  this.filters.push({
    key,
    value,
    op: "gt"
  });

  return this;
}




  order(key: string, opts?: { ascending?: boolean }) {
    this.sort = { key, ascending: opts?.ascending ?? true };
    return this;
  }
  in(key: string, values: unknown[]) {
    this.filters.push({
      key,
      value: values,
      op: "in"
    });
    return this;
  }
  not(key: string, op: string, value: unknown) {
    this.filters.push({ key, value, op: "eq" });
    return this;
  }
  filter(key: string, op: string, value: unknown) {
    this.filters.push({ key, value, op: "eq" });
    return this;
  }
  neq(key: string, value: unknown) {
    this.filters.push({ key, value, op: "eq" });
    return this;
  }
  like(key: string, pattern: string) {
    this.filters.push({ key, value: pattern, op: "ilike" });
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
        ...(this.table === "products" ? {
          shipping_weight_grams: 250,
          shipping_length_cm: 20,
          shipping_width_cm: 15,
          shipping_height_cm: 10
        } : {}),
        ...(this.table === "orders" ? {
          payment_method: "cod",
          shipping_provider: "shiprocket",
          shiprocket_status: "not_generated",
          shiprocket_pickup_status: "not_picked_up",
          shiprocket_tracking_events: [],
          shiprocket_payload: {},
          parcel_weight_grams: 250,
          parcel_length_cm: 20,
          parcel_width_cm: 15,
          parcel_height_cm: 10
        } : {}),
        ...item
      }));
      MOCK_DATA[this.table] = [...rows, ...inserted];
      return { data: this.isSingle ? inserted[0] ?? null : inserted, error: null };
    }

    if (this.mode === "upsert") {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      for (const item of items) {
        const index = rows.findIndex((row) => {
          if (item.id && row.id === item.id) return true;
          if (item.key && row.key === item.key) return true;
          return false;
        });
        if (index >= 0) {
          rows[index] = { ...rows[index], ...item };
        } else {
          rows.push({
            id: item.id ?? `${this.table}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            ...(this.table === "products" ? {
              shipping_weight_grams: 250,
              shipping_length_cm: 20,
              shipping_width_cm: 15,
              shipping_height_cm: 10
            } : {}),
            ...(this.table === "orders" ? {
              payment_method: "cod",
              shipping_provider: "shiprocket",
              shiprocket_status: "not_generated",
              shiprocket_pickup_status: "not_picked_up",
              shiprocket_tracking_events: [],
              shiprocket_payload: {},
              parcel_weight_grams: 250,
              parcel_length_cm: 20,
              parcel_width_cm: 15,
              parcel_height_cm: 10
            } : {}),
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
        case "ilike":
          if (typeof value !== 'string') return false;
          const pattern = String(filter.value).replace(/%/g, '.*').toLowerCase();
          return new RegExp(pattern).test(value.toLowerCase());
        default:
          return true;
      }
    });
  }
}

class MockStorageBucket {
  constructor(private bucket: string) { }

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

  async exchangeCodeForSession(code: string) {
    console.log("Mock code exchange for session:", code);
    return { data: { session: null, user: null }, error: null };
  }
}

export function createMockSupabaseClient() {
  return {
    from(table: string) {
      return new MockQuery(table);
    },
    storage: new MockStorage(),
    auth: new MockAuth(),
    rpc(fn: string, params?: any) {
      console.log(`Mock RPC call: ${fn}`, params);
      return Promise.resolve({ data: null, error: null });
    }
  };
}
export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const mockData = MOCK_DATA;
