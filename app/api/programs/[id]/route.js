// app/api/programs/[id]/route.js
import { connectMongoDb } from "@/libs/connection";
import Program from "@/models/Program";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectMongoDb();
    const { id } = await params;

    const program = await Program.findById(id)
      .populate("participants.participant")
      .populate("participants.team");

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { error: "Failed to fetch program" },
      { status: 500 }
    );
  }
}

// UPDATE program
export async function PUT(request) {
  await connectMongoDb();
  const { id } = await getParams(request);
  const { name, category, type } = await request.json();

  if (!name || !category || !type) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    // Check for duplicate program names in the same category
    const existingProgram = await Program.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name}$`, "i") },
      category,
    });

    if (existingProgram) {
      return NextResponse.json(
        {
          error:
            "A program with this name already exists in the selected category",
        },
        { status: 409 }
      );
    }

    const updatedProgram = await Program.findByIdAndUpdate(
      id,
      { name, category, type },
      { new: true }
    )
      .populate("participants.participant")
      .populate("participants.team");

    if (!updatedProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Program updated", program: updatedProgram },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE program
export async function DELETE(request) {
  try {
    await connectMongoDb();
    const { id } = await getParams(request);

    const deletedProgram = await Program.findByIdAndDelete(id);

    if (!deletedProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Program deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}
