// app/api/programs/[id]/participants/route.js
import { connectMongoDb } from "@/libs/connection";
import Program from "@/models/Program";
import { NextResponse } from "next/server";

// Add participant to program
export async function POST(req, { params }) {
  await connectMongoDb();
  const { participantId, teamId } = await req.json();
  const programId = params.id;

  try {
    // Find the program
    const program = await Program.findById(programId).populate('participants.participant');
    
    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    // Check if participant is already assigned
    const isAssigned = program.participants.some(p => 
      p.participant._id.equals(participantId)
    );
    
    if (isAssigned) {
      return NextResponse.json(
        { error: "Participant is already assigned to this program" },
        { status: 400 }
      );
    }

    // For group programs, check team limit
    if (program.type === 'group') {
      const teamParticipants = program.participants.filter(
        p => p.team && p.team.equals(teamId)
      ).length;
      
      if (teamParticipants >= 2) {
        return NextResponse.json(
          { error: "Team limit reached (max 2 participants per team)" },
          { status: 400 }
        );
      }
    }

    // Add participant
    const updatedProgram = await Program.findByIdAndUpdate(
      programId,
      {
        $push: {
          participants: {
            participant: participantId,
            team: program.type === 'group' ? teamId : null
          }
        }
      },
      { new: true }
    ).populate('participants.participant').populate('participants.team');

    return NextResponse.json(
      { message: "Participant added successfully", program: updatedProgram },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error adding participant:", error);
    return NextResponse.json(
      { error: "Failed to add participant" },
      { status: 500 }
    );
  }
}
