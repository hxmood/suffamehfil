// app/api/participant/route.js
import { connectMongoDb } from "@/libs/connection";
import Participant from "@/models/Participant";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  try {
    await connectMongoDb();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const team = searchParams.get('team');
    const category = searchParams.get('category');
    
    // Build query object
    const query = {};
    if (team) query.team = team;
    if (category) query.category = category;
    
    // Find participants with optional filters
    const participants = await Participant.find(query)
      .populate('team', 'name')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
};

// ... keep your existing POST handler ...