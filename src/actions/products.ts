"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/guards";
import { slugify, trackEvent } from "@/lib/utils";
import { filterProducts, type ProductFilterInput } from "@/lib/product-filters";
import { mockData, hasSupabaseConfig } from "@/lib/mock-supabase";

function isMissingTableError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "PGRST205");
}

function isMissingColumnError(error: unknown) {
  return Boolean(error && typeof error === "object" && "message" in error &&
    typeof (error as { message?: string }).message === "string" &&
    (error as { message: string }).message.includes("image_url"));
}

export async function getProducts(input: ProductFilterInput = {}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) {
    if (isMissingTableError(error)) {
      return filterProducts(mockData.products as any[], input);
    }
    throw error;
  }
  return filterProducts(data ?? [], input);
}

export async function getProductBySlug(slug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) {
    if (isMissingTableError(error)) {
      return (mockData.products as any[]).find((product) => product.slug === slug) ?? null;
    }
    throw error;
  }
  return data;
}

export async function getProductById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (isMissingTableError(error)) {
      return (mockData.products as any[]).find((product) => product.id === id) ?? null;
    }
    throw error;
  }
  return data;
}

export async function getFeaturedProducts() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("products").select("*").eq("featured", true).eq("active", true).limit(8);
  return data ?? (mockData.products as any[]).filter((product) => product.featured && product.active).slice(0, 8);
}

export async function getBestSellers() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("products").select("*").eq("best_seller", true).eq("active", true).limit(8);
  return data ?? (mockData.products as any[]).filter((product) => product.best_seller && product.active).slice(0, 8);
}

export async function getCategories() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true});

  if (error) {
    console.error('❌ getCategories error:', error);
    if (isMissingTableError(error)) {
      return mockData.categories as any[];
    }
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data;
}

export async function searchProducts(input: ProductFilterInput | string, userId: string | null = null) {
  const searchInput =
    typeof input === "string"
      ? { query: input }
      : {
        query: input.query,
        category: input.category,
        page: input.page
      };
  const result = await getProducts(searchInput);
  const query = typeof input === "string" ? input : input.query ?? "";
  await trackEvent("search_performed", userId, { query });
  return result;
}

async function maybeUploadImage(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const path = `products/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      upsert: false,
      contentType: file.type
    });

    if (error) {
      console.warn(`Image upload failed: ${error.message}`);
      return null;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.warn(`Image upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

async function maybeUploadMultipleImages(files: File[]) {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadPromises = files
    .filter(file => file.size > 0)
    .map(file => maybeUploadImage(file));

  const urls = await Promise.all(uploadPromises);
  return urls.filter((url): url is string => url !== null);
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const name = String(formData.get("name") ?? "");
  const slug = slugify(String(formData.get("slug") ?? name));

  const imageUrl = await maybeUploadImage(formData.get("image") as File | null);
  const galleryFiles = formData.getAll("gallery") as File[];
  const galleryUrls = await maybeUploadMultipleImages(galleryFiles);
  const videoUrl = String(formData.get("video_url") ?? "");

  const colorOptions = String(formData.get("colorOptions") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const filamentWeightGrams = Number(formData.get("filament_weight_grams") ?? 0);
  const estimatedPowerCost = Number(formData.get("estimated_power_cost") ?? 0);
  const estimatedPackagingCost = Number(formData.get("estimated_packaging_cost") ?? 0);
  const materialCost = filamentWeightGrams * 0.05;
  const estimatedTotalCost = materialCost + estimatedPowerCost + estimatedPackagingCost;

  const { error } = await supabase.from("products").insert({
    name,
    slug,
    description: String(formData.get("description") ?? ""),
    price: Math.round(Number(formData.get("price") ?? 0) * 100),
    category_id: (String(formData.get("category_id") ?? "") && String(formData.get("category_id")).length > 10)
      ? String(formData.get("category_id"))
      : null,
    image_url: imageUrl,
    gallery_urls: galleryUrls,
    video_url: videoUrl,
    material_info: String(formData.get("material_info") ?? ""),
    color_options: colorOptions,
    filament_weight_grams: filamentWeightGrams,
    estimated_power_cost: estimatedPowerCost,
    estimated_packaging_cost: estimatedPackagingCost,
    estimated_total_cost: estimatedTotalCost,
    active: formData.get("active") === "on"
  });

  if (error) {
    return { error: error.message };
  }

  await trackEvent("admin_action", null, { action: "create_product", slug });
  revalidatePath("/admin/products");
  revalidatePath("/");
  return {
    success: true,
    message: `Product "${name}" created successfully`,
    type: "create" as const
  };
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") ?? "");
  const productName = String(formData.get("name") ?? "");
  console.log("RAW CATEGORY:", formData.get("category_id"));
  console.log('=== UPDATE PRODUCT ===');
  console.log('Product ID:', id);
  console.log('Product Name:', productName);
  console.log('Category ID:', formData.get("category_id"));

  try {
    const imageUrl = await maybeUploadImage(formData.get("image") as File | null);
    const videoUrl = String(formData.get("video_url") ?? "");

    console.log('Uploaded image:', imageUrl);

    const payload: Record<string, unknown> = {
      name: productName,
      slug: slugify(String(formData.get("slug") ?? productName)),
      description: String(formData.get("description") ?? ""),
      price: Math.round(Number(formData.get("price") ?? 0) * 100),
      category_id: (String(formData.get("category_id") ?? "") && String(formData.get("category_id")).length > 10)
        ? String(formData.get("category_id"))
        : null,
      video_url: videoUrl,
      material_info: String(formData.get("material_info") ?? ""),
      color_options: String(formData.get("colorOptions") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      filament_weight_grams: Number(formData.get("filament_weight_grams") ?? 0),
      estimated_power_cost: Number(formData.get("estimated_power_cost") ?? 0),
      estimated_packaging_cost: Number(formData.get("estimated_packaging_cost") ?? 0),
      estimated_total_cost: (Number(formData.get("filament_weight_grams") ?? 0) * 0.05) + Number(formData.get("estimated_power_cost") ?? 0) + Number(formData.get("estimated_packaging_cost") ?? 0),
      active: formData.get("active") === "on"
    };

    if (imageUrl) {
      payload.image_url = imageUrl;
    }

    // Try to handle gallery_urls if column exists
    try {
      const galleryFiles = formData.getAll("gallery") as File[];
      const newGalleryUrls = await maybeUploadMultipleImages(galleryFiles);

      if (newGalleryUrls.length > 0) {
        const { data: existingProduct } = await supabase
          .from("products")
          .select("gallery_urls")
          .eq("id", id)
          .single();

        const existingGallery = existingProduct?.gallery_urls || [];
        payload.gallery_urls = [...existingGallery, ...newGalleryUrls];
      }
    } catch (galleryError) {
      console.warn('Gallery upload failed (column might not exist):', galleryError);
      // Continue without gallery update
    }

    const { error } = await supabase.from("products").update(payload).eq("id", id);

    if (error) {
      console.error('❌ Update error:', error);
      return { error: error.message };
    }

    console.log('✅ Product updated successfully');

    await trackEvent("admin_action", null, { action: "update_product", id });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/edit/${id}`);
    revalidatePath("/");
    return {
      success: true,
      message: `Product "${productName}" updated successfully`,
      type: "update" as const
    };
  } catch (error) {
    console.error('❌ Update failed with exception:', error);
    return {
      error: error instanceof Error ? error.message : 'Update failed'
    };
  }
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const productName = String(formData.get("name") ?? "Product");
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  await trackEvent("admin_action", null, { action: "delete_product", id });
  revalidatePath("/admin/products");
  revalidatePath("/");
  return {
    success: true,
    message: `Product "${productName}" deleted successfully`,
    type: "delete" as const
  };
}

export async function bulkUploadProductsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  // Parse form data to extract product information
  const formKeys = Array.from(formData.keys());

  // Group form fields by product index
  const productGroups: Record<number, any> = {};

  for (const key of formKeys) {
    const match = key.match(/products\[(\d+)\]\[(.+)\]/);
    if (match) {
      const [, indexStr, field] = match;
      const index = parseInt(indexStr);

      if (!productGroups[index]) {
        productGroups[index] = {};
      }

      if (field === 'images') {
        // Handle multiple file uploads
        const files = formData.getAll(key) as File[];
        productGroups[index][field] = files.filter(file => file.size > 0);
      } else {
        productGroups[index][field] = formData.get(key);
      }
    }
  }

  const results: { success: string[]; errors: string[] } = { success: [], errors: [] };

  // Process each product
  for (const [index, productData] of Object.entries(productGroups)) {
    try {
      const name = String(productData.name || "");
      const slug = slugify(name);
      const price = Number(productData.price || 0);
      const description = String(productData.description || "");
      const category = String(productData.category || "");
      const material = String(productData.material || "");

      if (!name || !price || !description) {
        results.errors.push(`Product ${parseInt(index) + 1}: Missing required fields`);
        continue;
      }

      // Upload first image if provided
      let imageUrl: string | null = null;
      if (productData.images && productData.images.length > 0) {
        try { 
          imageUrl = await maybeUploadImage(productData.images[0]);
        } catch (error) {
          console.error(`Image upload failed for product ${name}:`, error);
        }
      }

      // Create category if it doesn't exist
      let categoryId = null;
      if (category) {
        const categorySlug = slugify(category);
        const { data: existingCategory } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .maybeSingle();

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const { data: newCategory, error: categoryError } = await supabase
            .from("categories")
            .insert({ name: category, slug: categorySlug })
            .select("id")
            .single();

          if (!categoryError && newCategory) {
            categoryId = newCategory.id;
          }
        }
      }

      // Insert product
      const { error } = await supabase.from("products").insert({
        name,
        slug,
        description,
        price: Math.round(price * 100), // Convert to cents
        category_id: categoryId,
        image_url: imageUrl,
        material_info: material,
        color_options: [],
        active: true,
        featured: false,
        best_seller: false
      });

      if (error) {
        results.errors.push(`Product ${name}: ${error.message}`);
      } else {
        results.success.push(name);
        await trackEvent("admin_action", null, { action: "bulk_create_product", name });
      }

    } catch (error) {
      results.errors.push(`Product ${parseInt(index) + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  revalidatePath("/admin/products");

  if (results.errors.length === 0) {
    return {
      success: true,
      message: `Successfully uploaded ${results.success.length} products`
    };
  } else {
    return {
      success: results.success.length > 0,
      message: `Uploaded ${results.success.length} products. ${results.errors.length} failed.`,
      errors: results.errors
    };
  }
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const name = String(formData.get("name") ?? "");
  const slug = slugify(String(formData.get("slug") ?? name));
  const imageUrl = await maybeUploadImage(formData.get("image") as File | null);

  // Try with image_url first, fall back without it if column doesn't exist
  let { error } = await supabase.from("categories").insert({
    name,
    slug,
    image_url: imageUrl
  });

  if (error && isMissingColumnError(error)) {
    // Retry without image_url for databases that don't have the column yet
    const result = await supabase.from("categories").insert({ name, slug });
    error = result.error;
  }

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {
    success: true,
    message: `Category "${name}" created successfully${imageUrl ? "" : " (without image - please run migrations)"}`,
    type: "create" as const
  };
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");
  const imageUrl = await maybeUploadImage(formData.get("image") as File | null);

  const payload: Record<string, unknown> = {
    name,
    slug: slugify(String(formData.get("slug") ?? ""))
  };

  if (imageUrl) {
    payload.image_url = imageUrl;
  }

  // Try with image_url first, fall back without it if column doesn't exist
  let { error } = await supabase.from("categories").update(payload).eq("id", id);

  if (error && isMissingColumnError(error) && imageUrl) {
    // Retry without image_url for databases that don't have the column yet
    const fallbackPayload = {
      name: payload.name,
      slug: payload.slug
    };
    const result = await supabase.from("categories").update(fallbackPayload).eq("id", id);
    error = result.error;
  }

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {
    success: true,
    message: `Category "${name}" updated successfully${imageUrl ? "" : " (without image - please run migrations)"}`,
    type: "update" as const
  };
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") ?? "");
  const categoryName = String(formData.get("name") ?? "Category");
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {
    success: true,
    message: `Category "${categoryName}" deleted successfully`,
    type: "delete" as const
  };
}
