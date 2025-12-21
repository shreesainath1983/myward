import { NextResponse } from "next/server";
import supabase from "../../../lib/supabaseServer";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const epicNo = searchParams.get("epicNo");

    if (!epicNo) {
      return NextResponse.json(
        { error: "epicNo is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("voterdata")
      .select("*")
      .ilike("Epic", `${epicNo}%`)
      .single();

    if (error) {
      return NextResponse.json({ error: "Voter not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
