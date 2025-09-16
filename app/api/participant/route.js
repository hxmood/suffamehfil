// app/api/participant/route.js
import { connectMongoDb } from "@/libs/connection";
import Participant from "@/models/Participant";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    await connectMongoDb();
    
    // Find all participants and populate the team information
    const participants = await Participant.find().populate('team', 'name');
    
    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
};

// app/api/participants/route.js




export const POST = async (req) => {
  await connectMongoDb();
  const body = await req.json();
  const { name, category, team } = body;

  if (!name || !category || !team) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    // Check for existing participant with same name, team and category
    const existingParticipant = await Participant.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case insensitive match
      team,
      category
    });

    if (existingParticipant) {
      return NextResponse.json(
        { error: "Participant with this name already exists in the same team and category" },
        { status: 409 }
      );
    }

    const participant = await Participant.create({ name, category, team });
    return NextResponse.json(
      { message: 'Participant registered', participant },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
};