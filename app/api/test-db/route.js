// app/api/test-db/route.ts
import { connectMongoDb } from "@/libs/connection";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDb();
    return NextResponse.json({ status: "connected" });
  } catch (err) {
    return NextResponse.json({ status: "failed", error: err }, { status: 500 });
  }
}
