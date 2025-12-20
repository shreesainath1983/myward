import { NextResponse } from "next/server";
import supabase from "../../../../lib/supabaseServer";
import { errorMessage } from "../../errorCodes";

// POST /api/users/login
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role_id")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (!data) {
      return NextResponse.json(
        { error: errorMessage.INVALID_CREDENTIALS },
        { status: 401 }
      );
    }
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
