import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Find user by email
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching user:", fetchError);
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    if (!users) {
      return NextResponse.json(
        { success: false, error: "User not found with that email" },
        { status: 404 }
      );
    }

    // Update user role to admin
    const { error: updateError } = await supabase
      .from("users")
      .update({ role: "admin" })
      .eq("id", users.id);

    if (updateError) {
      console.error("Error updating user:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} is now an admin`
    });
  } catch (error: any) {
    console.error("Make admin error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
