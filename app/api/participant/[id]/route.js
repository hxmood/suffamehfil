// app/api/participant/[id]/route.js
import { connectMongoDb } from "@/libs/connection";
import Participant from "@/models/Participant";
import { NextResponse } from "next/server";

// GET single participant
export const GET = async (request, { params }) => {
  try {
    await connectMongoDb();
    
    const participant = await Participant.findById(params.id).populate('team', 'name');
    
    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error fetching participant:", error);
    return NextResponse.json(
      { error: "Failed to fetch participant" },
      { status: 500 }
    );
  }
};

// UPDATE participant
export const PUT = async (request, { params }) => {
  await connectMongoDb();
  const body = await request.json();
  const { name, category, team } = body;

  if (!name || !category || !team) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    // Check for duplicate names in the same team and category
    const existingParticipant = await Participant.findOne({
      _id: { $ne: params.id }, // Exclude current participant
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      team,
      category
    });

    if (existingParticipant) {
      return NextResponse.json(
        { error: "Participant with this name already exists in the same team and category" },
        { status: 409 }
      );
    }

    const updatedParticipant = await Participant.findByIdAndUpdate(
      params.id,
      { name, category, team },
      { new: true }
    ).populate('team', 'name');

    if (!updatedParticipant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Participant updated', participant: updatedParticipant },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating participant:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
};

// DELETE participant
export const DELETE = async (request, { params }) => {
  try {
    await connectMongoDb();
    
    const deletedParticipant = await Participant.findByIdAndDelete(params.id);
    
    if (!deletedParticipant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Participant deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting participant:", error);
    return NextResponse.json(
      { error: "Failed to delete participant" },
      { status: 500 }
    );
  }
};