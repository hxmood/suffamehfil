// app/api/programs/[id]/participants/[participantId]/route.js
import { connectMongoDb } from "@/libs/connection";
import Program from "@/models/Program";
import { NextResponse } from "next/server";

// Remove participant from program
export async function DELETE(req, { params }) {
  await connectMongoDb();
  const participantId = params.participantId;
  const programId = params.id;

  try {
    const updatedProgram = await Program.findByIdAndUpdate(
      programId,
      {
        $pull: {
          participants: { participant: participantId }
        }
      },
      { new: true }
    ).populate('participants.participant').populate('participants.team');

    if (!updatedProgram) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Participant removed successfully", program: updatedProgram },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error removing participant:", error);
    return NextResponse.json(
      { error: "Failed to remove participant" },
      { status: 500 }
    );
  }
}