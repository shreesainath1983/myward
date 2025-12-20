import { NextResponse } from "next/server";
import supabase from "../../../../lib/supabaseServer";

export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      epicNo,
      firstName,
      middleName,
      lastName,
      wing,
      roomNo,
      building,
      area,
      remark,
      userId,
    } = body;

    if (!epicNo) {
      return NextResponse.json(
        { error: "epicNo is required" },
        { status: 400 }
      );
    }

    const updateData = {
      first_name: firstName || null,
      middle_name: middleName || null,
      last_name: lastName || null,
      wing: wing || null,
      room_no: roomNo || null,
      building_name: building || null,
      area: area || null,
      remark: remark || null,
      modified_by: userId || null,
      modified_date: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("voterdata")
      .update(updateData)
      .eq("epic_no", epicNo)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update voter data" },
        { status: 400 }
      );
    }

    return NextResponse.json({ data, message: "Voter updated successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
