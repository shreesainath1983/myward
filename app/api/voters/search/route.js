import { NextResponse } from "next/server";
import supabase from "../../../../lib/supabaseServer";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const firstName = searchParams.get("firstName");
    const middleName = searchParams.get("middleName");
    const lastName = searchParams.get("lastName");

    if (!firstName && !middleName && !lastName) {
      return NextResponse.json(
        { error: "At least one name field is required" },
        { status: 400 }
      );
    }

    let query = supabase.from("voterdata").select("*");

    // Build OR conditions for Name column and individual name fields
    const conditions = [];

    if (firstName) {
      conditions.push(`F_Name.ilike.%${firstName}%`);
      conditions.push(`Name.ilike.%${firstName}%`);
    }
    if (middleName) {
      conditions.push(`M_Name.ilike.%${middleName}%`);
      conditions.push(`Name.ilike.%${middleName}%`);
    }
    if (lastName) {
      conditions.push(`L_Name.ilike.%${lastName}%`);
      conditions.push(`Name.ilike.%${lastName}%`);
    }

    // Combine all conditions with OR
    if (conditions.length > 0) {
      query = query.or(conditions.join(","));
    }

    const { data, error } = await query.limit(50);
    console.log({ data, error });

    if (error) {
      return NextResponse.json(
        { error: "Failed to search voters" },
        { status: 400 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No voters found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
