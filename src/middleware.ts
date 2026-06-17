import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isAdminRoute, isProtectedCustomerRoute } from "@/lib/route-guards";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // Get user from cookies with anon key
  const anonSupabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      }
    }
  });

  const {
    data: { user }
  } = await anonSupabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  if (isProtectedCustomerRoute(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Use service role key to bypass RLS for role check
    if (serviceRoleKey) {
      const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      const { data } = await adminClient
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      
      if (data?.role !== "admin") {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
