import { createAdminClient } from "@/lib/supabase/admin";
import { mockData } from "@/lib/mock-supabase";
import { AdminCategoriesClient } from "./AdminCategoriesClient";

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("categories").select("*").limit(50);
  const categories = error ? mockData.categories : data ?? [];

  return <AdminCategoriesClient categories={categories} />;
}
